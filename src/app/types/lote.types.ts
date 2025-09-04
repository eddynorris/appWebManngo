export interface Lote {
  id: number;
  producto_id: number;
  proveedor_id: number;
  descripcion: string;
  peso_humedo_kg: string;
  peso_seco_kg: string;
  cantidad_disponible_kg: string;
  fecha_ingreso: string;
  created_at: string;
  updated_at: string;
  producto: {
    id: number;
    nombre: string;
  };
  proveedor: {
    id: number;
    nombre: string;
  };
}
