import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faChartLine,
    faMoneyBillWave,
    faBoxes,
    faWarehouse,
    faFilter,
    faSearch,
    faDownload,
    faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ReporteUnificadoService, ReporteUnificadoResponse, FiltrosReporteUnificado } from '../../services/reporte-unificado.service';
import { AlmacenService } from '../../../almacenes/services/almacen.service';
import { LoteService } from '../../../lotes/services/lote.service';
import { Almacen, Lote } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-reporte-unificado-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FontAwesomeModule
    ],
    templateUrl: './reporte-unificado-page.component.html',
    styleUrls: ['./reporte-unificado-page.component.scss']
})
export default class ReporteUnificadoPageComponent implements OnInit {
    private readonly reporteService = inject(ReporteUnificadoService);
    private readonly almacenService = inject(AlmacenService);
    private readonly loteService = inject(LoteService);
    private readonly notificationService = inject(NotificationService);

    // Icons
    readonly icons = {
        chart: faChartLine,
        money: faMoneyBillWave,
        boxes: faBoxes,
        warehouse: faWarehouse,
        filter: faFilter,
        search: faSearch,
        download: faDownload,
        calendar: faCalendarAlt
    };

    // State
    readonly loading = signal(false);
    readonly data = signal<ReporteUnificadoResponse | null>(null);
    readonly almacenes = signal<Almacen[]>([]);
    readonly lotes = signal<Lote[]>([]);
    readonly activeTab = signal<'financiero' | 'inventario'>('financiero');

    // Form
    readonly filterForm = new FormGroup({
        fecha_inicio: new FormControl<string>(this.formatDate(new Date(new Date().setDate(new Date().getDate() - 30)))),
        fecha_fin: new FormControl<string>(this.formatDate(new Date())),
        almacen_id: new FormControl<number | null>(null),
        lote_id: new FormControl<number | null>(null)
    });

    // Computed
    readonly kpis = computed(() => this.data()?.kpis);
    readonly financiero = computed(() => this.data()?.resumen_financiero);
    readonly ventas = computed(() => this.data()?.ventas_por_presentacion || []);
    readonly inventario = computed(() => this.data()?.inventario_actual || []);
    readonly historialDepositos = computed(() => this.data()?.historial_depositos || []);

    readonly isImageModalVisible = signal(false);
    readonly comprobanteUrl = signal<string | null>(null);

    openComprobante(url?: string | null): void {
        if (!url) return;
        this.comprobanteUrl.set(url);
        this.isImageModalVisible.set(true);
    }

    closeImageModal(): void {
        this.isImageModalVisible.set(false);
        this.comprobanteUrl.set(null);
    }

    isPdf(url: string): boolean {
        return /\.pdf(\?|$)/i.test(url);
    }

    resolveComprobanteUrl(url?: string | null): string | null {
        if (!url) return null;
        if (/^https?:\/\//i.test(url)) return url;
        return `${environment.apiUrl}/${url}`;
    }

    openExternal(url?: string | null): void {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    ngOnInit(): void {
        this.loadInitialData();
        this.setupFormListeners();
        this.generateReport(); // Initial load
    }

    private loadInitialData(): void {
        // Load Almacenes
        this.almacenService.getAlmacenes().subscribe({
            next: (data) => this.almacenes.set(data),
            error: (err) => console.error('Error loading almacenes', err)
        });

        // Load Lotes
        this.loteService.getLotes(1, 100).subscribe({
            next: (res) => this.lotes.set(res.data),
            error: (err) => console.error('Error loading lotes', err)
        });
    }

    private setupFormListeners(): void {
        this.filterForm.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
            )
            .subscribe(() => {
                this.generateReport();
            });
    }

    generateReport(): void {
        this.loading.set(true);
        const filters = this.getFilters();

        this.reporteService.obtenerReporteUnificado(filters).subscribe({
            next: (response) => {
                this.data.set(response);
                this.loading.set(false);
            },
            error: (err) => {
                this.notificationService.showError('Error al cargar el reporte unificado');
                console.error(err);
                this.loading.set(false);
            }
        });
    }

    private getFilters(): FiltrosReporteUnificado {
        const val = this.filterForm.value;
        return {
            fecha_inicio: val.fecha_inicio || undefined,
            fecha_fin: val.fecha_fin || undefined,
            almacen_id: val.almacen_id || undefined,
            lote_id: val.lote_id || undefined
        };
    }

    setActiveTab(tab: 'financiero' | 'inventario'): void {
        this.activeTab.set(tab);
    }

    formatCurrency(value: string | number | undefined): string {
        if (value === undefined || value === null) return 'S/ 0.00';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(num);
    }

    formatNumber(value: number | undefined): string {
        if (value === undefined || value === null) return '0';
        return new Intl.NumberFormat('es-PE').format(value);
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
