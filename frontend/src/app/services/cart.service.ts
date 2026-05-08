import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  
  // Variables para controlar si el panel lateral está abierto o cerrado
  private cartOpenSubject = new BehaviorSubject<boolean>(false);
  cartOpen$ = this.cartOpenSubject.asObservable();

  constructor() {
    this.cargarCarrito();
  }

  getCart() {
    return this.cartSubject.asObservable();
  }

  // Método para abrir/cerrar el carrito lateral
  toggleCart(isOpen: boolean) {
    this.cartOpenSubject.next(isOpen);
  }

  agregar(producto: Producto): { success: boolean, message: string } {
    const itemExistente = this.items.find(item => item.producto.id === producto.id);
    const stockDisponible = producto.stock ? Number(producto.stock) : 0;

    if (itemExistente) {
      if (itemExistente.cantidad >= stockDisponible) {
        return { success: false, message: `Solo hay ${stockDisponible} unidades disponibles de "${producto.nombre}".` };
      }
      itemExistente.cantidad++;
      this.sincronizar();
      return { success: true, message: 'Se aumentó la cantidad en tu carrito. ☕' };
    } else {
      if (stockDisponible > 0) {
        this.items.push({ producto: producto, cantidad: 1 });
        this.sincronizar();
        return { success: true, message: '¡Excelente elección! Añadido al pedido. ☕' };
      } else {
        return { success: false, message: `El producto "${producto.nombre}" está agotado.` };
      }
    }
  }

  eliminar(productoId: number) {
    this.items = this.items.filter(item => item.producto.id !== productoId);
    this.sincronizar();
  }

  limpiarCarrito() {
    this.items = [];
    this.sincronizar();
  }

  aumentarCantidad(productoId: number): { success: boolean, message?: string } {
    const item = this.items.find(i => i.producto.id === productoId);
    if (item) {
      const stock = item.producto.stock || 0;
      if (item.cantidad < stock) {
        item.cantidad++;
        this.sincronizar();
        return { success: true };
      } else {
        return { success: false, message: `Límite de stock alcanzado (${stock} unid.).` };
      }
    }
    return { success: false, message: "Item no encontrado" };
  }

  disminuirCantidad(productoId: number) {
    const item = this.items.find(i => i.producto.id === productoId);
    if (item && item.cantidad > 1) {
      item.cantidad--;
      this.sincronizar();
    }
  }

  getTotal(): number {
    return this.items.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
  }

  private sincronizar() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
    this.cartSubject.next(this.items);
  }

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
}