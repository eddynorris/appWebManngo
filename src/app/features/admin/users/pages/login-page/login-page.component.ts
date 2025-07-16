import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  // Signals for state management
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { username, password } = this.loginForm.getRawValue();

    this.authService
      .login(username!, password!)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/admin']);
          } else {
            this.errorMessage.set('Usuario o contraseña incorrectos.');
          }
        },
        error: () => {
          this.errorMessage.set('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
        }
      });
  }
}
