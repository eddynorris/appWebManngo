import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faUser, faEnvelope, faPhone, faMapMarkerAlt, faCalendarAlt, faChartLine, faShoppingCart, faDollarSign, faExclamationTriangle, faEye } from '@fortawesome/free-solid-svg-icons';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ClienteProyeccion, VentaResumen, Venta } from '../../../../../types/contract.types';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig } from '../../../../../shared/components/data-table/data-table.types';
import { VentaDetalleModalComponent } from '../../../ventas/components/venta-detalle-modal/venta-detalle-modal.component';
import { VentaService } from '../../../ventas/services/venta.service';

@Component({
  selector: 'app-proyecciones-page-detail',
  imports: [CommonModule, FontAwesomeModule, DataTableComponent, VentaDetalleModalComponent],
  templateUrl: './proyecciones-page-detail.component.html',
  styleUrl: './proyecciones-page-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProyeccionesPageDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);
  private readonly notificationService = inject(NotificationService);
  private readonly ventaService = inject(VentaService);

  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faMapMarkerAlt = faMapMarkerAlt;
  faCalendarAlt = faCalendarAlt;
  faChartLine = faChartLine;
  faShoppingCart = faShoppingCart;
  faDollarSign = faDollarSign;
  faExclamationTriangle = faExclamationTriangle;
  faEye = faEye;

  // Estado del componente
  clienteProyeccion = signal<ClienteProyeccion | null>(null);
  isLoading = signal(true);
  clienteId = signal<number | null>(null);

  // Estado para el modal de detalle de venta
  ventaDetalleVisible = signal(false);
  selectedVenta = signal<Venta | null>(null);
  isLoadingVentaDetail = signal(false);

  // Computed properties
  diasHastaProximaCompra = computed(() => {
    const cliente = this.clienteProyeccion();
    if (!cliente?.proxima_compra_estimada) return null;
    
    const fechaProxima = new Date(cliente.proxima_compra_estimada);
    const fechaActual = new Date();
    const diferenciaDias = Math.ceil((fechaProxima.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24));
    
    return diferenciaDias;
  });

  urgenciaProximaCompra = computed(() => {
    const dias = this.diasHastaProximaCompra();
    if (dias === null) return 'normal';
    
    if (dias <= 0) return 'vencida';
    if (dias <= 3) return 'urgente';
    if (dias <= 7) return 'proxima';
    return 'normal';
  });

  // Configuración de columnas para la tabla de ventas
  readonly ventasColumns: ColumnConfig<VentaResumen>[] = [
    {
      key: 'id',
      label: 'ID Venta',
      type: 'text',
      customRender: (venta: VentaResumen) => `#${venta.id}`
    },
    {
      key: 'fecha',
      label: 'Fecha',
      type: 'date'
    },
    {
      key: 'estado_pago',
      label: 'Estado de Pago',
      type: 'text'
    },
    {
      key: 'total',
      label: 'Total',
      type: 'currency'
    },
    {
      key: 'actions',
      label: 'Acciones',
      type: 'actions'
    }
  ];

  // Configuración de acciones para la tabla de ventas
  readonly ventasActions = [
    {
      action: 'ver-detalle',
      label: 'Ver Detalle',
      icon: this.faEye,
      class: 'btn-detail'
    }
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.clienteId.set(id);
        this.loadClienteProyeccion(id);
      } else {
        this.notificationService.showError('ID de cliente no válido');
        this.router.navigate(['/admin/proyecciones']);
      }
    });
  }

  private loadClienteProyeccion(id: number): void {
    this.isLoading.set(true);
    
    this.clienteService.getClienteProyeccion(id).subscribe({
      next: (cliente) => {
        this.clienteProyeccion.set(cliente);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar proyección del cliente:', error);
        this.notificationService.showError('Error al cargar los datos del cliente');
        this.isLoading.set(false);
        this.router.navigate(['/admin/proyecciones']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/proyecciones']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }

  getUrgenciaClass(): string {
    const urgencia = this.urgenciaProximaCompra();
    return `urgencia-${urgencia}`;
  }

  getUrgenciaText(): string {
    const dias = this.diasHastaProximaCompra();
    const urgencia = this.urgenciaProximaCompra();
    
    if (dias === null) return 'Sin datos';
    
    switch (urgencia) {
      case 'vencida':
        return dias === 0 ? 'Hoy' : `Hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
      case 'urgente':
        return `En ${dias} día${dias !== 1 ? 's' : ''} (Urgente)`;
      case 'proxima':
        return `En ${dias} día${dias !== 1 ? 's' : ''}`;
      default:
        return `En ${dias} día${dias !== 1 ? 's' : ''}`;
    }
  }

  // Manejo de acciones de la tabla de ventas
  handleVentasTableAction(event: { action: string; item: VentaResumen }): void {
    if (event.action === 'ver-detalle') {
      this.showVentaDetail(event.item.id);
    }
  }

  // Mostrar detalle de venta
  showVentaDetail(ventaId: number): void {
    this.isLoadingVentaDetail.set(true);
    this.ventaService.getVentaById(ventaId).subscribe({
      next: (venta) => {
        this.selectedVenta.set(venta);
        this.ventaDetalleVisible.set(true);
        this.isLoadingVentaDetail.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar el detalle de la venta.');
        this.isLoadingVentaDetail.set(false);
      }
    });
  }

  // Cerrar modal de detalle de venta
  closeVentaDetail(): void {
    this.ventaDetalleVisible.set(false);
    this.selectedVenta.set(null);
  }
}
