import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faHome, 
  faBoxes, 
  faUsers, 
  faMoneyBillWave, 
  faCreditCard, 
  faTruck, 
  faReceipt, 
  faClipboardList, 
  faUser, 
  faChartBar, 
  faBox,
  faBars,
  faSignOutAlt,
  faChevronDown,
  faChevronRight,
  faShoppingCart,
  faWarehouse,
  faFileInvoiceDollar,
  faCogs
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../../core/services/auth.service';
import { FloatingChatComponent } from '../../chat/components/floating-chat/floating-chat.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FontAwesomeModule, FloatingChatComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSidebarOpen = signal(true);
  expandedMenus = signal(new Set<string>());

  // FontAwesome icons
  faHome = faHome;
  faBoxes = faBoxes;
  faUsers = faUsers;
  faMoneyBillWave = faMoneyBillWave;
  faCreditCard = faCreditCard;
  faTruck = faTruck;
  faReceipt = faReceipt;
  faClipboardList = faClipboardList;
  faUser = faUser;
  faChartBar = faChartBar;
  faBox = faBox;
  faBars = faBars;
  faSignOutAlt = faSignOutAlt;
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  faShoppingCart = faShoppingCart;
  faWarehouse = faWarehouse;
  faFileInvoiceDollar = faFileInvoiceDollar;
  faCogs = faCogs;

  navigationItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: faChartBar },
    { 
      label: 'Productos', 
      icon: faBoxes, 
      hasSubmenu: true,
      submenu: [
        { label: 'Lista de Productos', route: '/admin/products', icon: faBoxes },
        { label: 'Presentaciones', route: '/admin/presentaciones', icon: faBox },
        { label: 'Lotes', route: '/admin/lotes', icon: faBox }
      ]
    },
    { 
      label: 'Personas', 
      icon: faUsers, 
      hasSubmenu: true,
      submenu: [
        { label: 'Clientes', route: '/admin/clientes', icon: faUsers },
        { label: 'Proveedores', route: '/admin/proveedores', icon: faTruck }
      ]
    },
    { 
      label: 'Transacciones', 
      icon: faFileInvoiceDollar, 
      hasSubmenu: true,
      submenu: [
        { label: 'Ventas', route: '/admin/ventas', icon: faMoneyBillWave },
        { label: 'Pagos', route: '/admin/pagos', icon: faCreditCard },
        { label: 'Gastos', route: '/admin/gastos', icon: faReceipt }
      ]
    },
    { 
      label: 'Operaciones', 
      icon: faWarehouse, 
      hasSubmenu: true,
      submenu: [
        { label: 'Pedidos', route: '/admin/pedidos', icon: faTruck },
        { label: 'Inventarios', route: '/admin/inventarios', icon: faClipboardList }
      ]
    },
    { 
      label: 'Administración', 
      icon: faCogs, 
      hasSubmenu: true,
      submenu: [
        { label: 'Usuarios', route: '/admin/users', icon: faUser }
      ]
    },
    { 
      label: 'Reportes', 
      icon: faChartBar, 
      hasSubmenu: true,
      submenu: [
        { label: 'Inventario por Lote', route: '/admin/reportes/reporte-inventario-por-lote', icon: faBox },
        { label: 'Reporte Financiero', route: '/admin/reportes/reporte-financiero', icon: faFileInvoiceDollar },
        { label: 'Inventario Total', route: '/admin/reportes/reporte-inventario-global', icon: faWarehouse }
      ]
    }
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
