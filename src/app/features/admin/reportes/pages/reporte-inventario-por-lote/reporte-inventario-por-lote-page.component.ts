import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/movimiento.service';
import { LoteService } from '../../services/lote.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig } from '../../../../../shared/components/data-table/data-table.types';
import { Movimiento, Lote } from '../../../../../types/contract.types';

interface ReporteInventarioItem {
  id?: number;
  activo?: boolean;
  lote_descripcion: string;
  presentacion_nombre: string;
  cantidad_total: number;
  kilogramos_totales: number;
}

@Component({
  selector: 'app-reporte-inventario-por-lote-page',
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reporte-inventario-por-lote-page.component.html',
  styleUrls: ['./reporte-inventario-por-lote-page.component.scss'],
})
export default class ReporteInventarioPorLotePageComponent implements OnInit {
  private readonly movimientoService = inject(MovimientoService);
  private readonly loteService = inject(LoteService);
  private readonly notificationService = inject(NotificationService);

  readonly cargando = signal(false);
  readonly reporteGenerado = signal(false);
  readonly datosReporte = signal<ReporteInventarioItem[]>([]);
  readonly lotes = signal<Lote[]>([]);

  readonly filtrosForm = new FormGroup({
    lote_id: new FormControl<number | null>(null),
    fecha_inicio: new FormControl<string | null>(null),
    fecha_fin: new FormControl<string | null>(null),
  });

  readonly columnasReporte: ColumnConfig<ReporteInventarioItem>[] = [
    {
      key: 'lote_descripcion',
      label: 'Lote',
      type: 'text',
    },
    {
      key: 'presentacion_nombre',
      label: 'Presentación',
      type: 'text',
    },
    {
      key: 'cantidad_total',
      label: 'Cantidad Total',
      type: 'text',
      customRender: (item) => `${item.cantidad_total} unidades`,
    },
    {
      key: 'kilogramos_totales',
      label: 'Kilogramos Totales',
      type: 'text',
      customRender: (item) => `${item.kilogramos_totales} kg`,
    },
  ];

  ngOnInit(): void {
    this.cargarLotes();
  }

  private cargarLotes(): void {
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

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;

    this.cargando.set(true);
    this.reporteGenerado.set(false);

    this.movimientoService
      .getMovimientosFiltrados({
        tipo: 'entrada',
        lote_id: filtros.lote_id || undefined,
        fecha_inicio: filtros.fecha_inicio || undefined,
        fecha_fin: filtros.fecha_fin || undefined,
        limit: 1000, // Obtener todos los registros para el reporte
      })
      .subscribe({
        next: (response) => {
          const datosAgrupados = this.agruparMovimientos(response.data);
          this.datosReporte.set(datosAgrupados);
          this.reporteGenerado.set(true);
          this.cargando.set(false);

          if (datosAgrupados.length === 0) {
            this.notificationService.showInfo(
              'No se encontraron movimientos con los filtros aplicados'
            );
          } else {
            this.notificationService.showSuccess(
              `Reporte generado con ${datosAgrupados.length} registros`
            );
          }
        },
        error: (error) => {
          this.cargando.set(false);
          this.reporteGenerado.set(true);
          this.notificationService.showError(
            'Error al generar el reporte: ' + (error.message || 'Error desconocido')
          );
        },
      });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.datosReporte.set([]);
    this.reporteGenerado.set(false);
  }

  private agruparMovimientos(movimientos: Movimiento[]): ReporteInventarioItem[] {
    const agrupados = new Map<string, ReporteInventarioItem>();

    for (const movimiento of movimientos) {
      if (!movimiento.lote || !movimiento.presentacion) continue;

      const clave = `${movimiento.lote.id}-${movimiento.presentacion.id}`;
      const cantidad = parseFloat(movimiento.cantidad || '0');
      const capacidadKg = parseFloat(movimiento.presentacion.capacidad_kg || '0');
      const totalKg = cantidad * capacidadKg;

      if (agrupados.has(clave)) {
        const existente = agrupados.get(clave)!;
        existente.cantidad_total += cantidad;
        existente.kilogramos_totales += totalKg;
      } else {
        agrupados.set(clave, {
          lote_descripcion: movimiento.lote.descripcion || `Lote ${movimiento.lote.id}`,
          presentacion_nombre: movimiento.presentacion.nombre || '',
          cantidad_total: cantidad,
          kilogramos_totales: totalKg,
        });
      }
    }

    return Array.from(agrupados.values()).sort(
      (a, b) => a.lote_descripcion.localeCompare(b.lote_descripcion)
    );
  }
}
