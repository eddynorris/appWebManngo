import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AlmacenService } from '../../almacenes/services/almacen.service';
import { LoteService } from '../../lotes/services/lote.service';
import { PresentacionService } from '../../presentaciones/services/presentacion.service';
import { ProduccionService } from '../services/produccion.service';
import { RecetaService, Receta, ComponenteReceta } from '../services/receta.service';
import { Almacen, PresentacionProducto, Lote } from '../../../../types/contract.types';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-produccion-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produccion-page.component.html',
  styleUrl: './produccion-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ProduccionPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly almacenService = inject(AlmacenService);
  private readonly loteService = inject(LoteService);
  private readonly presentacionService = inject(PresentacionService);
  private readonly produccionService = inject(ProduccionService);
  private readonly recetaService = inject(RecetaService);
  private readonly notificationService = inject(NotificationService);

  produccionForm!: FormGroup;
  almacenes = signal<Almacen[]>([]);
  presentaciones = signal<PresentacionProducto[]>([]);
  recetaActual = signal<Receta | null>(null);
  materiasPrimas = signal<ComponenteReceta[]>([]);
  todosLosLotes = signal<Lote[]>([]);
  lotesDisponibles = signal<Map<number, Lote[]>>(new Map());
  lotesDestino = signal<Lote[]>([]);

  ngOnInit() {
    this.produccionForm = this.fb.group({
      almacen_id: ['', Validators.required],
      presentacion_id: ['', Validators.required],
      cantidad_a_producir: ['', [Validators.required, Validators.min(1)]],
      lote_destino_id: [''],
      lotes_seleccionados: this.fb.array([]),
    });

    // Cargar datos iniciales
    this.loadInitialData();
    
    // Escuchar cambios en la selección del producto
    this.produccionForm.get('presentacion_id')?.valueChanges.subscribe(presentacionId => {
      if (presentacionId) {
        this.onProductoSeleccionado(presentacionId);
      } else {
        this.resetReceta();
      }
    });
    
    // Listener para cambios en almacen_id
    this.produccionForm.get('almacen_id')?.valueChanges.subscribe(almacenId => {
      if (almacenId) {
        // Filtrar lotes por almacén localmente
        // Nota: El modelo Lote actual no tiene almacen_id, por ahora mostramos todos
        this.lotesDestino.set(this.todosLosLotes());
      } else {
        this.lotesDestino.set([]);
      }
    });
  }

  get lotesSeleccionados() {
    return this.produccionForm.get('lotes_seleccionados') as FormArray;
  }

  private async loadInitialData() {
    try {
      // Cargar todos los datos en paralelo
      const [almacenesData, procesadosResponse, briquetasResponse, lotesResponse] = await Promise.all([
        this.almacenService.getAlmacenes().toPromise(),
        this.presentacionService.getPresentaciones(1, 1000, { activo: true, tipo: 'procesado' }).toPromise(),
        this.presentacionService.getPresentaciones(1, 1000, { activo: true, tipo: 'briqueta' }).toPromise(),
        this.loteService.getLotes(1, 10000, { is_active: true }).toPromise() // Cargar solo lotes activos
      ]);
      
      // Establecer almacenes
      if (almacenesData) {
        this.almacenes.set(almacenesData);
      }
      
      // Establecer presentaciones combinadas
      const presentacionesCombinadas = [
        ...(procesadosResponse?.data || []),
        ...(briquetasResponse?.data || [])
      ];
      this.presentaciones.set(presentacionesCombinadas);
      
      // Establecer todos los lotes
      if (lotesResponse?.data) {
        this.todosLosLotes.set(lotesResponse.data);
      }
      
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      this.notificationService.showError('Error al cargar los datos iniciales');
      this.almacenes.set([]);
      this.presentaciones.set([]);
      this.todosLosLotes.set([]);
    }
  }

  private async onProductoSeleccionado(presentacionId: number) {
    try {
      
      // Obtener la receta del producto seleccionado
      const response = await this.recetaService.getRecetas(1, 1, { presentacion_id: presentacionId }).toPromise();
      
      // Manejar tanto el formato paginado como el formato directo
      let recetas: Receta[] = [];
      if (response) {
        if (Array.isArray(response)) {
          // Si la respuesta es directamente un array
          recetas = response;
        } else if (response.data && Array.isArray(response.data)) {
          // Si la respuesta tiene formato paginado
          recetas = response.data;
        } else if ((response as any).id) {
          // Si la respuesta es un objeto de receta único
          recetas = [response as any];
        }
      }
      
      if (recetas && recetas.length > 0) {
        const receta = recetas[0];
        this.recetaActual.set(receta);
        
        // Filtrar materias primas e insumos
        const componentesParaProduccion = receta.componentes.filter((c: ComponenteReceta) => 
          c.tipo_consumo === 'materia_prima'
        );
        this.materiasPrimas.set(componentesParaProduccion);
        
        // Crear formularios para cada componente
        this.createMateriasPrimasFormArray(componentesParaProduccion);
        
        // Cargar lotes para cada componente
        this.loadLotesParaMateriasPrimas(componentesParaProduccion);
      } else {
        this.notificationService.showWarning('No se encontró receta para este producto');
        this.resetReceta();
      }
    } catch (error) {
      console.error('💥 Error al obtener receta:', error);
      this.notificationService.showError('Error al cargar la receta del producto');
      this.resetReceta();
    }
  }

  private createMateriasPrimasFormArray(materiasPrimas: ComponenteReceta[]) {
    // Limpiar array actual
    while (this.lotesSeleccionados.length !== 0) {
      this.lotesSeleccionados.removeAt(0);
    }
    
    // Crear un FormGroup para cada materia prima
    materiasPrimas.forEach(mp => {
      const loteForm = this.fb.group({
        componente_presentacion_id: [mp.componente_presentacion_id, Validators.required],
        lote_id: ['', Validators.required]
      });
      this.lotesSeleccionados.push(loteForm);
    });
  }

  private loadLotesParaMateriasPrimas(materiasPrimas: ComponenteReceta[]) {
    const lotesMap = new Map<number, Lote[]>();
    
    for (const mp of materiasPrimas) {
      // Filtrar lotes localmente - por ahora mostramos todos los lotes disponibles
      // ya que el modelo Lote actual no tiene relación directa con presentaciones
      const lotesFiltrados = this.todosLosLotes().filter(lote => 
        lote.cantidad_disponible_kg && parseFloat(lote.cantidad_disponible_kg) > 0
      );
      
      lotesMap.set(mp.componente_presentacion_id, lotesFiltrados);
    }
    
    this.lotesDisponibles.set(lotesMap);
  }

  private resetReceta() {
    this.recetaActual.set(null);
    this.materiasPrimas.set([]);
    this.lotesDisponibles.set(new Map());
    
    // Limpiar array de lotes
    while (this.lotesSeleccionados.length !== 0) {
      this.lotesSeleccionados.removeAt(0);
    }
  }

  getLotesParaMateriaPrima(presentacionId: number): Lote[] {
    return this.lotesDisponibles().get(presentacionId) || [];
  }

  getMateriaPrimaNombre(presentacionId: number): string {
    const mp = this.materiasPrimas().find(m => m.componente_presentacion_id === presentacionId);
    return mp?.presentacion?.nombre || 'Materia Prima';
  }



  onSubmit() {
    if (this.produccionForm.valid && this.materiasPrimas().length > 0) {
      const loteDestinoId = this.produccionForm.get('lote_destino_id')?.value;
      
      const formData: any = {
        almacen_id: this.produccionForm.get('almacen_id')?.value,
        presentacion_id: this.produccionForm.get('presentacion_id')?.value,
        cantidad_a_producir: this.produccionForm.get('cantidad_a_producir')?.value,
        lotes_seleccionados: this.produccionForm.get('lotes_seleccionados')?.value
      };
      
      // Solo incluir lote_destino_id si tiene un valor
      if (loteDestinoId && loteDestinoId !== '') {
        formData.lote_destino_id = loteDestinoId;
      }
      
      // Cambiar endpoint a /api/produccion/fabricacion
      this.produccionService.createFabricacion(formData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Producción registrada exitosamente');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error al registrar producción:', error);
          this.notificationService.showError('Error al registrar la producción');
        }
      });
    } else if (this.materiasPrimas().length === 0) {
      this.notificationService.showWarning('Debe seleccionar un producto que tenga receta configurada');
    }
  }

  private resetForm() {
    this.produccionForm.reset({
      almacen_id: '',
      presentacion_id: '',
      cantidad_unidades: ''
    });
    
    // Limpiar array de lotes
    while (this.lotesSeleccionados.length !== 0) {
      this.lotesSeleccionados.removeAt(0);
    }
  }
}
