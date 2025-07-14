import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <a
      [href]="whatsappUrl()"
      target="_blank"
      rel="noopener noreferrer"
      class="whatsapp-button"
      [attr.aria-label]="'Contactar por WhatsApp: ' + phoneNumber()">
      <fa-icon [icon]="faWhatsapp"></fa-icon>
      <span class="button-text">{{ buttonText() }}</span>
    </a>
  `,
  styleUrl: './whatsapp-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsappButtonComponent {
  phoneNumber = input<string>('+51927577215'); // Default phone number
  message = input<string>('¡Hola! Me interesa conocer más sobre sus productos de carbón.');
  buttonText = input<string>('Contactar');

  faWhatsapp = faWhatsapp;

  whatsappUrl = () => {
    const encodedMessage = encodeURIComponent(this.message());
    return `https://wa.me/${this.phoneNumber()}?text=${encodedMessage}`;
  };
}
