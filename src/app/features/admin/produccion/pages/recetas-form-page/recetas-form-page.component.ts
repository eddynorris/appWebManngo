import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom, finalize } from 'rxjs';
import { RecetaService, Receta, ComponenteReceta } from '../../services/receta.service';
import { PresentacionService } from '../../../presentaciones/services/presentacion.service';
import { PresentacionProducto } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-recetas-form-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recetas-form-page.component.html',
  styleUrl: './recetas-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class RecetasFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly recetaService = inject(RecetaService);
  private readonly presentacionService = inject(PresentacionService);
  private readonly notificationService = inject(NotificationService);

  // Signals
  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);
  recetaId = signal<number | null>(null);
  presentaciones = signal<PresentacionProducto[]>([]);
  presentacionesComponentes = signal<PresentacionProducto[]>([]);
  recetas = signal<Receta[]>([]);
  componentePresentacionesMap = signal<Map<number, PresentacionProducto[]>>(new Map());
  
  // Tipos de consumo disponibles
  tiposConsumo = signal<Array<{value: 'materia_prima' | 'insumo', label: string}>>([
    { value: 'materia_prima', label: 'Materia Prima' },
    { value: 'insumo', label: 'Insumo' }
  ]);

  // Form
  recetaForm!: FormGroup;

  // Computed
  pageTitle = computed(() => 
    this.isEditMode() ? 'Editar Receta' : 'Nueva Receta'
  );

  submitButtonText = computed(() => 
    this.isSaving() 
      ? (this.isEditMode() ? 'Actualizando...' : 'Creando...')
      : (this.isEditMode() ? 'Actualizar Receta' : 'Crear Receta')
  );

  // Método para compatibilidad con el template
  isSubmitting(): boolean {
    return this.isSaving();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPresentaciones();
    this.loadRecetas();
    this.loadPresentacionesComponentes();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.recetaForm = this.fb.group({
      presentacion_id: [null, [Validators.required]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      componentes: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }

  private async loadPresentaciones(): Promise<void> {
    try {
      this.isLoading.set(true);
      const response = await firstValueFrom(
        this.presentacionService.getPresentaciones(1, 1000, { activo: true, tipo: 'procesado,briqueta' })
      );
      this.presentaciones.set(response?.data || []);
    } catch (error) {
      console.error('Error al cargar presentaciones:', error);
      this.notificationService.showError('Error al cargar las presentaciones disponibles');
      this.presentaciones.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Cargar todas las presentaciones de componentes al inicializar
  private async loadPresentacionesComponentes(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      // Cargar presentaciones para materia prima (briqueta y bruto)
      const materiaPrimaResponse = await firstValueFrom(
        this.presentacionService.getPresentaciones(1, 1000, { activo: true, tipo: 'briqueta,bruto' })
      );
      const materiaPrimaPresentaciones = materiaPrimaResponse?.data || [];
      
      // Cargar presentaciones para insumos
      const insumoResponse = await firstValueFrom(
        this.presentacionService.getPresentaciones(1, 1000, { activo: true, tipo: 'insumo,briqueta' })
      );
      const insumoPresentaciones = insumoResponse?.data || [];
      
      // Guardar ambos tipos en el signal
      this.presentacionesComponentes.set({
        materia_prima: materiaPrimaPresentaciones,
        insumo: insumoPresentaciones
      } as any);
      
    } catch (error) {
      console.error('Error al cargar presentaciones de componentes:', error);
      this.notificationService.showError('Error al cargar los componentes disponibles');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Cargar presentaciones para componentes según el tipo (ahora usa datos precargados)
  async loadPresentacionesParaComponente(tipoConsumo: string, componenteIndex: number): Promise<void> {
    try {
      const presentacionesData = this.presentacionesComponentes() as any;
      let presentaciones: PresentacionProducto[] = [];
      
      if (tipoConsumo === 'materia_prima') {
        presentaciones = presentacionesData?.materia_prima || [];
      } else if (tipoConsumo === 'insumo') {
        presentaciones = presentacionesData?.insumo || [];
      }

      // Actualizar el mapa de presentaciones por componente
      const currentMap = this.componentePresentacionesMap();
      currentMap.set(componenteIndex, presentaciones);
      this.componentePresentacionesMap.set(new Map(currentMap));
    } catch (error) {
      console.error('Error loading presentaciones para componente:', error);
      this.notificationService.showError('Error al cargar los componentes disponibles');
    }
  }

  // Obtener presentaciones para un componente específico
  getPresentacionesParaComponente(componenteIndex: number): PresentacionProducto[] {
    // Primero intentar obtener del mapa específico del componente
    const presentacionesFromMap = this.componentePresentacionesMap().get(componenteIndex);
    if (presentacionesFromMap && presentacionesFromMap.length > 0) {
      return presentacionesFromMap;
    }

    // Si no hay en el mapa, obtener el tipo de consumo del componente y devolver las presentaciones correspondientes
    const componenteControl = this.componentesFormArray.at(componenteIndex);
    if (componenteControl) {
      const tipoConsumo = componenteControl.get('tipo_consumo')?.value;
      if (tipoConsumo) {
        const presentacionesData = this.presentacionesComponentes() as any;
        if (tipoConsumo === 'materia_prima') {
          return presentacionesData?.materia_prima || [];
        } else if (tipoConsumo === 'insumo') {
          return presentacionesData?.insumo || [];
        }
      }
    }

    return [];
  }

  // Manejar cambio de tipo de consumo
  async onTipoConsumoChange(componenteIndex: number, tipoConsumo: string): Promise<void> {
    const componenteControl = this.componentesFormArray.at(componenteIndex);
    if (componenteControl) {
      // Limpiar la selección de componente cuando cambia el tipo
      componenteControl.get('componente_presentacion_id')?.setValue('');
      
      // Cargar las nuevas presentaciones
      await this.loadPresentacionesParaComponente(tipoConsumo, componenteIndex);
    }
  }

  private async loadRecetas(): Promise<void> {
    try {
      const response = await firstValueFrom(this.recetaService.getRecetas());
      this.recetas.set(response?.data || []);
    } catch (error) {
      console.error('Error al cargar recetas:', error);
      this.notificationService.showError('Error al cargar las recetas existentes');
      this.recetas.set([]);
    }
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.isEditMode.set(true);
      this.recetaId.set(parseInt(id, 10));
      this.loadReceta(parseInt(id, 10));
    } else {
      // Agregar un componente inicial en modo creación después de que el formulario esté inicializado
      setTimeout(() => {
        if (this.recetaForm && this.recetaForm.get('componentes')) {
          this.addComponente();
        }
      }, 0);
    }
  }

  private async loadReceta(id: number): Promise<void> {
    try {
      this.isLoading.set(true);
      const receta = await firstValueFrom(this.recetaService.getRecetaById(id));
      if (!receta) {
        throw new Error('Receta no encontrada');
      }
      await this.populateForm(receta);
    } catch (error) {
      console.error('Error al cargar receta:', error);
      this.notificationService.showError('Error al cargar la receta');
      this.router.navigate(['/admin/produccion/recetas']);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async populateForm(receta: Receta): Promise<void> {
    if (!receta) {
      return;
    }

    this.recetaForm.patchValue({
      presentacion_id: receta.presentacion_id,
      nombre: receta.nombre,
      descripcion: receta.descripcion
    });

    // Limpiar componentes existentes
    const componentesArray = this.componentesFormArray;
    while (componentesArray.length > 0) {
      componentesArray.removeAt(0);
    }

    // Agregar componentes de la receta
    if (receta.componentes && Array.isArray(receta.componentes)) {
      for (let i = 0; i < receta.componentes.length; i++) {
        const componente = receta.componentes[i];
        const componenteGroup = this.createComponenteFormGroup();
        
        componenteGroup.patchValue({
          componente_presentacion_id: componente.componente_presentacion_id,
          cantidad_necesaria: componente.cantidad_necesaria,
          tipo_consumo: componente.tipo_consumo
        });
        
        componentesArray.push(componenteGroup);
        
        // Cargar las presentaciones para este componente basado en su tipo
        if (componente.tipo_consumo) {
          await this.loadPresentacionesParaComponente(componente.tipo_consumo, i);
        }
      }
    }
  }

  get componentesFormArray(): FormArray {
    if (!this.recetaForm) {
      return this.fb.array([]);
    }
    const componentes = this.recetaForm.get('componentes') as FormArray;
    if (!componentes) {
      // Si no existe el FormArray, lo creamos y lo asignamos al formulario
      const newArray = this.fb.array([]);
      this.recetaForm.setControl('componentes', newArray);
      return newArray;
    }
    return componentes;
  }

  private createComponenteFormGroup(): FormGroup {
    return this.fb.group({
      componente_presentacion_id: [null, [Validators.required]],
      cantidad_necesaria: [null, [Validators.required, Validators.min(0.01)]],
      tipo_consumo: ['', [Validators.required]]
    });
  }

  addComponente(): void {
    const componenteGroup = this.createComponenteFormGroup();
    const componentesArray = this.componentesFormArray;
    if (componentesArray && componenteGroup) {
      componentesArray.push(componenteGroup);
    }
  }

  removeComponente(index: number): void {
    console.log('removeComponente called with index:', index);
    const componentesArray = this.componentesFormArray;
    console.log('componentesArray length:', componentesArray?.length);
    console.log('componentesArray:', componentesArray);
    
    if (componentesArray && componentesArray.length > 1 && index >= 0 && index < componentesArray.length) {
      componentesArray.removeAt(index);
      console.log('Component removed successfully');
    } else {
      console.log('Cannot remove component - conditions not met:', {
        hasArray: !!componentesArray,
        length: componentesArray?.length,
        moreThanOne: componentesArray?.length > 1,
        validIndex: index >= 0 && index < (componentesArray?.length || 0)
      });
    }
  }

  onPresentacionChange(index: number, presentacionId: number): void {
    // No necesitamos lógica especial aquí para el nuevo formato
    // La presentación seleccionada se maneja directamente en el formulario
  }

  getPresentacionNombre(presentacion: PresentacionProducto): string {
    if (!presentacion) return '';
    return `${presentacion.producto?.nombre || ''} - ${presentacion.nombre || ''}`;
  }

  getPresentacionNombreById(presentacionId: number): string {
    // Buscar primero en presentaciones principales (productos finales)
    let presentacion = this.presentaciones().find(p => p.id === presentacionId);
    
    // Si no se encuentra, buscar en las presentaciones de componentes
    if (!presentacion) {
      const presentacionesData = this.presentacionesComponentes() as any;
      if (presentacionesData?.materia_prima) {
        presentacion = presentacionesData.materia_prima.find((p: PresentacionProducto) => p.id === presentacionId);
      }
      if (!presentacion && presentacionesData?.insumo) {
        presentacion = presentacionesData.insumo.find((p: PresentacionProducto) => p.id === presentacionId);
      }
    }
    
    // Si aún no se encuentra, buscar en el mapa de presentaciones por componente
    if (!presentacion) {
      const componentePresentacionesMap = this.componentePresentacionesMap();
      for (const [, presentaciones] of componentePresentacionesMap) {
        presentacion = presentaciones.find(p => p.id === presentacionId);
        if (presentacion) break;
      }
    }
    
    return presentacion ? this.getPresentacionNombre(presentacion) : 'Presentación no encontrada';
  }

  goBack(): void {
    this.router.navigate(['/admin/produccion/recetas']);
  }

  trackByPresentacionId(index: number, presentacion: any): number {
    return presentacion?.id || index;
  }

  async onSubmit(): Promise<void> {
    if (this.recetaForm.invalid) {
      this.markFormGroupTouched(this.recetaForm);
      this.notificationService.showError('Por favor, complete todos los campos requeridos.');
      return;
    }

    this.isSaving.set(true);
    
    try {
      const formValue = this.recetaForm.getRawValue();
      const recetaData: Receta = {
        presentacion_id: Number(formValue.presentacion_id),
        nombre: formValue.nombre.trim(),
        descripcion: formValue.descripcion?.trim() || '',
        componentes: formValue.componentes.map((comp: any) => ({
          componente_presentacion_id: Number(comp.componente_presentacion_id),
          cantidad_necesaria: Number(comp.cantidad_necesaria),
          tipo_consumo: comp.tipo_consumo
        }))
      };

      const id = this.recetaId();
      let operation$;
      
      if (id) {
        operation$ = this.recetaService.updateReceta(id, recetaData);
      } else {
        operation$ = this.recetaService.createReceta(recetaData);
      }

      await firstValueFrom(operation$.pipe(
        finalize(() => this.isSaving.set(false))
      ));

      this.notificationService.showSuccess(
        `Receta ${id ? 'actualizada' : 'creada'} correctamente.`
      );
      
      this.router.navigate(['/admin/produccion/recetas']);
      
    } catch (error) {
      console.error('Error al guardar receta:', error);
      this.notificationService.showError(
        `Error al ${this.isEditMode() ? 'actualizar' : 'crear'} la receta.`
      );
      this.isSaving.set(false);
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/produccion/recetas']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.recetaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isComponenteFieldInvalid(index: number, fieldName: string): boolean {
    const componentesArray = this.componentesFormArray;
    if (!componentesArray || index >= componentesArray.length) {
      return false;
    }
    
    const componenteGroup = componentesArray.at(index) as FormGroup;
    const field = componenteGroup?.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.recetaForm.get(fieldName);
    if (!field || !field.errors) return '';
    
    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} elementos`;
    
    return 'Campo inválido';
  }

  getComponenteFieldError(index: number, fieldName: string): string {
    if (!this.componentesFormArray || index < 0 || !fieldName) {
      return '';
    }
    const componenteControl = this.componentesFormArray.at(index);
    if (!componenteControl) {
      return '';
    }
    const field = componenteControl.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return 'La cantidad debe ser mayor a 0';
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

}