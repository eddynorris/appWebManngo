import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBoxes,
  faIndustry,
  faExchangeAlt,
  faLayerGroup,
  faCalendarAlt,
  faWarehouse,
  faFilter,
  faDownload,
  faSync,
  faChevronDown,
  faChevronUp,
  faTag,
  faTruckLoading,
  faHistory,
  faListAlt,
  faCheckCircle,
  faBoxOpen,
  faWeightHanging
} from '@fortawesome/free-solid-svg-icons';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ProduccionReporteService } from '../../services/produccion-reporte.service';
import { AlmacenService } from '../../../almacenes/services/almacen.service';
import { LoteService } from '../../../lotes/services/lote.service';
import { ProductService } from '../../../productos/services/product.service';
import { PresentacionService } from '../../../presentaciones/services/presentacion.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { Almacen, Lote, Producto, PresentacionProducto } from '../../../../../types/contract.types';
import {
  IReporteProduccionEntradasResponse,
  IReporteProduccionFiltros,
  IProduccionPorLote,
  IProduccionPorPresentacion,
  ITrasladoEntreAlmacenes,
  IMovimientoDetalle,
  IResumenTemporalItem
} from '../../../../../types/produccion-reporte.types';

type TabView = 'lotes' | 'presentaciones' | 'traslados' | 'movimientos' | 'temporal';

