import { Component } from '@angular/core';
import { LandingHeaderComponent } from '../components/header/header.component';
import { LandingHeroComponent } from '../components/hero/hero.component';
import { LandingProductsPreviewComponent } from '../components/products-preview/products-preview.component';
import { LandingBenefitsComponent } from '../components/benefits/benefits.component';
import { LandingRecipesPreviewComponent } from '../components/recipes-preview/recipes-preview.component';
import { LandingTestimonialsComponent } from '../components/testimonials/testimonials.component';
import { LandingCtaBannerComponent } from '../components/cta-banner/cta-banner.component';
import { LandingFooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [
    LandingHeaderComponent,
    LandingHeroComponent,
    LandingProductsPreviewComponent,
    LandingBenefitsComponent,
    LandingRecipesPreviewComponent,
    LandingTestimonialsComponent,
    LandingCtaBannerComponent,
    LandingFooterComponent
  ],
  template: `
    <app-landing-header />
    <app-landing-hero />
    <app-landing-products-preview />
    <app-landing-benefits />
    <app-landing-recipes-preview />
    <app-landing-testimonials />
    <app-landing-cta-banner />
    <app-landing-footer />
  `
})
export class HomePage {}
