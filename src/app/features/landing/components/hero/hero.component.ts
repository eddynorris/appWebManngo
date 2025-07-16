import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class LandingHeroComponent implements AfterViewInit {
  @ViewChild('heroVideo', { static: false }) heroVideo!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    if (this.heroVideo?.nativeElement) {
      const video = this.heroVideo.nativeElement;
      video.muted = true;
      video.play().catch(() => {
        // Fallback si autoplay falla
        console.log('Autoplay was prevented');
      });
    }
  }

  scrollToProducts() {
    const productsSection = document.getElementById('productos');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
