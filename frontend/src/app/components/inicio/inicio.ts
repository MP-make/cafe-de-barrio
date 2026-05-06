import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class InicioComponent implements OnInit {
  categorias: Categoria[] = [];
  productos: Producto[] = [];

  constructor(
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private cartService: CartService,
    private cd: ChangeDetectorRef // El detector mágico para que aparezcan los datos
  ) {}

  ngOnInit() {
    this.categoriaService.getCategorias().subscribe(data => {
      this.categorias = data;
      this.cd.detectChanges(); // Forzamos mostrar categorías
    });

    this.productoService.getProductos().subscribe(data => {
      // Tomamos solo los primeros 4 para mostrar como "Los más solicitados"
      this.productos = data.slice(0, 4);
      this.cd.detectChanges(); // Forzamos mostrar productos
    });
  }

  agregarAlCarrito(producto: Producto) { 
    this.cartService.agregar(producto);
    alert('¡Excelente elección! Producto añadido a tu pedido. ☕');
  }

  // Función para asignar imágenes bonitas según el nombre de la categoría
  getImagenCategoria(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('café') || n.includes('cafe')) return 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=80';
    if (n.includes('postre') || n.includes('dulce')) return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80';
    if (n.includes('equipo') || n.includes('barista')) return 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=400&q=80';
    return 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=400&q=80'; // Por defecto
  }

  // Helper para leer las imágenes del backend correctamente
  getImagenUrl(nombreArchivo?: string): string {
    if (!nombreArchivo) return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80';
    if (nombreArchivo.startsWith('http')) return nombreArchivo;
    return `http://localhost:8080/uploads/${nombreArchivo}`; 
  }
}