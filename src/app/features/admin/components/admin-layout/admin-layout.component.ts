import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBars,
  faBell,
  faBox,
  faChartLine,
  faChevronDown,
  faChevronRight,
  faCog,
  faFileInvoiceDollar,
  faHome,
  faSearch,
  faSignOutAlt,
  faTimes,
  faUser,
  faUsers,
  faWarehouse
} from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '../../../../core/services/auth.service';
import { NAVIGATION_ITEMS, NavigationItem } from '../../config/navigation.config';

/**
 * Layout principal del panel de administración
 * Maneja la navegación, sidebar colapsable y header
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FontAwesomeModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AdminLayoutComponent {
  // Services
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // UI State
  readonly isSidebarOpen = signal(true);
  isMobile = signal(false);
  readonly expandedMenus = signal<Set<string>>(new Set());

  // Navigation Configuration
  readonly navigationItems: NavigationItem[] = NAVIGATION_ITEMS;

  // UI Icons
  readonly icons = {
    bars: faBars,
    times: faTimes,
    search: faSearch,
    bell: faBell,
    user: faUser,
    signOut: faSignOutAlt,
    chevronDown: faChevronDown,
    chevronRight: faChevronRight,
    home: faHome,
    chart: faChartLine,
    users: faUsers,
    box: faBox,
    warehouse: faWarehouse,
    invoice: faFileInvoiceDollar,
    cog: faCog
  };

  // Computed State
  readonly currentUser = computed(() => this.authService.currentUser());

  currentYear = new Date().getFullYear();

  constructor() {
    // Initialize responsive behavior
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  /**
   * Alterna la visibilidad del sidebar
   */
  toggleSidebar(): void {
    this.isSidebarOpen.update(value => !value);
  }

  /**
   * Alterna la expansión de un submenú
   */
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

  /**
   * Verifica si un submenú está expandido
   */
  isMenuExpanded(label: string): boolean {
    return this.expandedMenus().has(label);
  }

  /**
   * Cierra sesión del usuario actual
   */
  logout(): void {
    this.authService.logout();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile();
    const isNowMobile = window.innerWidth < 1024; // lg breakpoint

    this.isMobile.set(isNowMobile);

    // Auto-collapse sidebar on mobile, auto-expand on desktop if it wasn't manually toggled
    if (isNowMobile && !wasMobile) {
      this.isSidebarOpen.set(false);
    } else if (!isNowMobile && wasMobile) {
      this.isSidebarOpen.set(true);
    }
  }
}
