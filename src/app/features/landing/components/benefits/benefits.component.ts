import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-benefits',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="beneficios" class="benefits-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            Nuestro épico y extenso portafolio de productos BBQ está unido por tres características:
          </h2>
        </div>

        <div class="benefits-grid">
          <div class="benefit-card" *ngFor="let benefit of benefits">
            <div class="benefit-icon">
              <span class="icon">{{ benefit.icon }}</span>
            </div>
            <h3 class="benefit-title">{{ benefit.title }}</h3>
            <p class="benefit-description">{{ benefit.description }}</p>
          </div>
        </div>

        <div class="quality-statement">
          <h3 class="quality-title">
            Esto asegura que nuestro carbón sea el más caliente, duradero y limpio disponible.
          </h3>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .benefits-section {
      padding: 6rem 0;
      background: #000;
      color: #fff;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .section-title {
      font-size: clamp(1.8rem, 4vw, 2.5rem);
      font-weight: 700;
      color: #fff;
      max-width: 900px;
      margin: 0 auto;
      line-height: 1.3;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 3rem;
      margin-bottom: 4rem;
    }

    .benefit-card {
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #111, #222);
      border-radius: 12px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 1px solid #333;
    }

    .benefit-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(255, 68, 68, 0.1);
      border-color: #ff4444;
    }

    .benefit-icon {
      margin-bottom: 1.5rem;
    }

    .icon {
      font-size: 4rem;
      display: inline-block;
      padding: 1rem;
      background: linear-gradient(135deg, #ff4444, #ff6666);
      border-radius: 50%;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .benefit-title {
      font-size: 1.5rem;
      font-weight: 900;
      color: #ff4444;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .benefit-description {
      color: #ccc;
      line-height: 1.6;
      font-size: 1rem;
      font-style: italic;
    }

    .quality-statement {
      text-align: center;
      padding: 3rem 0;
      border-top: 2px solid #333;
    }

    .quality-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700;
      color: #fff;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .benefits-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .benefit-card {
        padding: 1.5rem;
      }

      .icon {
        width: 100px;
        height: 100px;
        font-size: 3rem;
      }
    }
  `]
})
export class LandingBenefitsComponent {
  benefits = [
    {
      icon: '🌿',
      title: 'NATURAL, DE VERDAD',
      description: 'Sin tonterías. Sin químicos. Sin rellenos. Nada que ocultar. Hecho exclusivamente de fuentes y materiales naturales y no tóxicos.'
    },
    {
      icon: '🏆',
      title: 'RENDIMIENTO EXTRAORDINARIO',
      description: 'Productos premium, galardonados, funcionan tan bien que puedes usar MENOS (¡o usarlos de nuevo!). Nuestros combustibles son extraordinariamente grandes, puros, calientes y duraderos.'
    },
    {
      icon: '🔥',
      title: 'INNOVACIÓN IMPLACABLE',
      description: 'Exploramos el mundo para traerte ingredientes únicos, formatos poco comunes, sabores y empaques para elevar la experiencia BBQ.'
    }
  ];
}
