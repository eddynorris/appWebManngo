export interface ColumnConfig<T> {
  key: string;
  label: string;
  type: 'text' | 'status' | 'image' | 'currency' | 'actions' | 'date' | 'custom';
  // Opcional para un renderizado personalizado si es necesario
  customRender?: (item: T) => string;
}

export interface ActionConfig {
  icon: string;
  label: string;
  action: 'edit' | 'delete' | 'toggleStatus' | 'view';
  danger?: boolean; // Para estilizar botones peligrosos como el de eliminar
}
