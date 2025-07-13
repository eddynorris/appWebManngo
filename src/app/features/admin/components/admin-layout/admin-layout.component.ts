import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSidebarOpen = signal(true);
  expandedMenus = signal(new Set<string>());

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
    { 
      label: 'Reportes', 
      icon: '📊', 
      hasSubmenu: true,
      submenu: [
        { label: 'Inventario por Lote', route: '/admin/reportes/reporte-inventario-por-lote', icon: '📦' },
      ]
    },
  ];

  toggleSidebar(): void {
    this.isSidebarOpen.update(value => !value);
  }

  toggleSubmenu(label: string): void {
    this.expandedMenus.update(expanded => {
      const newExpanded = new Set(expanded);
      if (newExpanded.has(label)) {
        newExpanded.delete(label);
      } else {
        newExpanded.add(label);
      }
      return newExpanded;
    });
  }

  isSubmenuExpanded(label: string): boolean {
    return this.expandedMenus().has(label);
  }

  logout(): void {
    this.authService.logout();
  }
}
