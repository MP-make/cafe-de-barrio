import { Component, OnInit, ChangeDetectorRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CategoriaService, Categoria } from '../../services/categoria';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class InicioComponent implements OnInit, AfterViewInit {
  categorias: Categoria[] = [];
  productos: Producto[] = [];

  constructor(
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private cartService: CartService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.categoriaService.getCategorias().subscribe(data => {
      this.categorias = data;
      this.cd.detectChanges();
      this.iniciarAnimacionesReveal();
    });

    this.productoService.getProductos().subscribe(data => {
      this.productos = data.slice(0, 4);
      this.cd.detectChanges();
      this.iniciarAnimacionesReveal();
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const scrollY = window.scrollY;
    
    // PARALLAX HERO 1 (Desvanecimiento + Movimiento)
    const mainContent = document.querySelector('.hero-premium .hero-content') as HTMLElement;
    if (mainContent) {
      mainContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      mainContent.style.opacity = `${Math.max(1 - (scrollY / 500), 0)}`;
    }

    // PARALLAX MINI-HERO (Sección 4) - CORREGIDO
    const miniHero = document.querySelector('.mini-hero') as HTMLElement;
    const miniContent = document.querySelector('.mini-hero .container') as HTMLElement;
    
    if (miniHero && miniContent) {
      const rect = miniHero.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      // Solo se mueve si la sección es visible en el viewport
      if (rect.top < viewHeight && rect.bottom > 0) {
        const relativeScroll = viewHeight - rect.top;
        miniContent.style.transform = `translateY(${relativeScroll * 0.1}px)`;
      }
    }
  }

  ngAfterViewInit() {
    if (typeof document === 'undefined') return;

    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.muted = true;
      video.play().catch(() => {});
      video.playbackRate = 0.8;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const v = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) { v.play(); } else { v.pause(); }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.lazy-video').forEach(v => observer.observe(v));
    this.iniciarAnimacionesReveal();
  }

  iniciarAnimacionesReveal() {
    if (typeof document === 'undefined') return;
    
    setTimeout(() => {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { 
            entry.target.classList.add('reveal-visible'); 
          }
        });
      }, { threshold: 0.15 });

      document.querySelectorAll('.reveal-item').forEach(el => revealObserver.observe(el));
    }, 200);
  }

  agregarAlCarrito(producto: Producto) { 
    this.cartService.agregar(producto);
    alert('Añadido a tu selección. ☕');
  }

  getImagenUrl(nombreArchivo?: string): string {
    if (!nombreArchivo) return 'logo.webp';
    return `https://cafe-de-barrio-backend.onrender.com/uploads/${nombreArchivo}`; 
  }
}