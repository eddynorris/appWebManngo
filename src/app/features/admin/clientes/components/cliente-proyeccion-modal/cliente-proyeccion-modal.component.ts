import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente } from '../../../../../types/contract.types';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-cliente-proyeccion-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
    templateUrl: './cliente-proyeccion-modal.component.html',
    styleUrl: './cliente-proyeccion-modal.component.scss'
})
export class ClienteProyeccionModalComponent {
    @Input() isVisible = false;
    @Input() set cliente(value: Cliente | null) {
        if (value) {
            this._cliente = value;
            this.initForm(value);
        }
    }
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<{ proxima_compra_manual?: string, ultimo_contacto?: string }>();

    private fb = inject(FormBuilder);

    _cliente: Cliente | null = null;
    form: FormGroup = this.fb.group({
        proxima_compra_manual: [null],
        ultimo_contacto: [null]
    });

    // Icons
    faTimes = faTimes;
    faSave = faSave;

    private initForm(cliente: Cliente): void {
        // Format dates if they exist
        // Assuming API returns ISO strings, we might need to format them for input[type="date"] and input[type="datetime-local"]

        let proximaCompra = null;
        if (cliente.proxima_compra_manual) {
            proximaCompra = cliente.proxima_compra_manual.split('T')[0];
        }

        let ultimoContacto = null;
        if (cliente.ultimo_contacto) {
            // datetime-local expects YYYY-MM-DDThh:mm
            ultimoContacto = cliente.ultimo_contacto.substring(0, 16);
        }

        this.form.patchValue({
            proxima_compra_manual: proximaCompra,
            ultimo_contacto: ultimoContacto
        });
    }

    onClose(): void {
        this.close.emit();
    }

    onSave(): void {
        if (this.form.valid) {
            const formValue = this.form.value;
            const payload: any = {};

            if (formValue.proxima_compra_manual) {
                payload.proxima_compra_manual = formValue.proxima_compra_manual;
            }

            if (formValue.ultimo_contacto) {
                // Convert datetime-local value (YYYY-MM-DDThh:mm) to ISO string or backend compatible format
                // Adding seconds if missing and ensuring it's a valid timestamp
                const date = new Date(formValue.ultimo_contacto);
                // Check if date is valid
                if (!isNaN(date.getTime())) {
                    // Send as ISO string which is standard for most backends
                    payload.ultimo_contacto = date.toISOString();
                } else {
                    // Fallback or handle invalid date if necessary, though input type prevents most
                    payload.ultimo_contacto = formValue.ultimo_contacto + ':00';
                }
            }

            this.save.emit(payload);
        }
    }

    onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            this.onClose();
        }
    }
}
