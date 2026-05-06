import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PedidoService } from '../../services/pedido.service';
import { Pedido, EstadoPedido } from '../../models/pedido.model';
import { CartItem } from '../../models/cart-item.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  total: number = 0;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Cargar el carrito
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.calcularTotal();
    });

    // 2. Inicializar el formulario
    this.checkoutForm = this.fb.group({
      clienteNombre: ['', [Validators.required, Validators.minLength(3)]],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]], // Formato peruano de 9 dígitos
      direccion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  calcularTotal(): void {
    this.total = this.cartItems.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }

  confirmarPedido(): void {
    if (this.checkoutForm.invalid || this.cartItems.length === 0) {
      alert('Por favor completa tus datos o añade productos al carrito.');
      return;
    }

    this.isSubmitting = true;

    // 3. Armar el JSON exactamente como lo pide tu PedidoService.java
    const pedidoPayload: Pedido = {
      clienteNombre: this.checkoutForm.value.clienteNombre,
      celular: this.checkoutForm.value.celular,
      direccion: this.checkoutForm.value.direccion,
      estado: EstadoPedido.PENDIENTE,
      total: this.total,
      detalles: this.cartItems.map(item => ({
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
        subtotal: item.producto.precio * item.cantidad,
        producto: { id: item.producto.id } as any
      }))
    };
    
    // 4. Enviar al backend
    this.pedidoService.createPedido(pedidoPayload).subscribe({
      next: (res: any) => {
        alert('Pedido confirmado exitosamente!');
        this.cartService.clearCart(); // Limpiar el carrito local
        this.router.navigate(['/catalogo']); // Regresar al catálogo
      },
      error: (err: any) => {
        console.error('Error al confirmar pedido:', err);
        alert('Error al confirmar el pedido. Inténtalo de nuevo.');
        this.isSubmitting = false; // Buena práctica: liberar el botón si hay error
      }
    });
  }

  // --- NUEVAS FUNCIONES PARA LAS IMÁGENES ---

  // 1. Construye la ruta completa hacia el backend (AGREGADO EL SIGNO ?)
  getImagenUrl(nombreArchivo?: string): string {
    if (!nombreArchivo) {
      return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
    }
    if (nombreArchivo.startsWith('http')) {
      return nombreArchivo; // Por si ya es un link completo
    }
    // Asegúrate de que tu backend sirva imágenes en esta ruta
    return `http://localhost:8080\${nombreArchivo}`; 
  }

  // 2. Si la imagen del backend no carga (Error 404), ponemos el café de respaldo
  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
  }
}
