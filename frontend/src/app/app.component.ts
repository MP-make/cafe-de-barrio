import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router'; // Asegúrate de tener RouterOutlet
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  // IMPORTANTE: Asegúrate de incluir RouterModule aquí para que funcionen los routerLink
  imports: [CommonModule, RouterModule, RouterOutlet], 
  templateUrl: './app.component.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  title = 'Café de Barrio';
  cartItemCount: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      // Sumamos las cantidades de todos los productos en el carrito
      this.cartItemCount = items.reduce((count, item) => count + item.cantidad, 0);
    });
  }
}