import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Componente toggle para cambiar entre tema claro y oscuro
 * 
 * Features:
 * - Animación suave de transición
 * - Icono dinámico (sol/luna)
 * - Tooltip descriptivo
 * - Accesible (ARIA labels)
 */
@Component({
    selector: 'app-theme-toggle',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    template: `
    <button
      (click)="toggleTheme()"
      class="theme-toggle"
      type="button"
      [attr.aria-label]="ariaLabel()"
      [title]="tooltipText()">
      <span class="icon-wrapper" [class.flip]="isDark()">
        <fa-icon
          [icon]="currentIcon()"
          class="theme-icon"
          [attr.aria-hidden]="true">
        </fa-icon>
      </span>
    </button>
  `,
    styleUrls: ['./theme-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
    private readonly themeService = inject(ThemeService);

    // Icons
    readonly faSun = faSun;
    readonly faMoon = faMoon;

    // State
    readonly isDark = this.themeService.isDark;

    // Computed properties
    readonly currentIcon = computed(() => {
        return this.isDark() ? this.faMoon : this.faSun;
    });

    readonly ariaLabel = computed(() => {
        return this.isDark()
            ? 'Cambiar a modo claro'
            : 'Cambiar a modo oscuro';
    });

    readonly tooltipText = computed(() => {
        return this.isDark()
            ? 'Modo Claro'
            : 'Modo Oscuro';
    });

    /**
     * Toggle theme
     */
    toggleTheme(): void {
        this.themeService.toggleTheme();
    }
}
