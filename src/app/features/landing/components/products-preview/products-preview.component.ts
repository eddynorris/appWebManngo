import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-landing-products-preview',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <section id="productos" class="products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">ECHA UN VISTAZO A</h2>
          <h3 class="section-subtitle">TODA LA LÍNEA AQUÍ</h3>
          <p class="section-description">
            Obtenemos nuestras materias primas de las maderas duras más densas del planeta
            y nuestro proceso de producción involucra métodos artesanales combinados con innovación moderna.
          </p>
        </div>

        <div class="products-grid">
          <div class="product-card" *ngFor="let product of products">
            <div class="product-image">
              @if (product.imageSrc) {
                <img
                  [ngSrc]="product.imageSrc"
                  [alt]="product.name"
                  [width]="product.imageWidth"
                  [height]="product.imageHeight"
                  priority="true"
                  class="product-img"
                />
              } @else {
                <div class="product-placeholder" [style.background]="product.color">
                  <span class="product-icon">{{ product.icon }}</span>
                </div>
              }
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-description">{{ product.description }}</p>
              <a href="#" class="product-link">VER DETALLES</a>
            </div>
          </div>
        </div>

        <div class="section-footer">
          <a href="#" class="btn-view-all">VER TODOS LOS PRODUCTOS</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .products-section {
      padding: 6rem 0;
      background: #111;
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
      font-size: 2.5rem;
      font-weight: 900;
      color: #ff4444;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }

    .section-subtitle {
      font-size: 3rem;
      font-weight: 900;
      color: #fff;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
    }

    .section-description {
      font-size: 1.1rem;
      color: #ccc;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 4rem;
    }

    .product-card {
      background: #222;
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 40px rgba(255, 68, 68, 0.2);
    }

    .product-image {
      height: 200px;
      overflow: hidden;
      position: relative;
    }

    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-img {
      transform: scale(1.05);
    }

    .product-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ff4444, #ff6666);
    }

    .product-icon {
      font-size: 3rem;
      color: #fff;
    }

    .product-info {
      padding: 1.5rem;
    }

    .product-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }

    .product-description {
      color: #ccc;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .product-link {
      color: #ff4444;
      text-decoration: none;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.9rem;
      letter-spacing: 1px;
      transition: color 0.3s ease;
    }

    .product-link:hover {
      color: #ff6666;
    }

    .section-footer {
      text-align: center;
    }

    .btn-view-all {
      display: inline-block;
      padding: 1rem 2rem;
      background: #ff4444;
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 6px;
      transition: all 0.3s ease;
      letter-spacing: 1px;
    }

    .btn-view-all:hover {
      background: #ff6666;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 68, 68, 0.4);
    }

    @media (max-width: 768px) {
      .products-grid {
        grid-template-columns: 1fr;
      }

      .section-title {
        font-size: 2rem;
      }

      .section-subtitle {
        font-size: 2.2rem;
      }
    }
  `]
})
export class LandingProductsPreviewComponent {
  products = [
    {
      name: 'CARBÓN PREMIUM XL',
      description: 'Carbón de madera dura de primera calidad, quema más tiempo y más caliente que cualquier otro carbón disponible.',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff4444, #ff6666)',
      imageSrc: 'assets/images/carbon-premium-xl.jpg',
      imageWidth: 300,
      imageHeight: 200
    },
    {
      name: 'CARBÓN NATURAL CLASICO',
      description: 'Nuestra mezcla clásica de carbón natural, perfecto para todo tipo de parrillas y ahumados.',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff6666, #ff8888)',
      imageSrc: 'assets/images/carbon-natural-clasico.jpg',
      imageWidth: 300,
      imageHeight: 200
    },
    {
      name: 'BRIQUETAS ARTESANALES',
      description: 'Briquetas hechas a mano con madera dura seleccionada, para una experiencia de cocción superior.',
      icon: '🔥',
      color: 'linear-gradient(135deg, #ff8888, #ffaaaa)',
      imageSrc: 'assets/images/briquetas-artesanales.jpg',
      imageWidth: 300,
      imageHeight: 200
    }
  ];
}
