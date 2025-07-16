import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-landing-products-preview',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './products-preview.component.html',
  styleUrls: ['./products-preview.component.scss']
})
export class LandingProductsPreviewComponent {
  products = [
    {
      name: 'Carbón Premium 5KG BIOBRASA',
      description: 'Disfruta de asados perfectos con este carbón de madera dura premium',
      price: 'S/ 24.50',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff4444, #ff6666)',
      imageSrc: 'assets/images/biobrasa.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Briquetas de Carbon 4KG',
      description: 'Disfruta de un calor uniforme y sin químicos, 100% natural',
      price: 'S/ 18.50',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff6666, #ff8888)',
      imageSrc: 'assets/images/briquetafogo.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Carbon Premium 3KG Fogo de Chao',
      description: 'Carbón selecto para parrilladas exquisitas y duraderas',
      price: 'S/ 17.00',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff8888, #ffaaaa)',
      imageSrc: 'assets/images/carbonfogo.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Carbón Selecto 5KG',
      description: 'Versátil y de alta calidad para todas tus necesidades de carbón',
      price: 'S/ 16.00',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff4444, #ff6666)',
      imageSrc: 'assets/images/Carbon5.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Carbon Parrillero 10KG',
      description: 'Ideal para tus reuniones, larga duración y máximo sabor',
      price: 'S/ 32.00',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff6666, #ff8888)',
      imageSrc: 'assets/images/Carbon10.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Carbon Selecto 20KG',
      description: 'El tamaño perfecto para tu negocio, rentabilidad asegurada!',
      price: 'S/ 64.00',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff8888, #ffaaaa)',
      imageSrc: 'assets/images/Carbon20.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Carbon Selecto 30KG',
      description: 'Saco de carbón de gran volumen para una producción imparable',
      price: 'S/ 96.00',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff8888, #ffaaaa)',
      imageSrc: 'assets/images/Carbon30.webp',
      imageWidth: 350,
      imageHeight: 300
    }
  ];
}
