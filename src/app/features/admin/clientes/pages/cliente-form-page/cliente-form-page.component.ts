import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-cliente-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './cliente-form-page.component.html',
  styleUrl: './cliente-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClienteFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clienteService = inject(ClienteService);
  private readonly notificationService = inject(NotificationService);

  isLoading = signal(false);
  clienteId = signal<number | null>(null);
  isEditMode = signal(false);

  clienteForm = this.fb.group({
    nombre: ['', Validators.required],
    telefono: [''],
    direccion: [''],
    ciudad: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.clienteId.set(+id);
      this.loadClienteData(+id);
    }
  }

  loadClienteData(id: number): void {
    this.isLoading.set(true);
    this.clienteService.getClienteById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(cliente => {
        this.clienteForm.patchValue(cliente);
      });
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.notificationService.showError('Por favor, completa los campos requeridos.');
      return;
    }

    this.isLoading.set(true);
    const formValue = this.clienteForm.getRawValue();
    const id = this.clienteId();

    const payload = {
      nombre: formValue.nombre || '',
      telefono: formValue.telefono || '',
      direccion: formValue.direccion || '',
      ciudad: formValue.ciudad || ''
    };

    const operation$ = id
      ? this.clienteService.updateCliente(id, payload)
      : this.clienteService.createCliente(payload as Omit<Cliente, 'id'>);

    operation$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Cliente ${id ? 'actualizado' : 'creado'} correctamente.`);
          this.router.navigate(['/admin/clientes']);
        },
        error: (err) => {
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} el cliente.`);
          console.error(err);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/clientes']);
  }
}
