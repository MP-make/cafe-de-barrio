import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { PedidoService } from '../../services/pedido.service';
import { Pedido, EstadoPedido } from '../../models/pedido.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  total: number = 0;
  pedido: Pedido = {
    clienteNombre: '',
    celular: '',
    direccion: '',
    estado: EstadoPedido.PENDIENTE,
    detalles: [],
    total: 0
  };

  constructor(
    private cartService: CartService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();
    this.calculateTotal();
    this.prepareDetalles();
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
  }

  prepareDetalles(): void {
    this.pedido.detalles = this.cartItems.map(item => ({
      cantidad: item.cantidad,
      precioUnitario: item.producto.precio,
      subtotal: item.producto.precio * item.cantidad,
      producto: item.producto
    }));
    this.pedido.total = this.total;
  }

  onSubmit(): void {
    if (!this.pedido.clienteNombre || !this.pedido.celular || !this.pedido.direccion) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    if (this.cartItems.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    this.pedidoService.createPedido(this.pedido).subscribe({
      next: (pedidoCreado) => {
        alert('Pedido creado exitosamente!');
        this.cartService.clearCart();
        this.router.navigate(['/catalogo']);
      },
      error: (err) => {
        alert('Error al crear el pedido: ' + err.error.error);
      }
    });
  }
}