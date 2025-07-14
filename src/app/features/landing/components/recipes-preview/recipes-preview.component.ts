import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-recipes-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipes-preview.component.html',
  styleUrls: ['./recipes-preview.component.scss']
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
