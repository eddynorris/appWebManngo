import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmoothScrollService } from '../../services/smooth-scroll.service';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeaderComponent implements OnInit {
  private readonly smoothScrollService = inject(SmoothScrollService);
  
  isMenuOpen = false;
  activeSection = this.smoothScrollService.getActiveSection();

  ngOnInit(): void {
    this.smoothScrollService.initializeScrollSpy();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToSection(sectionId: string): void {
    this.smoothScrollService.scrollToSection(sectionId);
    this.isMenuOpen = false; // Cerrar menú móvil después de navegar
  }

  isActiveSection(sectionId: string): boolean {
    return this.activeSection() === sectionId;
  }
}
