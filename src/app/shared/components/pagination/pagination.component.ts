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
    const range = 2; // Number of pages to show before and after current page
    const result: (number | string)[] = [];

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    result.push(1);

    if (current > range + 2) {
      result.push('...');
    }

    const start = Math.max(2, current - range);
    const end = Math.min(total - 1, current + range);

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    if (current < total - range - 1) {
      result.push('...');
    }

    result.push(total);

    return result;
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

  isNumber(pageNum: number | string): pageNum is number {
    return typeof pageNum === 'number';
  }

  asNumber(pageNum: number | string): number {
    return pageNum as number;
  }
}
