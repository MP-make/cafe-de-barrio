import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductoService } from '../../services/producto.service';
import { CartItem } from '../../models/cart-item.model';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  recomendaciones: Producto[] = [];
  isOpen: boolean = false; // Controla si el panel se ve o no

  constructor(
    private cartService: CartService,
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
    });

    // Escuchamos al servicio para saber si el panel debe abrirse
    this.cartService.cartOpen$.subscribe(open => {
      this.isOpen = open;
    });

    this.productoService.getProductos().subscribe(productos => {
      this.recomendaciones = productos.filter(p => 
        p.categoriaId === 3 || p.nombre?.toLowerCase().includes('kit')
      ).slice(0, 3);
    });
  }

  cerrarPanel() {
    this.cartService.toggleCart(false);
  }

  irAPagar() {
    this.cerrarPanel();
    this.router.navigate(['/checkout']);
  }

  aumentarCantidad(item: CartItem) {
    if (item.producto.id) {
      const respuesta = this.cartService.aumentarCantidad(item.producto.id);
      if(!respuesta.success && respuesta.message){
        alert(respuesta.message);
      }
    }
  }

  disminuirCantidad(item: CartItem) {
    if (item.producto.id) {
      this.cartService.disminuirCantidad(item.producto.id);
    }
  }

  eliminarItem(productoId?: number) {
    if (productoId) {
      this.cartService.eliminar(productoId);
    }
  }

  vaciarCarrito() {
    if (confirm('¿Deseas vaciar el carrito?')) {
      this.cartService.limpiarCarrito();
    }
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  agregarRecomendacion(producto: Producto) {
    const respuesta = this.cartService.agregar(producto);
    if (!respuesta.success && respuesta.message) {
      alert(respuesta.message);
    }
  }

  getImagenUrl(nombreArchivo?: string): string {
    if (!nombreArchivo || nombreArchivo === 'null') return '/logo.webp';
    if (nombreArchivo.startsWith('http')) return nombreArchivo;
    
    let nombreLimpio = nombreArchivo.replace('/uploads/', '');
    const SUPABASE_URL = 'https://olxldsfzyixhwivznemo.supabase.co/storage/v1/object/public/productos/';
    return `${SUPABASE_URL}${nombreLimpio}`;
  }
}