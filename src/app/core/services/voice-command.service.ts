import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Declaración para evitar errores de tipo con la API experimental
declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

export interface VoiceCommandResponse {
    status: string;
    processed_action: string;
    data: {
        fecha?: string;
        cliente?: { id: number; nombre: string; match_type: string } | null;
        clientes_disponibles?: Array<{ id: number; nombre: string;[key: string]: any }>;
        total_clientes?: number;
        items?: Array<{
            producto_nombre_buscado: string;
            producto_id: number | null;
            producto_nombre: string;
            cantidad: number;
            precio_unitario: number;
            subtotal: number;
            stock_actual: number;
            lote_id: number;
        }>;
        pagos?: Array<{
            monto: number;
            metodo_pago: string;
            es_deposito: boolean;
        }>;
        gasto_asociado?: {
            descripcion: string;
            monto: number;
            categoria: string;
        };
        warnings?: string[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class VoiceCommandService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/voice/command`;

    isListening = signal(false);
    recognition: any;

    constructor() {
        this.initRecognition();
    }

    private initRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            console.warn('Web Speech API no soportada en este navegador.');
            return;
        }

        this.recognition.continuous = true; // Enable continuous mode
        this.recognition.lang = 'es-PE';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            console.log('VoiceCommandService: onstart');
            this.isListening.set(true);
        };

        this.recognition.onend = () => {
            console.log('VoiceCommandService: onend');
            this.isListening.set(false);
        };
    }

    startListening(): Observable<string> {
        return new Observable(observer => {
            if (!this.recognition) {
                observer.error('Reconocimiento de voz no soportado.');
                return;
            }

            let finalTranscript = '';
            let silenceTimer: any;
            let hasDetectedSpeech = false; // Track if we've detected any speech

            // Reset silence timer - only if speech has been detected
            const resetSilenceTimer = () => {
                if (silenceTimer) clearTimeout(silenceTimer);
                if (hasDetectedSpeech) {
                    silenceTimer = setTimeout(() => {
                        console.log('VoiceCommandService: Silence detected, stopping...');
                        this.recognition.stop();
                    }, 1500); // 1.5 seconds of silence AFTER speech
                }
            };

            this.recognition.onresult = (event: any) => {
                console.log('VoiceCommandService: onresult', event);

                // Mark that we've detected speech
                if (!hasDetectedSpeech) {
                    hasDetectedSpeech = true;
                    console.log('VoiceCommandService: First speech detected, starting silence timer');
                }

                resetSilenceTimer(); // Reset timer on new input

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + ' ';
                    }
                }
            };

            this.recognition.onnomatch = (event: any) => {
                console.log('VoiceCommandService: onnomatch', event);
                // Don't error immediately in continuous mode, just log
            };

            this.recognition.onerror = (event: any) => {
                console.error('VoiceCommandService: onerror', event);
                if (event.error === 'no-speech') {
                    // Ignore no-speech errors in continuous mode until timeout
                    return;
                }
                this.isListening.set(false); // Reset on error
                if (silenceTimer) clearTimeout(silenceTimer);
                observer.error(event.error);
            };

            this.recognition.onend = () => {
                console.log('VoiceCommandService: onend. Final transcript:', finalTranscript);
                if (silenceTimer) clearTimeout(silenceTimer);
                this.isListening.set(false); // Reset listening state

                if (finalTranscript.trim()) {
                    observer.next(finalTranscript.trim());
                    observer.complete();
                } else {
                    observer.error('No se detectó voz.');
                }
            };


            try {
                this.recognition.start();
                console.log('VoiceCommandService: Recognition started, waiting for speech...');
                // Don't start timer here - wait for first speech detection
            } catch (e) {
                console.error('VoiceCommandService: Error starting recognition', e);
                this.recognition.stop();
                observer.error('Error al iniciar reconocimiento. Intente de nuevo.');
            }
        });
    }


    sendCommand(transcript: string): Observable<VoiceCommandResponse> {
        console.log('VoiceCommandService: Sending command:', transcript);
        // Changed 'command' to 'text' as per backend requirement
        return this.http.post<VoiceCommandResponse>(this.apiUrl, { text: transcript })
            .pipe(
                catchError(err => {
                    console.error('VoiceCommandService: Error sending command:', err);
                    return throwError(() => err);
                })
            );
    }
}
