import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ColumnConfig, ActionConfig } from './data-table.types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
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
}
