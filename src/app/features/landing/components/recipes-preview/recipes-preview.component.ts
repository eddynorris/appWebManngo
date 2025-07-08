import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-recipes-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="recetas" class="recipes-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">¡EL GRAN BBQ VALE LA PENA LUCHAR POR ÉL!</h2>
          <p class="section-subtitle">
            Conoce a los "Guerreros de la Llama", las fuerzas más poderosas del BBQ jamás reunidas.
            Aprende técnicas, recetas y secretos de los maestros.
          </p>
        </div>

        <div class="recipes-grid">
          <div class="recipe-card" *ngFor="let recipe of recipes">
            <div class="recipe-image">
              <div class="recipe-placeholder" [style.background]="recipe.gradient">
                <span class="recipe-icon">{{ recipe.icon }}</span>
              </div>
            </div>
            <div class="recipe-content">
              <h3 class="recipe-title">{{ recipe.title }}</h3>
              <p class="recipe-description">{{ recipe.description }}</p>
              <div class="recipe-meta">
                <span class="recipe-time">{{ recipe.time }}</span>
                <span class="recipe-difficulty">{{ recipe.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="video-section">
          <h3 class="video-title">Episodios de los Guerreros de la Llama</h3>
          <div class="video-grid">
            <div class="video-card" *ngFor="let video of videos">
              <div class="video-thumbnail">
                <div class="video-placeholder">
                  <span class="play-button">▶</span>
                </div>
              </div>
              <div class="video-info">
                <h4 class="video-name">{{ video.title }}</h4>
                <p class="video-desc">{{ video.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .recipes-section {
      padding: 6rem 0;
      background: #222;
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
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 900;
      color: #ff4444;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
    }

    .section-subtitle {
      font-size: 1.1rem;
      color: #ccc;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 5rem;
    }

    .recipe-card {
      background: #333;
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .recipe-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(255, 68, 68, 0.2);
    }

    .recipe-image {
      height: 180px;
      overflow: hidden;
    }

    .recipe-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .recipe-icon {
      font-size: 3rem;
      color: #fff;
    }

    .recipe-content {
      padding: 1.5rem;
    }

    .recipe-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }

    .recipe-description {
      color: #ccc;
      margin-bottom: 1rem;
      line-height: 1.5;
      font-size: 0.9rem;
    }

    .recipe-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: #ff4444;
      font-weight: 600;
    }

    .video-section {
      border-top: 2px solid #444;
      padding-top: 3rem;
    }

    .video-title {
      font-size: 2rem;
      font-weight: 900;
      color: #ff4444;
      text-align: center;
      margin-bottom: 2rem;
      text-transform: uppercase;
    }

    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .video-card {
      background: #111;
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease;
      cursor: pointer;
    }

    .video-card:hover {
      transform: scale(1.02);
    }

    .video-thumbnail {
      height: 200px;
      position: relative;
    }

    .video-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #333, #555);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .play-button {
      font-size: 3rem;
      color: #ff4444;
      opacity: 0.8;
      transition: opacity 0.3s ease;
    }

    .video-card:hover .play-button {
      opacity: 1;
    }

    .video-info {
      padding: 1.5rem;
    }

    .video-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    .video-desc {
      color: #ccc;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .recipes-grid {
        grid-template-columns: 1fr;
      }

      .video-grid {
        grid-template-columns: 1fr;
      }

      .section-title {
        font-size: 2rem;
      }
    }
  `]
})
export class LandingRecipesPreviewComponent {
  recipes = [
    {
      title: 'Costillas BBQ Perfectas',
      description: 'Aprende la técnica secreta para costillas tiernas y jugosas con el sabor ahumado perfecto.',
      time: '4-6 horas',
      difficulty: 'Intermedio',
      icon: '🍖',
      gradient: 'linear-gradient(135deg, #ff4444, #ff6666)'
    },
    {
      title: 'Brisket de Competencia',
      description: 'La receta ganadora de campeonatos para el brisket más tierno y sabroso.',
      time: '12-14 horas',
      difficulty: 'Avanzado',
      icon: '🥩',
      gradient: 'linear-gradient(135deg, #ff6666, #ff8888)'
    },
    {
      title: 'Pollo Ahumado Jugoso',
      description: 'Técnica infalible para pollo ahumado con piel crujiente y carne jugosa.',
      time: '2-3 horas',
      difficulty: 'Principiante',
      icon: '🍗',
      gradient: 'linear-gradient(135deg, #ff8888, #ffaaaa)'
    }
  ];

  videos = [
    {
      title: 'Episodio 1: La Diosa de las Briquetas',
      description: 'MAX comparte conocimiento y castiga a las víctimas del carbón barato. Aprende por qué el carbón natural marca la diferencia.'
    },
    {
      title: 'Episodio 2: Usa tu Cabeza',
      description: 'Los Guerreros de la Llama nos recuerdan elegir combustible natural que queme largo y puro. Sin aditivos. Sin chispas. Sin piedad.'
    }
  ];
}
