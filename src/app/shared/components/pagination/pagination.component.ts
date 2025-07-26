import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pagination } from '../../../types/contract.types';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  pagination = input.required<Pagination>();
  pageChange = output<number>();
  perPageChange = output<number>();

  totalPages = computed(() => this.pagination().pages);
  currentPage = computed(() => this.pagination().page);

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    // Logic to create a pages array e.g., [1, '...', 4, 5, 6, '...', 10]
    // For simplicity now, let's just create an array from 1 to totalPages
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onNext(): void {
    this.goToPage(this.currentPage() + 1);
  }

  onPrevious(): void {
    this.goToPage(this.currentPage() - 1);
  }

  onPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPerPage = parseInt(target.value, 10);
    this.perPageChange.emit(newPerPage);
  }
}
