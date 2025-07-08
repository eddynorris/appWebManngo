// Tipos generados a partir de contract.txt (OpenAPI)
// No modificar manualmente este archivo.

export type Producto = {
  id?: number;
  nombre?: string;
  descripcion?: string;
  precio_compra?: string;
  activo?: boolean;
  presentaciones?: PresentacionProducto[];
};

export type PresentacionProducto = {
  id?: number;
  producto_id?: number;
  nombre?: string;
  capacidad_kg?: string;
  tipo?: string;
  precio_venta?: string;
  activo?: boolean;
  url_foto?: string;
  producto?: Producto;
};

export type Almacen = {
  id?: number;
  nombre?: string;
  direccion?: string;
  ciudad?: string;
};

export type Cliente = {
  id?: number;
  nombre?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  saldo_pendiente?: string;
  ultima_fecha_compra?: string;
};

export type Proveedor = {
  id?: number;
  nombre?: string;
  telefono?: string;
  direccion?: string;
};

export type Inventario = {
  id?: number;
  presentacion_id?: number;
  almacen_id?: number;
  lote_id?: number;
  cantidad?: number;
  stock_minimo?: number;
  presentacion?: PresentacionProducto;
  almacen?: Almacen;
  lote?: Lote;
};

export type Lote = {
  id?: number;
  producto_id?: number;
  proveedor_id?: number;
  descripcion?: string;
  peso_humedo_kg?: string;
  peso_seco_kg?: string;
  cantidad_disponible_kg?: string;
  producto?: Producto;
  proveedor?: Proveedor;
};

export type Venta = {
  id?: number;
  cliente_id?: number;
  almacen_id?: number;
  vendedor_id?: number;
  fecha?: string;
  total?: string;
  tipo_pago?: string;
  estado_pago?: string;
  detalles?: VentaDetalle[];
  cliente?: Cliente;
  almacen?: Almacen;
  vendedor?: User;
};

export type VentaDetalle = {
  id?: number;
  venta_id?: number;
  presentacion_id?: number;
  cantidad?: number;
  precio_unitario?: string;
  presentacion?: PresentacionProducto;
};

export type Pago = {
  id?: number;
  venta_id?: number;
  usuario_id?: number;
  monto?: string;
  fecha?: string;
  metodo_pago?: string;
  referencia?: string;
  url_comprobante?: string;
  usuario?: User;
  venta?: Venta;
};

export type User = {
  id?: number;
  username?: string;
  password?: string; // Add password field
  rol?: string;
  almacen_id?: number;
  almacen?: Almacen;
};

export type Gasto = {
  id?: number;
  descripcion?: string;
  monto?: string;
  fecha?: string;
  categoria?: string;
  almacen_id?: number;
  usuario_id?: number;
  almacen?: Almacen;
  usuario?: User;
};

export type Movimiento = {
  id?: number;
  tipo?: string;
  presentacion_id?: number;
  lote_id?: number;
  usuario_id?: number;
  cantidad?: string;
  fecha?: string;
  motivo?: string;
  presentacion?: PresentacionProducto;
  lote?: Lote;
  usuario?: User;
};

export type Pedido = {
  id?: number;
  cliente_id?: number;
  almacen_id?: number;
  vendedor_id?: number;
  fecha_creacion?: string;
  fecha_entrega?: string;
  estado?: string;
  notas?: string;
  detalles?: PedidoDetalle[];
  cliente?: Cliente;
  almacen?: Almacen;
  vendedor?: User;
};

export type PedidoDetalle = {
  id?: number;
  pedido_id?: number;
  presentacion_id?: number;
  cantidad?: number;
  precio_estimado?: string;
  presentacion?: PresentacionProducto;
};

export type Merma = {
  id?: number;
  lote_id?: number;
  cantidad_kg?: string;
  convertido_a_briquetas?: boolean;
  fecha_registro?: string;
  usuario_id?: number;
  lote?: Lote;
  usuario?: User;
};

export type DepositoBancario = {
  id?: number;
  fecha_deposito?: string;
  monto_depositado?: string;
  almacen_id?: number;
  usuario_id?: number;
  referencia_bancaria?: string;
  url_comprobante_deposito?: string;
  notas?: string;
  almacen?: Almacen;
  usuario?: User;
};

// --- Tipos de Paginación y Respuestas de API ---

export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export type ClientesResponse = PaginatedResponse<Cliente>;
export type ProductosResponse = PaginatedResponse<Producto>;
export type VentasResponse = PaginatedResponse<Venta>;
export type UsuariosResponse = PaginatedResponse<User>;
export type PagosResponse = PaginatedResponse<Pago>;
export type PedidosResponse = PaginatedResponse<Pedido>;
export type InventariosResponse = PaginatedResponse<Inventario>;
export type GastosResponse = PaginatedResponse<Gasto>;
export type ProductsResponse = PaginatedResponse<Producto>;
