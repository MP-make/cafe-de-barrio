import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router'; 
import { CartService } from './services/cart.service';
import { ProductoService } from './services/producto.service';
import { CategoriaService, Categoria } from './services/categoria';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss' // <--- ¡AQUÍ ESTABA EL DETALLE!
})
export class AppComponent implements OnInit {
  title = 'Café de Barrio';
  cartItemCount: number = 0;

  // Variables del Buscador
  showSearch = false;
  searchQuery = '';
  results: any[] = [];
  categorias: Categoria[] = [];
  searchTerm$ = new Subject<string>();

  constructor(
    private cartService: CartService,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    public router: Router // <--- ¡SOLO CAMBIA 'private' POR 'public' AQUÍ!
  ) {}

  ngOnInit(): void {
    // Carrito
    this.cartService.getCart().subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + item.cantidad, 0);
    });

    // Cargar sugerencias
    this.categoriaService.getCategorias().subscribe(res => this.categorias = res);

    // Lógica del buscador en tiempo real
    // Lógica del buscador en tiempo real
    this.searchTerm$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(query => {
      if (query.trim()) {
        // Le agregamos un "chismoso" para ver qué responde el backend
        this.productoService.buscarProductos(query).subscribe({
          next: (res) => {
            console.log('Resultados del backend:', res);
            this.results = res;
          },
          error: (err) => {
            console.error('¡Ups! El backend rechazó la búsqueda:', err);
            this.results = []; // Mantenemos el array vacío para no romper la vista
          }
        });
      } else {
        this.results = [];
      }
    });
  }

  // Métodos del modal
  openSearch() { this.showSearch = true; }
  closeSearch() { this.showSearch = false; this.results = []; this.searchQuery = ''; }
  onSearch(event: any) { this.searchQuery = event.target.value; this.searchTerm$.next(this.searchQuery); }
  filterByCategory(id: number) { this.closeSearch(); this.router.navigate(['/catalogo'], { queryParams: { categoria: id } }); }

  // Métodos para la imagen miniatura del buscador
  getImagenUrl(nombreArchivo?: string): string {
    if (!nombreArchivo) return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
    if (nombreArchivo.startsWith('http')) return nombreArchivo;
    return `http://localhost:8080/uploads/${nombreArchivo}`; 
  }

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
  }
}