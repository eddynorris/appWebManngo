import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SmoothScrollService {
  private activeSection = signal<string>('');

  getActiveSection() {
    return this.activeSection.asReadonly();
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Offset para el header fijo
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      // Actualizar sección activa después de un delay para la animación
      setTimeout(() => {
        this.activeSection.set(sectionId);
      }, 500);
    }
  }

  initializeScrollSpy(): void {
    const sections = [
      'hero',
      'productos', 
      'beneficios',
      'recetas',
      'testimonios',
      'contacto'
    ];

    // Observer para detectar qué sección está visible
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0% -20% 0%',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.activeSection.set(entry.target.id);
        }
      });
    }, observerOptions);

    // Observar todas las secciones
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    this.activeSection.set('hero');
  }
}