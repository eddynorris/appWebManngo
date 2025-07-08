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
}

export interface DashboardResponse {
  alertas_stock_bajo: AlertaStockBajo[];
  alertas_lotes_bajos: AlertaLoteBajo[];
  clientes_con_saldo_pendiente: ClienteSaldoPendiente[];
}

// Interfaces para agrupar datos en el componente
export interface StockPorAlmacen {
  almacen_id: number;
  almacen_nombre: string;
  productos_bajo_stock: AlertaStockBajo[];
}
