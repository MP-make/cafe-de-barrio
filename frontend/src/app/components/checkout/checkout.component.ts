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
  processingMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    let nombreUsuario = '';
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        nombreUsuario = payload.sub || ''; 
      } catch (e) {
        console.warn('No se pudo decodificar el token para extraer el nombre.');
      }
    }

    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.calcularTotal();
    });

    this.checkoutForm = this.fb.group({
      clienteNombre: [nombreUsuario, [Validators.required, Validators.minLength(3)]],
      celular: ['', [Validators.required, Validators.pattern('^9[0-9]{8}$')]], 
      direccion: ['', [Validators.required, Validators.minLength(5), Validators.pattern('.*[a-zA-ZáéíóúÁÉÍÓÚñÑ].*')]],
      metodoPago: ['tarjeta', Validators.required] 
    });
  }

  calcularTotal(): void {
    this.total = this.cartItems.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }

  confirmarPedido(): void {
    if (this.checkoutForm.invalid || this.cartItems.length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.processingMessage = 'Conectando con pasarela segura...';

    setTimeout(() => {
      this.processingMessage = 'Procesando transacción...';
      
      setTimeout(() => {
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
        
        this.pedidoService.createPedido(pedidoPayload).subscribe({
          next: (res: any) => {
            alert('¡Pago procesado y Pedido confirmado exitosamente!');
            
            // 👇 AQUÍ ESTÁ LA CORRECCIÓN: Usamos limpiarCarrito() en lugar de clearCart()
            this.cartService.limpiarCarrito(); 
            
            this.router.navigate(['/catalogo']); 
          },
          error: (err: any) => {
            console.error('Error al confirmar pedido:', err);
            alert('Error al procesar el pago. Inténtalo de nuevo.');
            this.isSubmitting = false; 
          }
        });
      }, 1500); 
    }, 1000); 
  }

  getImagenUrl(nombreArchivo?: string): string {
    if (!nombreArchivo || nombreArchivo === '' || nombreArchivo === 'null') {
      return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
    }
    if (nombreArchivo.startsWith('http') || nombreArchivo.startsWith('data:')) return nombreArchivo;
    let nombreLimpio = nombreArchivo;
    if (nombreArchivo.startsWith('/uploads/')) nombreLimpio = nombreArchivo.replace('/uploads/', '');
    const SUPABASE_STORAGE_URL = 'https://olxldsfzyixhwivznemo.supabase.co/storage/v1/object/public/productos/';
    return `${SUPABASE_STORAGE_URL}${nombreLimpio}`;
  }

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80';
  }
}