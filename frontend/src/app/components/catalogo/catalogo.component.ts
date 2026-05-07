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
  
  // --- NUEVAS FUNCIONES PARA LAS IMÁGENES (CONECTADO A SUPABASE) ---

  getImagenUrl(nombreArchivo?: string): string {
    // 1. Si no hay imagen, ponemos una de respaldo
    if (!nombreArchivo || nombreArchivo === '' || nombreArchivo === 'null') {
      return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
    }
    
    // 2. Si ya es un link completo, lo dejamos pasar
    if (nombreArchivo.startsWith('http') || nombreArchivo.startsWith('data:')) {
      return nombreArchivo;
    }

    // 3. PARCHE: Si el nombre viene con el "/uploads/" viejo de la base de datos, se lo quitamos
    let nombreLimpio = nombreArchivo;
    if (nombreArchivo.startsWith('/uploads/')) {
      nombreLimpio = nombreArchivo.replace('/uploads/', '');
    }

    // 4. URL oficial apuntando a tu bóveda pública de Supabase
    const SUPABASE_STORAGE_URL = 'https://olxldsfzyixhwivznemo.supabase.co/storage/v1/object/public/productos/';
    
    return `${SUPABASE_STORAGE_URL}${nombreLimpio}`;
  }

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
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
