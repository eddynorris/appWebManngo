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
      description: 'Carbón de madera dura de primera calidad',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff4444, #ff6666)',
      imageSrc: 'assets/images/biobrasa.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Briquetas de Carbon 4KG',
      description: 'Sin aditivos ni químicos, 100% natural',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff6666, #ff8888)',
      imageSrc: 'assets/images/briquetafogo.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Carbon Premium 3KG Fogo de Chao',
      description: 'Carbon selecto de primera calidad',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff8888, #ffaaaa)',
      imageSrc: 'assets/images/carbonfogo.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Carbón Selecto 5KG',
      description: 'Saco de carbón presente en todas las necesidades del consumidor',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff4444, #ff6666)',
      imageSrc: 'assets/images/Carbon5.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Carbon Parrillero 10KG',
      description: 'Bolsa de Carbón de madera dura de primera calidad',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff6666, #ff8888)',
      imageSrc: 'assets/images/Carbon10.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Carbon Selecto 20KG',
      description: 'Ideal para tu negocio!',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff8888, #ffaaaa)',
      imageSrc: 'assets/images/Carbon20.webp',
      imageWidth: 350,
      imageHeight: 300
    },
    {
      name: 'Carbon Selecto 30KG',
      description: 'Necesitas mucho carbón? Este es tu producto',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff8888, #ffaaaa)',
      imageSrc: 'assets/images/Carbon30.webp',
      imageWidth: 350,
      imageHeight: 300
    }
  ];
}
