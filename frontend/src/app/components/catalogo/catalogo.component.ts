import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';
import { CartService } from '../../services/cart.service';
import { CategoriaService, Categoria } from '../../services/categoria';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],  
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.scss'
})
export class CatalogoComponent implements OnInit {
  
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  selectedCategoria: number | null = null;
  isLoading: boolean = true;

  constructor(
    private productoService: ProductoService,
    private cartService: CartService,
    private categoriaService: CategoriaService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.isLoading = false; 
        this.cd.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error cargando productos:', err);
        this.isLoading = false; 
        this.cd.detectChanges();
      }
    });

    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.cd.detectChanges();
      },
      error: (err: any) => console.error('Error cargando categorías:', err)
    });
  }

  // --- MÉTODOS DE CORRECCIÓN DE IMÁGENES ---
  
  getImagenUrl(nombreArchivo?: string): string {
    if (!nombreArchivo || nombreArchivo === '' || nombreArchivo === 'null') {
      return '/logo.webp'; // Imagen por defecto
    }
    if (nombreArchivo.startsWith('http')) {
      return nombreArchivo;
    }
    // Aseguramos la ruta completa al backend con la carpeta uploads
    return `https://cafe-de-barrio.onrender.com\${nombreArchivo}`; 
  }

  manejarErrorImagen(event: any) {
    // Si la imagen no existe en el servidor, ponemos el logo
    event.target.src = '/logo.webp';
  }

  // ------------------------------------------

  get filteredProductos(): Producto[] {
    if (this.selectedCategoria) {
      return this.productos.filter(p => p.categoriaId == this.selectedCategoria);
    }
    return this.productos;
  }

  agregarAlCarrito(producto: Producto) {
    this.cartService.agregar(producto);
    alert('¡Excelente elección! Añadido al pedido. ☕');
  }
}
