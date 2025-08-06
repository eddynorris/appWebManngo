import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBoxes, faWarehouse, faShoppingCart, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { InventarioService, ReporteInventarioGlobalItem } from '../../../inventarios/services/inventario.service';
import { NotificationService } from '../../../../../shared/services/notification.service';


@Component({
  selector: 'app-reporte-inventario-global-page',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './reporte-inventario-global-page.component.html',
  styleUrl: './reporte-inventario-global-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteInventarioGlobalPageComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly notificationService = inject(NotificationService);

  // FontAwesome icons
  faBoxes = faBoxes;
  faWarehouse = faWarehouse;
  faShoppingCart = faShoppingCart;
  faChartBar = faChartBar;

  // State signals
  readonly isLoading = signal(false);
  readonly reporteData = signal<ReporteInventarioGlobalItem[]>([]);

  // Computed properties for summary cards
  readonly totalPresentaciones = computed(() => this.reporteData().length);
  
  readonly totalUnidades = computed(() => {
    return this.reporteData().reduce((sum, item) => sum + item.stock_total_unidades, 0);
  });

  readonly totalProyeccionVenta = computed(() => {
    return this.reporteData().reduce((sum, item) => sum + item.proyeccion_venta, 0);
  });

  readonly totalAlmacenes = computed(() => {
    const almacenes = new Set<string>();
    this.reporteData().forEach(item => {
      item.detalle_por_almacen.forEach(detalle => {
        almacenes.add(detalle.almacen);
      });
    });
    return almacenes.size;
  });

  readonly totalKgDisponibles = computed(() => {
    const lotesProcesados = new Set<number>();
    let totalKg = 0;
    
    this.reporteData().forEach(item => {
      item.detalle_por_almacen.forEach(detalle => {
        if (!lotesProcesados.has(detalle.lote_id)) {
          totalKg += detalle.lote_kg_disponible;
          lotesProcesados.add(detalle.lote_id);
        }
      });
    });
    
    return totalKg;
  });

  ngOnInit(): void {
    this.loadReporteGlobal();
  }

  loadReporteGlobal(): void {
    this.isLoading.set(true);
    this.inventarioService.getReporteGlobal().subscribe({
      next: (data) => {
        this.reporteData.set(data);
        this.isLoading.set(false);
        this.notificationService.showSuccess('Reporte global cargado correctamente');
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notificationService.showError('Error al cargar el reporte global: ' + (error.message || 'Error desconocido'));
      }
    });
  }

  refreshData(): void {
    this.loadReporteGlobal();
  }
}