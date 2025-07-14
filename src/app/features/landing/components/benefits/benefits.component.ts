import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-benefits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './benefits.component.html',
  styleUrls: ['./benefits.component.scss']
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
