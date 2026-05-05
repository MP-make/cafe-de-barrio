import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../../services/producto.service';
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

  constructor(
    private productoService: ProductoService,
    private cartService: CartService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadProductos();
  }

  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data: Categoria[]) => {
        console.log('Categorías cargadas:', data);
        this.categorias = data;
      },
      error: (err: any) => console.error('Error cargando categorías:', err)
    });
  }

  loadProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data: Producto[]) => {
        // 👇 ESTA LÍNEA ES VITAL PARA SABER QUÉ PASA 👇
        console.log('Productos recibidos del backend:', data); 
        this.productos = data;
      },
      error: (err: any) => console.error('Error cargando productos:', err)
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