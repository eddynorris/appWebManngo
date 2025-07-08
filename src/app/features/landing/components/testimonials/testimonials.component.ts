import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-testimonials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="testimonios" class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Habla el Diablo</h2>
          <p class="section-subtitle">
            Maestros parrilleros, chefs, competidores y entusiastas de todo el país están viendo la luz
            (...y el calor. Y la falta de chispas y ceniza. Y... bueno, ya entiendes la idea).
            Mira las reseñas:
          </p>
        </div>

        <div class="testimonials-grid">
          <div class="testimonial-card" *ngFor="let testimonial of testimonials">
            <div class="testimonial-content">
              <blockquote class="testimonial-quote">
                {{ testimonial.quote }}
              </blockquote>
              <div class="testimonial-author">
                <h4 class="author-name">{{ testimonial.author }}</h4>
                <p class="author-title">{{ testimonial.title }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .testimonials-section {
      padding: 6rem 0;
      background: linear-gradient(135deg, #111, #000);
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
      font-size: 3rem;
      font-weight: 900;
      color: #ff4444;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
    }

    .section-subtitle {
      font-size: 1.1rem;
      color: #ccc;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .testimonial-card {
      background: #222;
      border-radius: 12px;
      padding: 2rem;
      border-left: 4px solid #ff4444;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .testimonial-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(255, 68, 68, 0.2);
    }

    .testimonial-quote {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #fff;
      margin-bottom: 1.5rem;
      font-style: italic;
      position: relative;
      padding-left: 2rem;
    }

    .testimonial-quote::before {
      content: '"';
      position: absolute;
      left: 0;
      top: -10px;
      font-size: 3rem;
      color: #ff4444;
      font-weight: bold;
    }

    .author-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #ff4444;
      margin-bottom: 0.5rem;
    }

    .author-title {
      color: #ccc;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .testimonials-grid {
        grid-template-columns: 1fr;
      }

      .section-title {
        font-size: 2.5rem;
      }

      .testimonial-card {
        padding: 1.5rem;
      }

      .testimonial-quote {
        font-size: 1rem;
        padding-left: 1.5rem;
      }
    }
  `]
})
export class LandingTestimonialsComponent {
  testimonials = [
    {
      quote: "Estábamos buscando un carbón que nos proporcionara un tiempo de quema largo sin llamaradas ni chispas. Manngo cumple y más. Quema más caliente y más uniforme que cualquier otro que haya usado. ¡El mejor carbón de todos!",
      author: "Alan Frati",
      title: "Director de Operaciones de Red Heat Tavern"
    },
    {
      quote: "Manngo es un carbón superior. Su largo tiempo de quema y temperatura superior al promedio son algunas de las razones por las que lo amamos. Como chef, aprecio la ausencia de ceniza que sale del carbón, lo que lleva a sabores realmente limpios.",
      author: "Steve Cain",
      title: "Chef Ejecutivo en El Gaucho Portland"
    },
    {
      quote: "Quema limpio y caliente. Súper duradero y excelente para ganar campeonatos de BBQ. Puedes cargar tu parrilla cerámica y este carbón quemará hasta cuatro horas.",
      author: "Harry Soo",
      title: "Gran Campeón Pitmaster de Slap Yo Daddy BBQ"
    },
    {
      quote: "Es uno de los mejores carbones en trozo para cualquier parrilla cerámica o incluso una parrilla de carbón tipo Weber Kettle. Amo este carbón y lo recomiendo altamente.",
      author: "Dave Anderson",
      title: "Fundador de Famous Dave's"
    }
  ];
}
