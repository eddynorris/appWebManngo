import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface ColumnConfig<T> {
  key: string;
  label: string;
  type: 'text' | 'status' | 'image' | 'currency' | 'actions' | 'date' | 'custom';
  // Opcional para un renderizado personalizado si es necesario
  customRender?: (item: T) => string;
}

export interface ActionConfig {
  icon: IconDefinition;
  label: string;
  action: 'edit' | 'delete' | 'toggleStatus' | 'view' | 'pagos' | string;
  danger?: boolean; // Para estilizar botones peligrosos como el de eliminar
  title?: string; // Tooltip opcional
}
