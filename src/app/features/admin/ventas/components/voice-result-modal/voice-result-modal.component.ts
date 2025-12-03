import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faCheck, faExclamationTriangle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { VoiceCommandResponse } from '../../../../../core/services/voice-command.service';

@Component({
    selector: 'app-voice-result-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, FontAwesomeModule, ModalComponent],
    templateUrl: './voice-result-modal.component.html',
    styleUrl: './voice-result-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoiceResultModalComponent {
    @Input() open = signal(false);
    @Input() voiceData: VoiceCommandResponse['data'] | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<VoiceCommandResponse['data']>();

    faTimes = faTimes;
    faCheck = faCheck;
    faExclamationTriangle = faExclamationTriangle;
    faTrash = faTrash;

    // Local mutable state for the modal
    // We'll initialize this when voiceData changes or when modal opens
    // For simplicity, we'll just bind directly to a copy of voiceData if possible, 
    // or rely on the parent passing a fresh object. 
    // But inputs are read-only signals or values. We need a local copy.

    localData = signal<VoiceCommandResponse['data'] | null>(null);

    ngOnChanges(): void {
        if (this.voiceData) {
            // Deep copy to avoid mutating parent state directly until confirmed
            const data = JSON.parse(JSON.stringify(this.voiceData));

            // Siempre establecer la fecha actual por defecto, ignorando lo que venga del comando
            // Formato para input datetime-local: YYYY-MM-DDTHH:mm
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Ajuste zona horaria local simple
            data.fecha = now.toISOString().slice(0, 16);

            this.localData.set(data);
        }
    }

    get total(): number {
        const items = this.localData()?.items || [];
        return items.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);
    }

    removeItem(index: number): void {
        const current = this.localData();
        if (current && current.items) {
            current.items.splice(index, 1);
            this.localData.set({ ...current }); // Trigger update
        }
    }

    selectClient(clientId: number): void {
        const current = this.localData();
        if (current && current.clientes_disponibles) {
            const client = current.clientes_disponibles.find((c: any) => c.id === clientId);
            if (client) {
                this.localData.set({
                    ...current,
                    cliente: {
                        id: client.id,
                        nombre: client.nombre,
                        match_type: 'manual'
                    }
                });
            }
        }
    }

    onConfirm(): void {
        if (this.localData()) {
            this.confirm.emit(this.localData()!);
        }
    }

    onCancel(): void {
        this.close.emit();
    }
}
