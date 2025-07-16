import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { UserService } from '../../services/user.service';
import { User, Pagination } from '../../../../../types/contract.types';

import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import { ColumnConfig, ActionConfig } from '../../../../../shared/components/data-table/data-table.types';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { ConfirmationModalComponent } from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-users-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DataTableComponent,
    PaginationComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './users-list-page.component.html',
  styleUrl: './users-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsersListPageComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  users = signal<User[]>([]);
  pagination = signal<Pagination | null>(null);
  isLoading = signal(false);
  isDeleteModalVisible = signal(false);
  userToDelete = signal<User | null>(null);

  columns: ColumnConfig<User>[] = [
    { key: 'username', label: 'Username', type: 'text' },
    { key: 'rol', label: 'Rol', type: 'text' },
    { key: 'almacen.nombre', label: 'Almacén', type: 'text' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  actions: ActionConfig[] = [
    { icon: faEdit, label: '', action: 'edit' },
    { icon: faTrash, label: '', action: 'delete', danger: true },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 1, limit: number = 10): void {
    this.isLoading.set(true);
    this.userService.getUsers(page, limit).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar los usuarios.');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadUsers(page);
  }

  handleTableAction(event: { action: string; item: User }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/admin/users/edit', event.item.id]);
    } else if (event.action === 'delete') {
      this.userToDelete.set(event.item);
      this.isDeleteModalVisible.set(true);
    }
  }

  handleDeleteConfirmation(): void {
    const user = this.userToDelete();
    if (!user || !user.id) return;

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Usuario eliminado correctamente.');
        const currentPage = this.pagination()?.page || 1;
        this.loadUsers(currentPage);
      },
      error: (err) => {
        this.notificationService.showError('Error al eliminar el usuario.');
      },
    });
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible.set(false);
    this.userToDelete.set(null);
  }
}
