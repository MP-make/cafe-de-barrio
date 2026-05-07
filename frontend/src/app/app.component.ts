import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router'; 
import { CartService } from './services/cart.service';
import { ProductoService } from './services/producto.service';
import { CategoriaService, Categoria } from './services/categoria';
import { AuthService } from './services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Café de Barrio';
  cartItemCount: number = 0;
  isAdminView = false; // Controla si mostramos la Tienda o el Panel Admin

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
    public authService: AuthService, // <--- Inyectamos el AuthService
    public router: Router
  ) {
    // Escuchamos la URL para apagar el header del cliente si entramos al admin
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.isAdminView = url.includes('/admin') || url.includes('/login');
    });
  }

  ngOnInit(): void {
    // Carrito
    this.cartService.getCart().subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + item.cantidad, 0);
    });

    // Cargar sugerencias
    this.categoriaService.getCategorias().subscribe(res => this.categorias = res);

    // Lógica del buscador en tiempo real
    this.searchTerm$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(query => {
      if (query.trim()) {
        this.productoService.buscarProductos(query).subscribe({
          next: (res) => {
            console.log('Resultados del backend:', res);
            this.results = res;
          },
          error: (err) => {
            console.error('¡Ups! El backend rechazó la búsqueda:', err);
            this.results = [];
          }
        });
      } else {
        this.results = [];
      }
    });
  }

  // Métodos del administrador
  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/catalogo']);
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
    return `https://cafe-de-barrio-backend.onrender.com/uploads/${nombreArchivo}`; 
  }

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
  }
}