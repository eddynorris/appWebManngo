import { Injectable, effect, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Tipos de tema disponibles
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Clave para almacenar la preferencia de tema en localStorage
 */
const THEME_STORAGE_KEY = 'manngo-theme-preference';

/**
 * Servicio global para gestión de temas (light/dark mode)
 * 
 * Características:
 * - Soporte para tema claro, oscuro y automático
 * - Detección de preferencia del sistema (prefers-color-scheme)
 * - Persistencia de preferencia en localStorage
 * - Reactive con signals
 * - SSR-safe
 */
@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);

    /**
     * Preferencia de tema seleccionada por el usuario
     */
    readonly themePreference = signal<Theme>(this.loadThemePreference());

    /**
     * Detección de preferencia de tema del sistema
     */
    readonly systemPrefersDark = signal<boolean>(this.detectSystemTheme());

    /**
     * Tema activo actual (computed)
     * Si la preferencia es 'auto', usa la preferencia del sistema
     */
    readonly activeTheme = computed<'light' | 'dark'>(() => {
        const preference = this.themePreference();
        if (preference === 'auto') {
            return this.systemPrefersDark() ? 'dark' : 'light';
        }
        return preference;
    });

    /**
     * Check if current theme is dark
     */
    readonly isDark = computed(() => this.activeTheme() === 'dark');

    constructor() {
        if (this.isBrowser) {
            // Listen to system theme changes
            this.setupSystemThemeListener();

            // Effect to apply theme changes to DOM
            effect(() => {
                this.applyTheme(this.activeTheme());
            });

            // Effect to persist theme preference
            effect(() => {
                this.saveThemePreference(this.themePreference());
            });
        }
    }

    /**
     * Alterna entre tema claro y oscuro
     * (No afecta la opción 'auto')
     */
    toggleTheme(): void {
        const current = this.themePreference();
        if (current === 'auto') {
            // Si está en auto, cambiar al opuesto del tema del sistema
            this.setTheme(this.systemPrefersDark() ? 'light' : 'dark');
        } else {
            // Toggle entre light y dark
            this.setTheme(current === 'light' ? 'dark' : 'light');
        }
    }

    /**
     * Establece un tema específico
     */
    setTheme(theme: Theme): void {
        this.themePreference.set(theme);
    }

    /**
     * Establece el tema a la preferencia del sistema
     */
    setAutoTheme(): void {
        this.setTheme('auto');
    }

    /**
     * Aplica el tema al DOM
     */
    private applyTheme(theme: 'light' | 'dark'): void {
        if (!this.isBrowser) return;

        const html = document.documentElement;

        // Remove existing theme classes
        html.removeAttribute('data-theme');

        // Apply new theme
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        }
        // For light theme, we don't add data-theme attribute (uses :root default)
    }

    /**
     * Carga la preferencia de tema desde localStorage
     */
    private loadThemePreference(): Theme {
        if (!this.isBrowser) return 'auto';

        try {
            const saved = localStorage.getItem(THEME_STORAGE_KEY);
            if (saved === 'light' || saved === 'dark' || saved === 'auto') {
                return saved;
            }
        } catch (error) {
            console.warn('Failed to load theme preference:', error);
        }

        return 'auto'; // Default to auto
    }

    /**
     * Guarda la preferencia de tema en localStorage
     */
    private saveThemePreference(theme: Theme): void {
        if (!this.isBrowser) return;

        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    }

    /**
     * Detecta la preferencia de tema del sistema
     */
    private detectSystemTheme(): boolean {
        if (!this.isBrowser) return false;

        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /**
     * Configura listener para cambios en la preferencia del sistema
     */
    private setupSystemThemeListener(): void {
        if (!this.isBrowser) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', (e) => {
                this.systemPrefersDark.set(e.matches);
            });
        }
        // Fallback for older browsers
        else if (mediaQuery.addListener) {
            mediaQuery.addListener((e: MediaQueryListEvent) => {
                this.systemPrefersDark.set(e.matches);
            });
        }
    }
}
