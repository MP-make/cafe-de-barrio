import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router'; 
import { CartService } from './services/cart.service';
import { ProductoService } from './services/producto.service';
import { CategoriaService, Categoria } from './services/categoria';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

// 1. IMPORTANTE: Importar el componente del carrito aquí
// Asegúrate de que la ruta sea correcta según tu carpeta
import { Cart } from './components/cart/cart'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. IMPORTANTE: Agregar "Cart" aquí para que el HTML reconozca <app-cart>
  imports: [CommonModule, RouterModule, RouterOutlet, Cart], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Café de Barrio';
  toasts: any[] = [];
  cartItemCount: number = 0;
  isAdminView = false;
  currentYear = new Date().getFullYear();
  isMenuOpen = false;

  showSearch = false;
  searchQuery = '';
  results: any[] = [];
  categorias: Categoria[] = [];
  searchTerm$ = new Subject<string>();

  constructor(
    private cartService: CartService,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    public authService: AuthService,
    public router: Router,
    private notificationService: NotificationService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      this.isAdminView = url.includes('/admin') || url.includes('/login');
    });
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); 
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + item.cantidad, 0);
    });

    this.categoriaService.getCategorias().subscribe(res => this.categorias = res);

    this.searchTerm$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(query => {
      if (query.trim()) {
        this.productoService.buscarProductos(query).subscribe({
          next: (res) => {
            this.results = res;
          },
          error: (err) => {
            this.results = [];
          }
        });
      } else {
        this.results = [];
      }
    });

    // Suscribirse a las notificaciones
    this.notificationService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/catalogo']);
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  irAlCarrito() {
    this.closeMenu();
    // Esto activa el panel lateral que creamos
    this.cartService.toggleCart(true); 
  }

  openSearch() { this.showSearch = true; }
  closeSearch() { this.showSearch = false; this.results = []; this.searchQuery = ''; }
  onSearch(event: any) { this.searchQuery = event.target.value; this.searchTerm$.next(this.searchQuery); }
  filterByCategory(id: number) { this.closeSearch(); this.router.navigate(['/catalogo'], { queryParams: { categoria: id } }); }

  getImagenUrl(nombreArchivo?: string): string {
    if (!nombreArchivo || nombreArchivo === '' || nombreArchivo === 'null') {
      return '/logo.webp'; 
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
    event.target.src = '/logo.webp';
  }

  // Método para cerrar toast manualmente
  closeToast(id: number) {
    this.notificationService.removeToast(id);
  }
}