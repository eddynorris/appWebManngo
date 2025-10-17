import { Component, input, output, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface Cliente {
  id?: number;
  nombre?: string;
  email?: string;
  telefono?: string;
}

@Component({
  selector: 'app-client-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-select.component.html',
  styleUrls: ['./client-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSelectComponent {
  // Inputs
  placeholder = input<string>('Buscar cliente...');
  disabled = input<boolean>(false);
  selectedClientId = input<number | null>(null);
  label = input<string>('Cliente');
  required = input<boolean>(false);
  clients = input<Cliente[]>([]);

  // Outputs
  clientSelected = output<Cliente | null>();
  clientIdChange = output<number | null>();
  
  // ID único para el componente
  readonly componentId = `client-select-${Math.random().toString(36).substr(2, 9)}`;

  // Signals para el estado del componente
  isDropdownOpen = signal<boolean>(false);
  searchTerm = signal<string>('');
  selectedClient = signal<Cliente | null>(null);

  // Form control para la búsqueda
  searchControl = new FormControl('');

  // Computed para filtrar clientes
  filteredClients = computed(() => {
    const clients = this.clients();
    const term = this.searchTerm().toLowerCase().trim();
    
    if (!term) {
      return clients;
    }
    
    return clients.filter(client => 
      (client.nombre && client.nombre.toLowerCase().includes(term)) ||
      (client.email && client.email.toLowerCase().includes(term))
    );
  });

  // Computed para el texto mostrado en el input
  displayText = computed(() => {
    const selected = this.selectedClient();
    if (selected) {
      return selected.nombre || '';
    }
    return this.searchTerm();
  });

  constructor() {
    // Configurar búsqueda con debounce
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(value => {
      this.searchTerm.set(value || '');
    });

    // Effect para sincronizar el cliente seleccionado desde el input
    effect(() => {
      const clientId = this.selectedClientId();
      if (clientId) {
        const client = this.clients().find(c => c.id === clientId);
        if (client) {
          this.selectedClient.set(client);
          this.searchControl.setValue(client.nombre || '', { emitEvent: false });
        }
      } else {
        this.selectedClient.set(null);
        this.searchControl.setValue('', { emitEvent: false });
      }
    });
  }



  onInputFocus(): void {
    this.isDropdownOpen.set(true);
  }

  onInputBlur(): void {
    // Delay para permitir clicks en el dropdown
    setTimeout(() => {
      this.isDropdownOpen.set(false);
    }, 200);
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    // Si el usuario está escribiendo, limpiar la selección
    if (this.selectedClient() && value !== (this.selectedClient()?.nombre || '')) {
      this.selectedClient.set(null);
      this.clientSelected.emit(null);
      this.clientIdChange.emit(null);
    }
    
    this.searchControl.setValue(value);
  }

  selectClient(client: Cliente): void {
    this.selectedClient.set(client);
    this.searchControl.setValue(client.nombre || '', { emitEvent: false });
    this.searchTerm.set('');
    this.isDropdownOpen.set(false);
    
    // Emitir eventos
    this.clientSelected.emit(client);
    this.clientIdChange.emit(client.id || null);
  }

  clearSelection(): void {
    this.selectedClient.set(null);
    this.searchControl.setValue('', { emitEvent: false });
    this.searchTerm.set('');
    
    // Emitir eventos
    this.clientSelected.emit(null);
    this.clientIdChange.emit(null);
  }


}