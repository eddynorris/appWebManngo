import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
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
