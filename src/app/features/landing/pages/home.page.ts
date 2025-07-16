import { Component } from '@angular/core';
import { LandingHeaderComponent } from '../components/header/header.component';
import { LandingHeroComponent } from '../components/hero/hero.component';
import { LandingProductsPreviewComponent } from '../components/products-preview/products-preview.component';
import { LandingCtaBannerComponent } from '../components/cta-banner/cta-banner.component';
import { LandingFooterComponent } from '../components/footer/footer.component';
import { WhatsappButtonComponent } from '../components/whatsapp-button/whatsapp-button.component';

@Component({
  selector: 'app-landing-home',
  imports: [
    LandingHeaderComponent,
    LandingHeroComponent,
    LandingProductsPreviewComponent,
    LandingCtaBannerComponent,
    LandingFooterComponent,
    WhatsappButtonComponent
  ],
  template: `
    <app-landing-header />
    <app-landing-hero />
    <app-landing-products-preview />
<!--<app-landing-benefits />
    <app-landing-recipes-preview />
    <app-landing-testimonials /> -->
    <app-landing-cta-banner />
    <app-landing-footer />

    <!-- WhatsApp Button -->
    <app-whatsapp-button
      phoneNumber="+51927577215"
      message="¡Hola! Me interesa conocer más sobre sus productos de carbón Manngo."
      buttonText="Contactar" />
  `
})
export class HomePage {}
