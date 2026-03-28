import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShowError()) {
      <span class="form-field-error">{{ getErrorMessage() }}</span>
    }
  `,
})
export class FormFieldErrorComponent {
  /**
   * El control de formulario del cual se mostrarán los errores.
   */
  control = input.required<AbstractControl | null>();

  /**
   * Determina si se debe mostrar el mensaje de error.
   * Se muestra si el control es inválido y ha sido tocado o modificado.
   */
  shouldShowError(): boolean {
    const ctrl = this.control();
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  /**
   * Retorna el mensaje de error correspondiente al primer error encontrado.
   */
  getErrorMessage(): string {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return '';

    const errors = ctrl.errors;
    
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
    if (errors['max']) return `El valor máximo es ${errors['max'].max}`;
    if (errors['email']) return 'Formato de correo inválido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['pattern']) return 'Formato inválido';
    
    return 'Campo inválido';
  }
}
