import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  disabled = input(false);
  isLoading = input(false);
  type = input<'button' | 'submit'>('button');

  // El evento 'click' se maneja directamente en la plantilla,
  // por lo que no necesitamos un output explícito si solo propaga el click.
}
