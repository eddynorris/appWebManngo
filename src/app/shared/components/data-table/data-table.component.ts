import { Component, ChangeDetectionStrategy, input, output, ContentChild, TemplateRef } from '@angular/core';
import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { ColumnConfig, ActionConfig } from './data-table.types';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgTemplateOutlet, FontAwesomeModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends { id?: number; activo?: boolean }> {
  // --- Inputs ---
  data = input.required<T[]>();
  columns = input.required<ColumnConfig<T>[]>();
  actions = input<ActionConfig[]>([]);
  isLoading = input(false);

  // --- Outputs ---
  onAction = output<{ action: string; item: T }>();

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
    // Priorizar ID si existe, sino usar index como fallback
    return item.id !== undefined ? item.id : index;
  }
}
