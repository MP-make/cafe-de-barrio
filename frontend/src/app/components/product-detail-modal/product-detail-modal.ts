import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Producto } from '../../models/producto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-detail-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail-modal.html',
  styleUrl: './product-detail-modal.scss',
})
export class ProductDetailModal {
  @Input() producto: Producto | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  cantidad: number = 1;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  close() {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  getImagenUrl(): string {
    const nombreArchivo = this.producto?.imagenUrl;
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

  aumentarCantidad() {
    if (this.producto && this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  disminuirCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  onCantidadChange() {
    if (this.producto) {
      if (this.cantidad < 1) {
        this.cantidad = 1;
      } else if (this.cantidad > this.producto.stock) {
        this.cantidad = this.producto.stock;
      }
    }
  }

  agregarAlCarrito() {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showError('Debes iniciar sesión para agregar productos al carrito.');
      return;
    }

    if (!this.producto) return;

    // Crear un objeto producto con la cantidad seleccionada
    const productoConCantidad = { ...this.producto, cantidad: this.cantidad };

    const respuesta = this.cartService.agregar(productoConCantidad);

    if (!respuesta.success) {
      this.notificationService.showError(respuesta.message);
    } else {
      this.notificationService.showSuccess(respuesta.message);
      this.close(); // Cerrar el modal después de agregar
    }
  }
}
