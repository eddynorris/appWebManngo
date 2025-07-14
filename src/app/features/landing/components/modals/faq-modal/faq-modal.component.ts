import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-faq-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './faq-modal.component.html',
  styleUrl: './faq-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqModalComponent {
  visible = input.required<boolean>();
  close = output<void>();

  expandedItem = signal<number | null>(null);

  readonly faqData: FaqItem[] = [
    {
      id: 1,
      question: '¿Cuáles son los horarios de entrega?',
      answer: 'Realizamos entregas de lunes a sabado de 9:00 AM a 5:00 PM. Los domingos no hay servicio de entrega.',
      category: 'Entregas'
    },
    {
      id: 2,
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos pagos en efectivo, transferencias bancarias y plataformas digitales como Yape y Plin.',
      category: 'Pagos'
    },
    {
      id: 3,
      question: '¿Qué tipo de carbón venden? ¿Es de leña o vegetal?',
      answer: 'Ofrecemos carbón vegetal de alta calidad, producido a partir de maderas duras. Esto garantiza una brasa duradera y un excelente poder calorífico.',
      category: 'Productos'
    },
    {
      id: 4,
      question: '¿Sus briquetas usan químicos?',
      answer: 'No, nuestras briquetas son 100% naturales y no contienen aditivos químicos.',
      category: 'Entregas'
    },
    {
      id: 5,
      question: '¿Este carbón produce mucho humo o chispas?',
      answer: 'No, nuestro carbón es de madera dura y se quema de manera más suave, produciendo menos humo y chispas al mínimo.',
      category: 'Productos'
    }
  ];

  handleClose(): void {
    this.close.emit();
  }

  toggleExpanded(itemId: number): void {
    const currentExpanded = this.expandedItem();
    this.expandedItem.set(currentExpanded === itemId ? null : itemId);
  }

  isExpanded(itemId: number): boolean {
    return this.expandedItem() === itemId;
  }
}
