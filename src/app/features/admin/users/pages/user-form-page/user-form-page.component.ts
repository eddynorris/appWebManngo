import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { UserService } from '../../services/user.service';
import { AlmacenService } from '../../../almacenes/services/almacen.service';
import { User, Almacen } from '../../../../../types/contract.types';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-user-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form-page.component.html',
  styleUrl: './user-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UserFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly almacenService = inject(AlmacenService);
  private readonly notificationService = inject(NotificationService);

  userForm: FormGroup;
  isLoading = signal(false);
  isEditMode = signal(false);
  userId = signal<number | null>(null);

  almacenes = signal<Almacen[]>([]);
  roles = signal(['admin', 'usuario']); // Hardcoded for now

  constructor() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: [''], // Not required on edit unless changing
      rol: ['', Validators.required],
      almacen_id: [null as number | null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadAlmacenes();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(+id);
      this.userForm.get('password')?.setValidators(null);
      this.userForm.get('password')?.updateValueAndValidity(); // Update validity after changing validators
      this.loadUserData(+id);
    } else {
      this.userForm.get('password')?.setValidators(Validators.required);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadAlmacenes(): void {
    this.almacenService.getAlmacenes().subscribe(data => {
      const almacenesValidos = data.filter(almacen => almacen.id != null);
      this.almacenes.set(almacenesValidos);
    });
  }

  loadUserData(id: number): void {
    this.isLoading.set(true);
    this.userService.getUserById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(user => {
        this.userForm.patchValue({
          username: user.username,
          rol: user.rol,
          almacen_id: user.almacen_id
        });
      });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.notificationService.showError('Formulario inválido. Revisa los campos.');
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.userForm.getRawValue();
    const id = this.userId();

    const payload: Partial<User> = {
      username: formValue.username,
      rol: formValue.rol,
      almacen_id: Number(formValue.almacen_id),
    };

    // Only include password if it's not edit mode or if it has been filled
    if (!this.isEditMode() || formValue.password) {
      payload.password = formValue.password;
    }

    const operation$ = id
      ? this.userService.updateUser(id, payload)
      : this.userService.createUser(payload as User);

    operation$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(`Usuario ${id ? 'actualizado' : 'creado'} correctamente.`);
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.notificationService.showError(`Error al ${id ? 'actualizar' : 'crear'} el usuario.`);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }
}
