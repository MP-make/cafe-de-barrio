import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { PedidoService } from '../../services/pedido.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
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
  isGettingLocation: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private pedidoService: PedidoService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private http: HttpClient,
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
            this.notificationService.showSuccess('¡Pago procesado y Pedido confirmado exitosamente!');
            
            this.cartService.limpiarCarrito(); 
            
            this.router.navigate(['/catalogo']); 
          },
          error: (err: any) => {
            console.error('Error al confirmar pedido:', err);
            if (err.status === 403) {
              this.notificationService.showError('Sesión expirada. Por favor, inicia sesión nuevamente.');
              this.authService.logout();
            } else {
              const errorMessage = err.error?.error || 'Error al procesar el pago. Inténtalo de nuevo.';
              this.notificationService.showError(errorMessage);
            }
            this.isSubmitting = false; 
          }
        });
      }, 1500); 
    }, 1000); 
  }
  getCurrentLocation() {
    if (!navigator.geolocation) {
      this.notificationService.showError('La geolocalización no está soportada en este navegador.');
      return;
    }

    this.isGettingLocation = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Reverse geocoding con Nominatim (gratuito)
        this.http.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`).subscribe(
          (data: any) => {
            const address = data.display_name || `Lat: ${lat}, Lng: ${lon}`;
            this.checkoutForm.get('direccion')?.setValue(address);
            this.isGettingLocation = false;
          },
          (error) => {
            this.notificationService.showError('No se pudo obtener la dirección. Inténtalo de nuevo.');
            this.isGettingLocation = false;
          }
        );
      },
      (error) => {
        let message = 'Error al obtener la ubicación.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Permiso de ubicación denegado. Activa la ubicación en tu navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Ubicación no disponible.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Tiempo de espera agotado para obtener la ubicación.';
        }
        this.notificationService.showError(message);
        this.isGettingLocation = false;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
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