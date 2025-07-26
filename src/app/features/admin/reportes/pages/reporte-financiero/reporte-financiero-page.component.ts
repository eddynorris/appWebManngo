import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartLine, faDollarSign, faMoneyBillWave, faTurnUp, faTurnDown, faSearch, faTrash, faFileExcel, faChartBar, faFilter, faHandHoldingDollar, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { 
  ReporteFinancieroService, 
  VentaPorPresentacion,
  ResumenFinanciero,
  FiltrosReporte
} from '../../services/reporte-financiero.service';
import { LoteService } from '../../services/lote.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig } from '../../../../../shared/components/data-table/data-table.types';
import { Lote, Almacen } from '../../../../../types/contract.types';
import { AlmacenService } from '../../../almacenes/services/almacen.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

type TipoVista = 'resumen' | 'ventas_presentacion';

@Component({
  selector: 'app-reporte-financiero-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTableComponent,
    FontAwesomeModule,
  ],
  templateUrl: './reporte-financiero-page.component.html',
  styleUrls: ['./reporte-financiero-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteFinancieroPageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly cancelRequest$ = new Subject<void>();
  private readonly reporteFinancieroService = inject(ReporteFinancieroService);
  private readonly loteService = inject(LoteService);
  private readonly almacenService = inject(AlmacenService);
  private readonly notificationService = inject(NotificationService);

  // FontAwesome icons
  faChartLine = faChartLine;
  faDollarSign = faDollarSign;
  faMoneyBillWave = faMoneyBillWave;
  faTurnUp = faTurnUp;
  faTurnDown = faTurnDown;
  faSearch = faSearch;
  faTrash = faTrash;
  faFileExcel = faFileExcel;
  faChartBar = faChartBar;
  faFilter = faFilter;
  faHandHoldingDollar = faHandHoldingDollar;
  faCreditCard = faCreditCard;

  readonly cargando = signal(false);
  readonly datosGenerados = signal(false);
  readonly resumenFinanciero = signal<ResumenFinanciero | null>(null);
  readonly ventasPorPresentacion = signal<VentaPorPresentacion[]>([]);
  readonly lotes = signal<Lote[]>([]);
  readonly almacenes = signal<Almacen[]>([]);

  readonly filtrosForm = new FormGroup({
    fecha_inicio: new FormControl<string>(''),
    fecha_fin: new FormControl<string>(''),
    almacen_id: new FormControl<number | null>(null),
    lote_id: new FormControl<number | null>(null),
  });

  // Computed properties
  readonly mostrarTabla = computed(() => {
    return this.ventasPorPresentacion().length > 0;
  });

  // Computed para optimizar el renderizado del resumen
  readonly resumenFormateado = computed(() => {
    const resumen = this.resumenFinanciero();
    if (!resumen) return null;
    
    // Los valores vienen como strings desde la API, convertir a números
    const ventasNumero = parseFloat(resumen.total_ventas) || 0;
    const gastosNumero = parseFloat(resumen.total_gastos) || 0;
    const gananciaNumero = parseFloat(resumen.ganancia_neta) || 0;
    const margenNumero = parseFloat(resumen.margen_ganancia.replace('%', '')) || 0;
    const deudaNumero = parseFloat(resumen.total_deuda) || 0;
    const pagadoNumero = parseFloat(resumen.total_pagado) || 0;
    
    return {
      ...resumen,
      gananciaPositiva: gananciaNumero >= 0,
      ventasFormateadas: new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(ventasNumero),
      gastosFormateados: new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(gastosNumero),
      gananciaFormateada: new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(gananciaNumero),
      margenFormateado: `${margenNumero.toFixed(2)}%`,
      deudaFormateada: new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(deudaNumero),
      pagadoFormateado: new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(pagadoNumero)
    };
  });

  // Columnas para ventas por presentación
  readonly columnasVentasPresentacion: ColumnConfig<VentaPorPresentacion>[] = [
    {
      key: 'presentacion_nombre',
      label: 'Presentación',
      type: 'text',
    },
    {
      key: 'unidades_vendidas',
      label: 'Unidades Vendidas',
      type: 'text',
      customRender: (venta) => venta.unidades_vendidas.toLocaleString('es-PE'),
    },
    {
      key: 'total_vendido',
      label: 'Total Vendido',
      type: 'text',
      customRender: (venta) => {
        // Los valores vienen como string desde la API (ej: '480.00')
        // Convertir a número y formatear como moneda
        const valor = parseFloat(venta.total_vendido) || 0;
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(valor);
      },
    },
  ];

  ngOnInit(): void {
    this.cargarDatosFormulario();
    this.establecerFechasPorDefecto();
    this.cargarResumenInicial();
    this.configurarDebounceFormulario();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cancelRequest$.next();
    this.cancelRequest$.complete();
  }

  private configurarDebounceFormulario(): void {
    // Solo escuchar cambios en fechas para actualizar resumen automáticamente
    this.filtrosForm.get('fecha_inicio')?.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.filtrosForm.valid && this.datosGenerados()) {
          this.cargarResumenFinanciero();
        }
      });
      
    this.filtrosForm.get('fecha_fin')?.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.filtrosForm.valid && this.datosGenerados()) {
          this.cargarResumenFinanciero();
        }
      });
  }

  private cargarDatosFormulario(): void {
    // Cargar almacenes
    this.almacenService.getAlmacenes().subscribe({
      next: (almacenes) => {
        this.almacenes.set(almacenes);
      },
      error: (error) => {
        this.notificationService.showError(
          'Error al cargar almacenes: ' + (error.message || 'Error desconocido')
        );
      },
    });

    // Cargar lotes
    this.loteService.getLotes(1, 100).subscribe({
      next: (response) => {
        this.lotes.set(response.data);
      },
      error: (error) => {
        this.notificationService.showError(
          'Error al cargar lotes: ' + (error.message || 'Error desconocido')
        );
      },
    });
  }

  private establecerFechasPorDefecto(): void {
    // Método mantenido para compatibilidad, pero ya no establece fechas automáticamente
    // Las fechas ahora son completamente opcionales
  }

  private cargarResumenInicial(): void {
    // Solo configurar valores por defecto de almacén y lote, sin generar reporte automáticamente
    // Esperar a que se carguen almacenes y lotes, luego configurar valores por defecto
    setTimeout(() => {
      this.configurarValoresPorDefecto();
    }, 1000);
  }

  private configurarValoresPorDefecto(): void {
    const almacenes = this.almacenes();
    const lotes = this.lotes();
    
    // Buscar almacén de Andahuaylas
    const almacenAndahuaylas = almacenes.find(a => 
      a.nombre?.toLowerCase().includes('andahuaylas')
    );
    
    // Obtener el lote más reciente (último en la lista)
    const loteMasReciente = lotes.length > 0 ? lotes[lotes.length - 1] : null;
    
    // Configurar valores por defecto solo para almacén y lote
    if (almacenAndahuaylas || loteMasReciente) {
      const updates: any = {};
      
      if (almacenAndahuaylas) {
        updates.almacen_id = almacenAndahuaylas.id;
      }
      
      if (loteMasReciente) {
        updates.lote_id = loteMasReciente.id;
      }
      
      this.filtrosForm.patchValue(updates);
      
      // No generar reporte automáticamente - el usuario debe hacer clic en "Generar Reporte"
    }
  }

  private cargarResumenFinanciero(): void {
    const formValue = this.filtrosForm.value;

    const filtros: FiltrosReporte = {
      fecha_inicio: formValue.fecha_inicio || undefined,
      fecha_fin: formValue.fecha_fin || undefined,
      almacen_id: formValue.almacen_id || undefined,
      lote_id: formValue.lote_id || undefined,
    };

    this.cargando.set(true);
    this.reporteFinancieroService.obtenerResumenFinanciero(filtros).subscribe({
      next: (resumen) => {
        this.resumenFinanciero.set(resumen);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar resumen:', error);
        this.cargando.set(false);
        this.notificationService.showError(
          'Error al cargar resumen financiero: ' + (error.message || 'Error desconocido')
        );
      },
    });
  }

  generarReporte(): void {
    // Cancelar requests anteriores
    this.cancelRequest$.next();

    const formValue = this.filtrosForm.value;
    const filtros: FiltrosReporte = {
      fecha_inicio: formValue.fecha_inicio || undefined,
      fecha_fin: formValue.fecha_fin || undefined,
      almacen_id: formValue.almacen_id || undefined,
      lote_id: formValue.lote_id || undefined,
    };
    
    this.cargando.set(true);
    this.datosGenerados.set(false);

    // Cargar resumen financiero
    this.cargarResumenFinanciero();

    // Cargar ventas por presentación
    this.reporteFinancieroService.obtenerVentasPorPresentacion(filtros)
      .pipe(takeUntil(this.cancelRequest$))
      .subscribe({
        next: (ventas) => {
          // Asegurar que cada item tenga un ID único para el track function
          const ventasConId = ventas.map((venta, index) => ({
            ...venta,
            id: venta.id || venta.presentacion_id || index + 1,
            activo: venta.activo ?? true
          }));
          
          this.ventasPorPresentacion.set(ventasConId);
          this.datosGenerados.set(true);
          this.cargando.set(false);
          this.notificationService.showSuccess(
            `Reporte generado: ${ventasConId.length} presentaciones encontradas`
          );
        },
        error: (error) => {
          this.cargando.set(false);
          this.datosGenerados.set(true);
          this.notificationService.showError(
            'Error al generar el reporte: ' + (error.message || 'Error desconocido')
          );
        },
      });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.resumenFinanciero.set(null);
    this.ventasPorPresentacion.set([]);
    this.datosGenerados.set(false);
    this.cargarResumenInicial();
  }

  exportarReporte(): void {
    const formValue = this.filtrosForm.value;
    const filtros: FiltrosReporte = {
      fecha_inicio: formValue.fecha_inicio || undefined,
      fecha_fin: formValue.fecha_fin || undefined,
      almacen_id: formValue.almacen_id || undefined,
      lote_id: formValue.lote_id || undefined,
    };

    const resumen = this.resumenFinanciero();
    const ventas = this.ventasPorPresentacion();
    
    if (!resumen && ventas.length === 0) {
      this.notificationService.showError('No hay datos para exportar');
      return;
    }

    try {
      // Exportar a XLSX con ambos reportes
      this.reporteFinancieroService.exportarReporteCompleto(resumen, ventas, filtros);
      this.notificationService.showSuccess('Reporte exportado exitosamente en formato XLSX');
    } catch (error) {
      this.notificationService.showError('Error al exportar el reporte');
      console.error('Error en exportación:', error);
    }
  }

  // Métodos auxiliares para el template
  formatearMoneda(valor: string | number): string {
    return this.reporteFinancieroService.formatearMoneda(valor);
  }

  formatearPorcentaje(valor: string | number): string {
    return this.reporteFinancieroService.formatearPorcentaje(valor.toString());
  }

  parseMontoString(valor: string): number {
    return this.reporteFinancieroService.parseMontoString(valor);
  }
}