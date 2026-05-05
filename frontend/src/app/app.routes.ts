import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';
import { AdminPedidosComponent } from './components/admin-pedidos/admin-pedidos.component';

export const routes: Routes = [
  { path: '', redirectTo: '/catalogo', pathMatch: 'full' },
  
  // Vistas de Cliente
  { path: 'catalogo', component: CatalogoComponent, title: 'Catálogo | Café de Barrio' },
  { path: 'checkout', component: CheckoutComponent, title: 'Finalizar Pedido | Café de Barrio' },
  
  // Vistas de Administración
  { path: 'admin', component: ProductoFormComponent, title: 'Panel de Inventario | Café de Barrio' },
  { path: 'pedidos', component: AdminPedidosComponent, title: 'Gestión de Pedidos | Café de Barrio' },
  
  // Comodín para rutas no encontradas
  { path: '**', redirectTo: '/catalogo' }
];