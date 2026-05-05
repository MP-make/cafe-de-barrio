import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  // Usamos BehaviorSubject para que cualquier componente (como la navbar) se entere al instante si el carrito cambia
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    this.cargarCarrito();
  }

  // Obtener los datos reactivos
  getCart() {
    return this.cartSubject.asObservable();
  }

  // Agregar al carrito
  agregar(producto: Producto) {
    const itemExistente = this.items.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      itemExistente.cantidad++; // Si ya existe, sumamos 1
    } else {
      this.items.push({ producto, cantidad: 1 }); // Si no, lo agregamos nuevo
    }
    
    this.sincronizar();
  }

  // Eliminar del carrito
  eliminar(productoId: number) {
    this.items = this.items.filter(item => item.producto.id !== productoId);
    this.sincronizar();
  }

  // Vaciar todo el carrito
  limpiarCarrito() {
    this.items = [];
    this.sincronizar();
  }

  // Calcular el total a pagar
  getTotal(): number {
    return this.items.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
  }

  // Guardar en el navegador y notificar a la app
  private sincronizar() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
    this.cartSubject.next(this.items);
  }

  // Recuperar del navegador al entrar a la p�gina
  private cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      this.items = JSON.parse(carritoGuardado);
      this.cartSubject.next(this.items);
    }
  }

  getItems(): CartItem[] {
    return this.items;
  }

  clearCart(): void {
    this.limpiarCarrito();
  }
}
