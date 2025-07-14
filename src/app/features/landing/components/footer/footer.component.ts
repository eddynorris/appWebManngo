import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqModalComponent } from '../modals/faq-modal/faq-modal.component';
import { PrivacyPolicyModalComponent } from '../modals/privacy-policy-modal/privacy-policy-modal.component';
import { TermsConditionsModalComponent } from '../modals/terms-conditions-modal/terms-conditions-modal.component';
import { OurStoryModalComponent } from '../modals/our-story-modal/our-story-modal.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faFacebookF, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { SmoothScrollService } from '../../services/smooth-scroll.service';


@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [
    CommonModule,
    FaqModalComponent,
    PrivacyPolicyModalComponent,
    TermsConditionsModalComponent,
    OurStoryModalComponent,
    FontAwesomeModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooterComponent {
  private readonly smoothScrollService = inject(SmoothScrollService);
  private readonly library = inject(FaIconLibrary);

  isMenuOpen = false;

  showPrivacyModal = signal(false);
  showTermsModal = signal(false);
  showStoryModal = signal(false);
  showFaqModal = signal(false);

  constructor() {
    this.library.addIcons(faFacebookF, faInstagram, faYoutube);
  }

  currentYear = computed(() => new Date().getFullYear());

  openPrivacyModal(): void {
    this.showPrivacyModal.set(true);
  }

  closePrivacyModal(): void {
    this.showPrivacyModal.set(false);
  }

  openTermsModal(): void {
    this.showTermsModal.set(true);
  }

  closeTermsModal(): void {
    this.showTermsModal.set(false);
  }

  openStoryModal(): void {
    this.showStoryModal.set(true);
  }

  closeStoryModal(): void {
    this.showStoryModal.set(false);
  }

  openFaqModal(): void {
    this.showFaqModal.set(true);
  }

  closeFaqModal(): void {
    this.showFaqModal.set(false);
  }

  scrollToSection(sectionId: string): void {
    this.smoothScrollService.scrollToSection(sectionId);
  }
}
