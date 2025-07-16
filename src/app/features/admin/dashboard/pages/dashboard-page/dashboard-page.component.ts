import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSync,
  faExclamationTriangle,
  faCheckCircle,
  faEye,
  faMoneyBillWave,
  faStore,
  faTag,
  faCircle,
  faExclamationCircle,
  faBoxes,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { DashboardService } from '../../services/dashboard.service';
import {
  DashboardResponse,
  StockPorAlmacen,
  AlertaLoteBajo,
  ClienteSaldoPendiente
} from '../../../../../types/dashboard.types';
import { ClienteDeudaModalComponent } from '../../components/cliente-deuda-modal/cliente-deuda-modal.component';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';

// Tipo extendido para usar con DataTableComponent
interface ClienteParaTabla extends ClienteSaldoPendiente {
  id: number;
  activo: boolean;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, ClienteDeudaModalComponent, DataTableComponent, FontAwesomeModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardPageComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  // FontAwesome icons
  faSync = faSync;
  faExclamationTriangle = faExclamationTriangle;
  faCheckCircle = faCheckCircle;
  faEye = faEye;
  faMoneyBillWave = faMoneyBillWave;
  faStore = faStore;
  faTag = faTag;
  faCircle = faCircle;
  faExclamationCircle = faExclamationCircle;
  faBoxes = faBoxes;
  faUsers = faUsers;

  // State management
  dashboardData = signal<DashboardResponse | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  isDeudaModalVisible = signal(false);
  selectedCliente = signal<ClienteSaldoPendiente | null>(null);

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

  // Datos adaptados para DataTableComponent
  clientesParaTabla = computed<ClienteParaTabla[]>(() => {
    return this.clientesSaldoPendiente().map(cliente => ({
      ...cliente,
      id: cliente.cliente_id,
      activo: true
    }));
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

  // Configuración para DataTableComponent
  readonly columnasClientes: ColumnConfig<ClienteParaTabla>[] = [
    {
      key: 'cliente_id',
      label: 'ID Cliente',
      type: 'text',
      customRender: (cliente) => `#${cliente.cliente_id}`
    },
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'text'
    },
    {
      key: 'saldo_pendiente_total',
      label: 'Saldo Pendiente',
      type: 'currency'
    }
  ];

  readonly accionesClientes: ActionConfig[] = [
    {
      icon: faEye,
      label: 'Ver detalle',
      action: 'view'
    },
    {
      icon: faMoneyBillWave,
      label: 'Gestionar pagos',
      action: 'pagos'
    }
  ];

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
        this.error.set('Error al cargar los datos del dashboard');
        this.isLoading.set(false);
      }
    });
  }

  refresh(): void {
    this.loadDashboardData();
  }

  // Manejador de acciones de la tabla
  handleTableAction(event: { action: string; item: ClienteParaTabla }): void {
    switch (event.action) {
      case 'view':
        this.onViewDeuda(event.item.cliente_id);
        break;
      case 'pagos':
        this.onGoToPagos(event.item.cliente_id);
        break;
    }
  }

  onViewDeuda(clienteId: number): void {
    const cliente = this.clientesSaldoPendiente().find(c => c.cliente_id === clienteId);
    if (cliente) {
      this.selectedCliente.set(cliente);
      this.isDeudaModalVisible.set(true);
    }
  }

  onGoToPagos(clienteId: number): void {
    this.router.navigate(['/admin/pagos'], { queryParams: { cliente: clienteId } });
  }

  handleCloseModal(): void {
    this.isDeudaModalVisible.set(false);
    this.selectedCliente.set(null);
  }
}
