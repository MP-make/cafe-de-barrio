import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';
import { CartService } from '../../services/cart.service';
import { CategoriaService, Categoria } from '../../services/categoria';
import { AuthService } from '../../services/auth.service';

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
  
  // Variables de filtrado
  selectedCategoria: number | null = null;
  searchTerm: string = '';
  sortOrder: string = 'default';
  
  isLoading: boolean = true;

  constructor(
    private productoService: ProductoService,
    private cartService: CartService,
    private categoriaService: CategoriaService,
    private cd: ChangeDetectorRef,
    private authService: AuthService
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

  // Cambiar categoría desde las píldoras
  setCategoria(id: number | null) {
    this.selectedCategoria = id;
  }

  get filteredProductos(): Producto[] {
    // ⚠️ Importante: Hacemos una COPIA del array para que el sort() no destruya el orden original
    let result = [...this.productos];

    // 1. Filtrar por Categoría
    if (this.selectedCategoria !== null) {
      result = result.filter(p => p.categoriaId == this.selectedCategoria);
    }

    // 2. Filtrar por Nombre (Buscador)
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p => (p.nombre || '').toLowerCase().includes(term));
    }

    // 3. Ordenamiento Seguro (Protegido contra undefined con || 0)
    if (this.sortOrder === 'precioAsc') {
      result = result.sort((a, b) => (a.precio || 0) - (b.precio || 0));
    } else if (this.sortOrder === 'precioDesc') {
      result = result.sort((a, b) => (b.precio || 0) - (a.precio || 0));
    } else if (this.sortOrder === 'nombreAsc') {
      result = result.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    } else if (this.sortOrder === 'default') {
      // Orden por defecto (por ID)
      result = result.sort((a, b) => (a.id || 0) - (b.id || 0));
    }

    return result;
  }

  // --- MÉTODOS DE IMÁGENES ---
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

  manejarErrorImagen(event: any) {
    event.target.src = '/logo.webp';
  }

  agregarAlCarrito(producto: Producto) {
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      return;
    }
    this.cartService.agregar(producto);
    alert('¡Excelente elección! Añadido al pedido. ☕');
  }
}