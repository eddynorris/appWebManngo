export interface AlertaStockBajo {
  presentacion_id: number;
  nombre: string;
  cantidad: number;
  stock_minimo: number;
  almacen_id: number;
  almacen_nombre: string;
}

export interface AlertaLoteBajo {
  lote_id: number;
  descripcion: string;
  cantidad_disponible_kg: number;
  producto_id: number;
}

export interface ClienteSaldoPendiente {
  cliente_id: number;
  nombre: string;
  saldo_pendiente_total: number;
  ventas_pendientes: VentaPendiente[];
}

export interface VentaPendiente {
  venta_id: number;
  fecha: string | null;
  total_venta: number;
  estado_pago: string;
  saldo_pendiente_venta: number;
  pagos: PagoRealizado[];
}

export interface PagoRealizado {
  pago_id: number;
  fecha: string | null;
  monto: number;
  metodo_pago: string;
  referencia: string | null;
}

export interface DashboardResponse {
  alertas_stock_bajo: AlertaStockBajo[];
  alertas_lotes_bajos: AlertaLoteBajo[];
  clientes_con_saldo_pendiente: ClienteSaldoPendiente[];
  total_deuda_clientes: number;
}

// Interfaces para agrupar datos en el componente
export interface StockPorAlmacen {
  almacen_id: number;
  almacen_nombre: string;
  productos_bajo_stock: AlertaStockBajo[];
}
