import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import {
  DashboardResponse,
  StockPorAlmacen,
  AlertaLoteBajo,
  ClienteSaldoPendiente
} from '../../../../../types/dashboard.types';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardPageComponent {
  private readonly dashboardService = inject(DashboardService);

  // State management
  dashboardData = signal<DashboardResponse | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed values para organizar los datos
  stockPorAlmacenes = computed(() => {
    const data = this.dashboardData();
    if (!data) return [];

    // Agrupar alertas de stock por almacén
    const almacenesMap = new Map<number, StockPorAlmacen>();

    data.alertas_stock_bajo.forEach(alerta => {
      if (!almacenesMap.has(alerta.almacen_id)) {
        almacenesMap.set(alerta.almacen_id, {
          almacen_id: alerta.almacen_id,
          almacen_nombre: alerta.almacen_nombre,
          productos_bajo_stock: []
        });
      }
      almacenesMap.get(alerta.almacen_id)!.productos_bajo_stock.push(alerta);
    });

    return Array.from(almacenesMap.values());
  });

  alertasLotes = computed(() => {
    return this.dashboardData()?.alertas_lotes_bajos || [];
  });

  clientesSaldoPendiente = computed(() => {
    return this.dashboardData()?.clientes_con_saldo_pendiente || [];
  });

  // Métricas resumidas
  totalAlertasStock = computed(() => {
    return this.dashboardData()?.alertas_stock_bajo.length || 0;
  });

  totalLotesBajos = computed(() => {
    return this.dashboardData()?.alertas_lotes_bajos.length || 0;
  });

  totalClientesPendientes = computed(() => {
    return this.dashboardData()?.clientes_con_saldo_pendiente.length || 0;
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error.set('Error al cargar los datos del dashboard');
        this.isLoading.set(false);
      }
    });
  }

  refresh(): void {
    this.loadDashboardData();
  }
}
