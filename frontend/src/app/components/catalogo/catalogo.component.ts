import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto.model';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { CartService } from '../../services/cart.service';
import { CategoriaService, Categoria } from '../../services/categoria'; // <-- Importar CategoriaService

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],  
  templateUrl: './catalogo.component.html'
})
export class CatalogoComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  selectedCategoria: number | null = null;

  constructor(
    private productoService: ProductoService,
    private cartService: CartService,
    private categoriaService: CategoriaService // <-- Inyectar CategoriaService
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadProductos();
  }

  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Error cargando categorï¿½as:', err)
    });
  }

  loadProductos(): void {
    if (this.selectedCategoria) {
      this.productoService.getProductosByCategoria(this.selectedCategoria).subscribe({
        next: (data) => this.productos = data,
        error: (err) => console.error('Error cargando productos:', err)
      });
    } else {
      this.productoService.getProductos().subscribe({
        next: (data) => this.productos = data,
        error: (err) => console.error('Error cargando productos:', err)
      });
    }
  }

  onCategoriaChange(): void {
    this.loadProductos();
  }

  eliminar(id: number) {
    if(confirm('¿Estás seguro de eliminar este café?')) {
      this.productoService.deleteProducto(id).subscribe({
        next: () => this.productos = this.productos.filter(p => p.id !== id),
        error: (err) => console.error('No se pudo eliminar', err)
      });
    }
  }

  // --- Mï¿½TODO NUEVO ---
  agregarAlCarrito(producto: Producto) {
    this.cartService.agregar(producto);
    alert('Producto añadido al carrito!');
  }
}
