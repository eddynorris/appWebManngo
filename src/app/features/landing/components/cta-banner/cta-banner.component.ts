import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-cta-banner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cta-banner.component.html',
  styleUrls: ['./cta-banner.component.scss']
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