@Component({
  selector: 'app-reporte-produccion-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './reporte-produccion-page.component.html',
  styleUrls: ['./reporte-produccion-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ReporteProduccionPageComponent implements OnInit {
  private readonly reporteService = inject(ProduccionReporteService);
  private readonly almacenService = inject(AlmacenService);
  private readonly loteService = inject(LoteService);
  private readonly productService = inject(ProductService);
  private readonly presentacionService = inject(PresentacionService);
  private readonly notificationService = inject(NotificationService);

  // Iconos FontAwesome
  readonly icons = {
    boxes: faBoxes,
    industry: faIndustry,
    exchange: faExchangeAlt,
    layerGroup: faLayerGroup,
    calendar: faCalendarAlt,
    warehouse: faWarehouse,
    filter: faFilter,
    download: faDownload,
    sync: faSync,
    chevronDown: faChevronDown,
    chevronUp: faChevronUp,
    tag: faTag,
    truckLoading: faTruckLoading,
    history: faHistory,
    listAlt: faListAlt,
    check: faCheckCircle,
    boxOpen: faBoxOpen,
    weight: faWeightHanging
  };

  // Estados reactivos (Signals)
  readonly cargando = signal(false);
  readonly datosGenerados = signal(false);
  readonly data = signal<IReporteProduccionEntradasResponse | null>(null);
  readonly activeTab = signal<TabView>('lotes');
  readonly expandedLotes = signal<Set<string>>(new Set());

  // Catálogos para filtros
  readonly almacenes = signal<Almacen[]>([]);
  readonly lotes = signal<Lote[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly presentaciones = signal<PresentacionProducto[]>([]);

  // Formulario reactivo
  readonly filterForm = new FormGroup({
    fecha_inicio: new FormControl<string>(this.formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
    fecha_fin: new FormControl<string>(this.formatDate(new Date())),
    almacen_id: new FormControl<number | null>(null),
    lote_id: new FormControl<number | null>(null),
    producto_id: new FormControl<number | null>(null),
    presentacion_id: new FormControl<number | null>(null),
    tipo_operacion: new FormControl<'todos' | 'produccion' | 'transferencia'>('todos')
  });

  // Computed values
  readonly resumenGeneral = computed(() => this.data()?.resumen_general);
  readonly periodo = computed(() => this.data()?.periodo);
  readonly produccionPorLote = computed(() => this.data()?.produccion_por_lote || []);
  readonly produccionPorPresentacion = computed(() => this.data()?.produccion_por_presentacion || []);
  readonly trasladosEntreAlmacenes = computed(() => this.data()?.traslados_entre_almacenes || []);
  readonly movimientosDetalle = computed(() => this.data()?.movimientos_detalle || []);
  readonly resumenTemporal = computed(() => this.data()?.resumen_temporal || []);

  ngOnInit(): void {
    this.cargarCatalogos();
    this.configurarListenerFiltros();
    this.generarReporte();
  }

  /**
   * Carga los catálogos para los selectores de filtros
   */
  private cargarCatalogos(): void {
    this.almacenService.getAlmacenes().subscribe({
      next: (res) => this.almacenes.set(res),
      error: (err) => console.error('Error cargando almacenes:', err)
    });

    this.loteService.getLotes(1, 100).subscribe({
      next: (res) => this.lotes.set(res.data || []),
      error: (err) => console.error('Error cargando lotes:', err)
    });

    this.productService.loadProducts(1, 100).subscribe({
      next: (res) => this.productos.set(res.data || []),
      error: (err) => console.error('Error cargando productos:', err)
    });

    this.presentacionService.getPresentaciones(1, 100).subscribe({
      next: (res) => this.presentaciones.set(res.data || []),
      error: (err) => console.error('Error cargando presentaciones:', err)
    });
  }

  /**
   * Configura recarga automática con debounce
   */
  private configurarListenerFiltros(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(() => {
        if (this.datosGenerados()) {
          this.generarReporte(false);
        }
      });
  }

  /**
   * Ejecuta la consulta del reporte al backend
   */
  generarReporte(mostrarToast = true): void {
    this.cargando.set(true);
    const filtros = this.obtenerFiltros();

    this.reporteService.getReporteProduccionEntradas(filtros).subscribe({
      next: (response) => {
        this.data.set(response);
        this.datosGenerados.set(true);
        this.cargando.set(false);

        // Autoexpandir todos los lotes inicialmente para visualización directa
        if (response.produccion_por_lote && response.produccion_por_lote.length > 0) {
          const keys = new Set<string>(response.produccion_por_lote.map((l: IProduccionPorLote) => l.codigo_lote || `${l.lote_id}`));
          this.expandedLotes.set(keys);
        }

        if (mostrarToast) {
          this.notificationService.showSuccess('Reporte de producción cargado exitosamente');
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.notificationService.showError('Error al cargar reporte de producción: ' + (err.message || 'Error desconocido'));
        console.error(err);
      }
    });
  }

  /**
   * Limpia los filtros y reinicia a valores por defecto
   */
  limpiarFiltros(): void {
    this.filterForm.reset({
      fecha_inicio: this.formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      fecha_fin: this.formatDate(new Date()),
      almacen_id: null,
      lote_id: null,
      producto_id: null,
      presentacion_id: null,
      tipo_operacion: 'todos'
    });
    this.generarReporte(false);
  }

  /**
   * Exporta los datos actuales a Excel
   */
  exportarExcel(): void {
    const dataActual = this.data();
    if (!dataActual) {
      this.notificationService.showWarning('No hay datos disponibles para exportar');
      return;
    }

    try {
      this.reporteService.exportarReporteExcel(dataActual, this.obtenerFiltros());
      this.notificationService.showSuccess('Reporte exportado en formato Excel (.xlsx)');
    } catch (error) {
      console.error('Error exportando Excel:', error);
      this.notificationService.showError('Ocurrió un error al generar el archivo Excel');
    }
  }

  /**
   * Cambia la pestaña activa
   */
  setActiveTab(tab: TabView): void {
    this.activeTab.set(tab);
  }

  /**
   * Alterna la expansión de un lote en la tabla de producción por lote
   */
  toggleLote(codigoLote: string): void {
    this.expandedLotes.update((set) => {
      const nuevoSet = new Set(set);
      if (nuevoSet.has(codigoLote)) {
        nuevoSet.delete(codigoLote);
      } else {
        nuevoSet.add(codigoLote);
      }
      return nuevoSet;
    });
  }

  isLoteExpanded(codigoLote: string): boolean {
    return this.expandedLotes().has(codigoLote);
  }

  expandAllLotes(): void {
    const lotes = this.produccionPorLote();
    const allKeys = new Set<string>(lotes.map((l: IProduccionPorLote) => l.codigo_lote || `${l.lote_id}`));
    this.expandedLotes.set(allKeys);
  }

  collapseAllLotes(): void {
    this.expandedLotes.set(new Set());
  }

  /**
   * Obtiene el payload de filtros a partir del formulario
   */
  private obtenerFiltros(): IReporteProduccionFiltros {
    const val = this.filterForm.value;
    return {
      fecha_inicio: val.fecha_inicio || undefined,
      fecha_fin: val.fecha_fin || undefined,
      almacen_id: val.almacen_id !== null ? val.almacen_id : undefined,
      lote_id: val.lote_id !== null ? val.lote_id : undefined,
      producto_id: val.producto_id !== null ? val.producto_id : undefined,
      presentacion_id: val.presentacion_id !== null ? val.presentacion_id : undefined,
      tipo_operacion: val.tipo_operacion || 'todos'
    };
  }

  // Métodos de formateo
  formatNumber(val?: number | null): string {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString('es-PE');
  }

  formatKg(val?: number | null): string {
    if (val === undefined || val === null) return '0.00 kg';
    return `${Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
