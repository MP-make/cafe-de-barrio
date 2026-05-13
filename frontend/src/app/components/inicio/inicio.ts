import { Component, OnInit, ChangeDetectorRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CategoriaService, Categoria } from '../../services/categoria';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ProductDetailModal } from '../product-detail-modal/product-detail-modal';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductDetailModal],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class InicioComponent implements OnInit, AfterViewInit {
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  selectedProducto: Producto | null = null;
  isModalOpen: boolean = false;

  constructor(
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private cartService: CartService,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private notificationService: NotificationService
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
    
    const mainContent = document.querySelector('.hero-premium .hero-content') as HTMLElement;
    if (mainContent) {
      mainContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      mainContent.style.opacity = `${Math.max(1 - (scrollY / 500), 0)}`;
    }

    const miniHero = document.querySelector('.mini-hero') as HTMLElement;
    const miniContent = document.querySelector('.mini-hero .container') as HTMLElement;
    
    if (miniHero && miniContent) {
      const rect = miniHero.getBoundingClientRect();
      const viewHeight = window.innerHeight;

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
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showError('Debes iniciar sesión para agregar productos al carrito.');
      return;
    }
    
    // Guardamos la respuesta del servicio
    const respuesta = this.cartService.agregar(producto);
    
    // Mostramos la notificación correspondiente
    if (!respuesta.success) {
      this.notificationService.showError(respuesta.message);
    } else {
      this.notificationService.showSuccess(respuesta.message);
    }
  }

  getImagenUrl(nombreArchivo?: string): string {
    if (!nombreArchivo || nombreArchivo === '' || nombreArchivo === 'null') {
      return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
    }
    
    if (nombreArchivo.startsWith('http') || nombreArchivo.startsWith('data:')) {
      return nombreArchivo;
    }

    let nombreLimpio = nombreArchivo;
    if (nombreArchivo.startsWith('/uploads/')) {
      nombreLimpio = nombreArchivo.replace('/uploads/', '');
    }

    const SUPABASE_STORAGE_URL = 'https://olxldsfzyixhwivznemo.supabase.co/storage/v1/object/public/productos/';
    
    return `${SUPABASE_STORAGE_URL}${nombreLimpio}`;
  }

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
  }

  openModal(producto: Producto) {
    this.selectedProducto = producto;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedProducto = null;
  }
}