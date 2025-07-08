import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer id="contacto" class="footer">
      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">
            <!-- Productos -->
            <div class="footer-section">
              <h3 class="footer-title">PRODUCTOS</h3>
              <ul class="footer-links">
                <li><a href="#" class="footer-link">ENCENDEDORES BOOM!</a></li>
                <li><a href="#" class="footer-link">CARBÓN XL MANNGO</a></li>
                <li><a href="#" class="footer-link">BRIQUETAS MAX</a></li>
                <li><a href="#" class="footer-link">PELLETS JAX</a></li>
                <li><a href="#" class="footer-link">BINCHOTAN ONYX</a></li>
                <li><a href="#" class="footer-link">BLOQUES DE MADERA</a></li>
                <li><a href="#" class="footer-link">BRIQUETAS FLEX</a></li>
              </ul>
            </div>

            <!-- Empresa -->
            <div class="footer-section">
              <h3 class="footer-title">EMPRESA</h3>
              <ul class="footer-links">
                <li><a href="#" class="footer-link">Nuestra Historia</a></li>
                <li><a href="#" class="footer-link">Defensores del Diablo</a></li>
                <li><a href="#" class="footer-link">FAQ</a></li>
                <li><a href="#" class="footer-link">CONTÁCTANOS</a></li>
              </ul>
            </div>

            <!-- Redes Sociales -->
            <div class="footer-section">
              <h3 class="footer-title">SOCIAL</h3>
              <div class="social-links">
                <a href="#" class="social-link" aria-label="Facebook">📘</a>
                <a href="#" class="social-link" aria-label="Instagram">📷</a>
                <a href="#" class="social-link" aria-label="Twitter">🐦</a>
                <a href="#" class="social-link" aria-label="YouTube">📺</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Slogan animado -->
      <div class="footer-slogan">
        <div class="slogan-scroll">
          <span class="slogan-text">Puro como el cielo. Más caliente que el infierno.</span>
          <span class="slogan-text">Puro como el cielo. Más caliente que el infierno.</span>
          <span class="slogan-text">Puro como el cielo. Más caliente que el infierno.</span>
        </div>
      </div>

      <!-- Footer bottom -->
      <div class="footer-bottom">
        <div class="container">
          <div class="footer-bottom-content">
            <div class="footer-info">
              <p>300 E 2nd Ave, Ste 1510 / Reno, NV 89501</p>
              <p>Manngo, LLC ©2025</p>
            </div>
            <div class="footer-legal">
              <a href="#" class="legal-link">Política de Privacidad</a>
              <a href="#" class="legal-link">Términos y Condiciones</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #000;
      color: #fff;
    }

    .footer-main {
      padding: 4rem 0 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 3rem;
    }

    .footer-title {
      font-size: 1.2rem;
      font-weight: 900;
      color: #ff4444;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.8rem;
    }

    .footer-link {
      color: #ccc;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .footer-link:hover {
      color: #ff4444;
    }

    .social-links {
      display: flex;
      gap: 1rem;
    }

    .social-link {
      display: inline-block;
      width: 50px;
      height: 50px;
      background: #222;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background: #ff4444;
      transform: translateY(-3px);
    }

    .footer-slogan {
      background: #ff4444;
      padding: 1rem 0;
      overflow: hidden;
      white-space: nowrap;
    }

    .slogan-scroll {
      display: inline-block;
      animation: scroll 20s linear infinite;
    }

    .slogan-text {
      font-size: 1.5rem;
      font-weight: 900;
      color: #fff;
      margin-right: 3rem;
      text-transform: uppercase;
    }

    @keyframes scroll {
      0% {
        transform: translateX(100%);
      }
      100% {
        transform: translateX(-100%);
      }
    }

    .footer-bottom {
      background: #111;
      padding: 2rem 0;
      border-top: 1px solid #333;
    }

    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-info p {
      margin: 0.2rem 0;
      color: #999;
      font-size: 0.9rem;
    }

    .footer-legal {
      display: flex;
      gap: 2rem;
    }

    .legal-link {
      color: #999;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .legal-link:hover {
      color: #ff4444;
    }

    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .footer-bottom-content {
        flex-direction: column;
        text-align: center;
      }

      .footer-legal {
        justify-content: center;
      }

      .slogan-text {
        font-size: 1.2rem;
      }
    }
  `]
})
export class LandingFooterComponent {}
