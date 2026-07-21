import { Component, input, output, ContentChild, TemplateRef, signal, effect } from '@angular/core';
import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { ColumnConfig, ActionConfig } from './data-table.types';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgTemplateOutlet, FontAwesomeModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T extends { id?: number; codigo?: string } | Record<string, any>> {
  // --- Inputs ---
  data = input.required<T[]>();
  columns = input.required<ColumnConfig<T>[]>();
  actions = input<ActionConfig[]>([]);
  isLoading = input(false);
  selectable = input<boolean>(false);

  // --- Outputs ---
  onAction = output<{ action: string; item: T }>();
  selectionChange = output<T[]>();

  selectedItems = signal<T[]>([]);

  constructor() {
    effect(() => {
      // Trigger effect on data changes to reset selection
      this.data();
      this.clearSelection();
    });
  }

  clearSelection(): void {
    if (this.selectedItems().length > 0) {
      this.selectedItems.set([]);
      this.selectionChange.emit([]);
    }
  }

  toggleItem(item: T): void {
    const current = this.selectedItems();
    const index = current.findIndex(i => this.trackByFn(0, i) === this.trackByFn(0, item));
    let next: T[];
    if (index > -1) {
      next = current.filter((_, idx) => idx !== index);
    } else {
      next = [...current, item];
    }
    this.selectedItems.set(next);
    this.selectionChange.emit(next);
  }

  isSelected(item: T): boolean {
    return this.selectedItems().some(i => this.trackByFn(0, i) === this.trackByFn(0, item));
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectedItems.set([]);
      this.selectionChange.emit([]);
    } else {
      const visibleData = this.data();
      this.selectedItems.set([...visibleData]);
      this.selectionChange.emit([...visibleData]);
    }
  }

  isAllSelected(): boolean {
    const visibleData = this.data();
    if (visibleData.length === 0) return false;
    return visibleData.every(item => this.isSelected(item));
  }

  @ContentChild('customCell') customCellTemplate?: TemplateRef<any>;

  // --- Methods ---
  handleAction(action: string, item: T): void {
    this.onAction.emit({ action, item });
  }

  // Helper para obtener el valor de una celda, ahora con soporte para anidación
  getCellValue(item: T, column: ColumnConfig<T>): any {
    if (column.customRender) {
      return column.customRender(item);
    }
    // Soporte para claves anidadas (ej: 'cliente.nombre')
    return column.key.split('.').reduce((obj, key) => obj && obj[key], item as any);
  }

  // Track function mejorada para evitar problemas de renderizado infinito
  trackByFn(index: number, item: T): any {
    const itemAny = item as any;
    // Priorizar codigo, luego ID si existe, sino usar index como fallback
    return itemAny.codigo !== undefined ? itemAny.codigo :
      (itemAny.id !== undefined ? itemAny.id : index);
  }

  // Método auxiliar para verificar si un item está activo
  isItemActive(item: T): boolean {
    const itemAny = item as any;
    // Verificar primero is_active, luego activo para compatibilidad
    return itemAny?.is_active === true || itemAny?.activo === true;
  }

  // Método auxiliar para verificar si un item está inactivo
  isItemInactive(item: T): boolean {
    const itemAny = item as any;
    // Verificar primero is_active, luego activo para compatibilidad
    return itemAny?.is_active === false || (itemAny?.is_active === undefined && itemAny?.activo === false);
  }

  // Método auxiliar para obtener el texto del estado
  getStatusText(item: T): string {
    const itemAny = item as any;
    // Verificar primero is_active, luego activo para compatibilidad
    const isActive = itemAny?.is_active !== undefined ? itemAny.is_active : itemAny?.activo;
    return isActive ? 'Activo' : 'Inactivo';
  }
}
