import { ChangeDetectionStrategy, Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { PresentacionDisponible } from '../../../../../types/contract.types';

@Component({
  selector: 'app-product-selection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './product-selection-modal.component.html',
  styleUrl: './product-selection-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelectionModalComponent {
  // Inputs
  presentaciones = input.required<PresentacionDisponible[]>();
  isOpen = input<boolean>(false);

  // Outputs
  productSelected = output<PresentacionDisponible>();
  closeModal = output<void>();

  // Icons
  faSearch = faSearch;
  faTimes = faTimes;
  faPlus = faPlus;

  // Search state
  searchTerm = signal('');

  // Filtered products based on search
  filteredPresentaciones = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.presentaciones();
    return this.presentaciones().filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      (p.tipo ?? '').toLowerCase().includes(term)
    );
  });

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  selectProduct(presentacion: PresentacionDisponible): void {
    if (presentacion.stock_disponible === 0) return;
    this.productSelected.emit(presentacion);
    this.searchTerm.set('');
  }

  onClose(): void {
    this.searchTerm.set('');
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}
