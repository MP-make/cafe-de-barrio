import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
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
    });

    this.productoService.getProductos().subscribe(data => {
      this.productos = data.slice(0, 4);
      this.cd.detectChanges();
    });
  }

  ngAfterViewInit() {
    // Forzamos el play de todos los videos al cargar
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.muted = true; // El silencio es obligatorio para el autoplay
      video.play().catch(error => console.log("Video bloqueado:", error));
      video.playbackRate = 0.8; // Efecto slow motion
    });

    // Observer para secciones con video de fondo
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const v = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) { v.play(); } else { v.pause(); }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.lazy-video').forEach(v => observer.observe(v));
  }

  agregarAlCarrito(producto: Producto) { 
    this.cartService.agregar(producto);
    alert('Añadido a tu selección. ☕');
  }

    getImagenUrl(nombreArchivo?: string): string {
        if (!nombreArchivo) return 'logo.webp';
        return `http://localhost:8080/uploads/${nombreArchivo}`; 
      }
}