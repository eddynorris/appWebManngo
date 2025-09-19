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
  is_active?: boolean;
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
  pagos?: Pago[];
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
  total_linea?: string;
  created_at?: string;
  updated_at?: string;
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
  lote_id?: number | null;
  usuario_id?: number;
  almacen?: Almacen;
  lote?: Lote;
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
  tiene_conflicto_stock?: boolean; // Nueva propiedad para alerta de stock
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

// --- Tipos para el formulario de ventas ---

export type PresentacionConStockGlobal = PresentacionProducto & {
  stock_por_almacen: {
    almacen_id: number;
    nombre: string;
    cantidad: number;
  }[];
};

export type PresentacionConStockLocal = PresentacionProducto & {
  stock_disponible: number;
};

export type PresentacionDisponible = {
  id: number;
  producto_id: number;
  nombre: string;
  capacidad_kg: string;
  tipo: string;
  precio_venta: string;
  activo: boolean;
  url_foto?: string;
  stock_disponible: number;
  lote_id?: number;
  lote_descripcion?: string;
};

export type VentaFormDataResponse = {
  clientes: Cliente[];
  almacenes?: Almacen[]; // Opcional, solo para admin sin almacen_id
  presentaciones_disponibles?: PresentacionDisponible[];
  presentaciones_con_stock_global?: PresentacionConStockGlobal[];
  presentaciones_con_stock_local?: PresentacionConStockLocal[];
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
export type MovimientosResponse = PaginatedResponse<Movimiento>;
export type LotesResponse = PaginatedResponse<Lote>;

// Tipos específicos para el formulario de pagos por lotes
export type VentaPendientePago = {
  venta_id: number;
  cliente_nombre: string;
  fecha_venta: string;
  total: string;
  pagado: string;
  pendiente: string;
  estado_pago: string;
  monto_pago?: string; // Monto que se va a pagar (editable)
};

export type BatchPagoData = {
  venta_id: number;
  monto: string;
};

// --- Tipos para Proyecciones de Clientes ---

export type PedidoResumen = {
  id: number;
  fecha_creacion: string;
  estado: string;
  total: number;
};

export type Estadisticas = {
  total_ventas: number;
  total_pedidos: number;
  monto_total_comprado: number;
  saldo_pendiente: number;
  promedio_compra: number;
  pedidos_por_estado: {
    completado: number;
    pendiente: number;
  };
  ultima_actividad: string;
};

export type VentaResumen = {
  id: number;
  fecha: string;
  total: number;
  estado_pago: string;
};

export type ClienteProyeccion = {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  codigo_postal?: string;
  fecha_registro?: string;
  ultima_fecha_compra: string;
  frecuencia_compra_dias: number;
  saldo_pendiente: number;
  pedidos?: PedidoResumen[];
  ventas?: VentaResumen[];
  proxima_compra_estimada: string;
  estadisticas: Estadisticas;
};

export type ClienteProyeccionesResponse = PaginatedResponse<ClienteProyeccion>;

// --- Tipos para Cierre de Caja ---

export type PagoPendienteDeposito = {
  id: number;
  monto: string;
  monto_depositado: string | null;
  monto_en_gerencia: string;
  fecha: string;
  metodo_pago: string;
  referencia: string;
  url_comprobante: string | null;
  depositado: boolean;
  fecha_deposito: string | null;
  venta_id: number;
  usuario_id: number;
  created_at: string;
  updated_at: string;
  venta: {
    id: number;
    total: string;
    cliente: {
      id: number;
      nombre: string;
    };
  };
  usuario: {
    id: number;
    username: string;
  };
  cliente?: Cliente; // Mantener compatibilidad con código existente
};

export type GastoCaja = {
  id: number;
  monto: string;
  fecha: string;
  descripcion: string;
  categoria: string;
  almacen_id: number;
  usuario_id: number;
  almacen?: Almacen;
  usuario?: User;
};

export type ResumenCierreCaja = {
  total_cobrado_pendiente: string;
  total_gastado: string;
  efectivo_esperado: string;
};

export type DetallesCierreCaja = {
  pagos_pendientes: PagoPendienteDeposito[];
  gastos: GastoCaja[];
};

export type CierreCajaResponse = {
  resumen: ResumenCierreCaja;
  detalles: DetallesCierreCaja;
};

export type CierreCajaFilters = {
  fecha_inicio: string;
  fecha_fin: string;
  almacen_id?: number;
  usuario_id?: number;
};

// --- Tipos para Depósitos Bancarios ---

export type DepositoItem = {
  pago_id: number;
  monto_depositado: string;
};

export type RegistroDepositoRequest = {
  depositos: DepositoItem[];
  fecha_deposito: string;
  referencia_bancaria?: string;
};

export type PagoDepositado = {
  id: number;
  monto: string;
  monto_depositado: string;
  depositado: boolean;
  fecha_deposito: string;
  venta_id: number;
  usuario_id: number;
};

export type RegistroDepositoResponse = {
  message: string;
  pagos_actualizados: number;
  monto_total_depositado: string;
  pagos: PagoDepositado[];
};
