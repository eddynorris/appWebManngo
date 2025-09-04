export interface Presentacion {
  id: number;
  producto_id: number;
  nombre: string;
  capacidad_kg: string;
  tipo: string;
  precio_venta: string;
  activo: boolean;
  url_foto: string;
  created_at: string;
  updated_at: string;
  producto: {
    id: number;
    nombre: string;
  };
}
