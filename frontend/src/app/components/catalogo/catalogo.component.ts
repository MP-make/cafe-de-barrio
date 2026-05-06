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
    private cd: ChangeDetectorRef // <--- INYECTAMOS EL DETECTOR DE CAMBIOS
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // 1. Cargar productos
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        console.log('Productos recibidos del backend:', productos);
        this.productos = productos;
        this.isLoading = false; // Ocultamos el spinner
        
        // FORZAMOS LA ACTUALIZACIÓN DE LA PANTALLA
        this.cd.detectChanges(); 
      },
      error: (err: any) => {
        console.error('Error cargando productos:', err);
        this.isLoading = false; 
        this.cd.detectChanges(); // Actualizamos incluso si hay error
      }
    });

    // 2. Cargar categorías de forma independiente
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        console.log('Categorías cargadas:', categorias);
        this.categorias = categorias;
        this.cd.detectChanges(); // Forzamos actualización al recibir categorías
      },
      error: (err: any) => {
        console.error('Error cargando categorías:', err);
      }
    });
  }

  onCategoriaChange(): void {
    // El filtrado lo hace el getter
  }

  get filteredProductos(): Producto[] {
    if (this.selectedCategoria) {
      // Usamos == en lugar de === por si el HTML envía el ID como string ('1' == 1)
      return this.productos.filter(p => p.categoriaId == this.selectedCategoria);
    }
    return this.productos;
  }

  agregarAlCarrito(producto: Producto) {
    this.cartService.agregar(producto);
    alert('¡Producto añadido al carrito! ☕');
  }
}