import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSidebarOpen = signal(true);

  navigationItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '📊' },
    { label: 'Productos', route: '/admin/products', icon: '📦' },
    { label: 'Clientes', route: '/admin/clientes', icon: '👥' },
    { label: 'Ventas', route: '/admin/ventas', icon: '💰' },
    { label: 'Pagos', route: '/admin/pagos', icon: '💳' },
    { label: 'Pedidos', route: '/admin/pedidos', icon: '🚚' },
    { label: 'Gastos', route: '/admin/gastos', icon: '💸' },
    { label: 'Inventarios', route: '/admin/inventarios', icon: '📋' },
    { label: 'Usuarios', route: '/admin/users', icon: '👤' },
  ];

  toggleSidebar(): void {
    this.isSidebarOpen.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
  }
}
