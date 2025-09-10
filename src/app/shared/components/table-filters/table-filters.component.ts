import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ClientSelectComponent } from '../client-select/client-select.component';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'client-select';
  placeholder?: string;
  options?: { value: any; label: string }[];
  colSpan?: 1 | 2 | 3 | 4 | 'full';
}

export interface Cliente {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
}

export interface FilterValues {
  [key: string]: any;
}

@Component({
  selector: 'app-table-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClientSelectComponent],
  templateUrl: './table-filters.component.html',
  styleUrls: ['./table-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFiltersComponent {
  // Inputs usando la nueva API de Angular
  title = input<string>('Filtros Unificados');
  filters = input.required<FilterConfig[]>();
  initialValues = input<FilterValues>({});
  showActions = input<boolean>(true);
  clients = input<Cliente[]>([]);
  
  // Outputs usando la nueva API de Angular
  filtersChange = output<FilterValues>();
  search = output<FilterValues>();
  export = output<FilterValues>();
  clear = output<void>();

  // Form group reactivo
  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({});
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges() {
    if (this.filters()) {
      this.initializeForm();
    }
  }

  private initializeForm() {
    const formControls: { [key: string]: any } = {};
    const initialValues = this.initialValues();
    
    this.filters().forEach(filter => {
      formControls[filter.key] = [initialValues[filter.key] || ''];
    });

    this.filterForm = this.fb.group(formControls);
    
    // Emitir cambios cuando el formulario cambie
    this.filterForm.valueChanges.subscribe(values => {
      this.filtersChange.emit(values);
    });
  }

  // Computed para obtener los valores actuales del formulario
  currentValues = computed(() => {
    return this.filterForm?.value || {};
  });

  onSearch() {
    this.search.emit(this.filterForm.value);
  }

  onExport() {
    this.export.emit(this.filterForm.value);
  }

  onClear() {
    this.filterForm.reset();
    this.clear.emit();
  }

  getColSpanClass(colSpan?: 1 | 2 | 3 | 4 | 'full'): string {
    if (!colSpan) return 'col-1';
    return colSpan === 'full' ? 'col-full' : `col-${colSpan}`;
  }

  onClientSelected(filterKey: string, client: any): void {
    if (client) {
      this.filterForm.patchValue({ [filterKey]: client.id });
    } else {
      this.filterForm.patchValue({ [filterKey]: null });
    }
  }
}