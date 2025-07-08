import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-cta-banner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">INVOCA AL DIABLO Y MANTENTE AL DÍA</h2>
          <h3 class="cta-subtitle">CON TODAS LAS NOTICIAS MÁS CALIENTES,</h3>
          <h3 class="cta-subtitle">PROMOCIONES Y EVENTOS</h3>

          <form [formGroup]="newsletterForm" (ngSubmit)="onSubmit()" class="newsletter-form">
            <div class="form-group">
              <input
                type="email"
                formControlName="email"
                placeholder="Dirección de correo electrónico"
                class="email-input"
                [class.error]="newsletterForm.get('email')?.invalid && newsletterForm.get('email')?.touched"
              >
              <button type="submit" class="submit-btn" [disabled]="newsletterForm.invalid">
                SUSCRIBIRSE
              </button>
            </div>

            @if (newsletterForm.get('email')?.invalid && newsletterForm.get('email')?.touched) {
              <div class="error-message">
                Por favor, ingresa un email válido
              </div>
            }

            @if (isSubmitted) {
              <div class="success-message">
                ¡Gracias por suscribirte!
              </div>
            }
          </form>

          <div class="merch-section">
            <h3 class="merch-title">MERCANCÍA ASESINA</h3>
            <p class="merch-description">
              ¿Eres un creyente? ¡Ve a comprar mercancía para mostrar al mundo cuánto amas Manngo!
            </p>
            <a href="#" class="merch-btn">¡COMPRAR AHORA!</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .cta-section {
      padding: 6rem 0;
      background: linear-gradient(135deg, #000, #111);
      color: #fff;
      text-align: center;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .cta-title {
      font-size: clamp(1.8rem, 4vw, 2.5rem);
      font-weight: 900;
      color: #ff4444;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .cta-subtitle {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }

    .newsletter-form {
      margin: 3rem 0;
    }

    .form-group {
      display: flex;
      gap: 1rem;
      max-width: 500px;
      margin: 0 auto 1rem;
    }

    .email-input {
      flex: 1;
      padding: 1rem;
      border: 2px solid #333;
      border-radius: 6px;
      background: #222;
      color: #fff;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .email-input:focus {
      outline: none;
      border-color: #ff4444;
    }

    .email-input.error {
      border-color: #ff6666;
    }

    .email-input::placeholder {
      color: #999;
    }

    .submit-btn {
      padding: 1rem 2rem;
      background: #ff4444;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-weight: 700;
      font-size: 1rem;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 1px;
    }

    .submit-btn:hover:not(:disabled) {
      background: #ff6666;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 68, 68, 0.4);
    }

    .submit-btn:disabled {
      background: #666;
      cursor: not-allowed;
    }

    .error-message {
      color: #ff6666;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .success-message {
      color: #4CAF50;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1rem;
    }

    .merch-section {
      margin-top: 4rem;
      padding-top: 3rem;
      border-top: 2px solid #333;
    }

    .merch-title {
      font-size: 2.5rem;
      font-weight: 900;
      color: #ff4444;
      margin-bottom: 1rem;
      text-transform: uppercase;
    }

    .merch-description {
      font-size: 1.1rem;
      color: #ccc;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .merch-btn {
      display: inline-block;
      padding: 1rem 2rem;
      background: transparent;
      color: #ff4444;
      border: 2px solid #ff4444;
      text-decoration: none;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 6px;
      transition: all 0.3s ease;
      letter-spacing: 1px;
    }

    .merch-btn:hover {
      background: #ff4444;
      color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 68, 68, 0.4);
    }

    @media (max-width: 768px) {
      .form-group {
        flex-direction: column;
      }

      .merch-title {
        font-size: 2rem;
      }
    }
  `]
})
export class LandingCtaBannerComponent {
  newsletterForm: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.newsletterForm.valid) {
      // Aquí iría la lógica para enviar el email al backend
      console.log('Email suscrito:', this.newsletterForm.value.email);
      this.isSubmitted = true;
      this.newsletterForm.reset();

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        this.isSubmitted = false;
      }, 3000);
    }
  }
}
