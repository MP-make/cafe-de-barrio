import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';
import { AdminPedidosComponent } from './components/admin-pedidos/admin-pedidos.component';

export const routes: Routes = [
  { path: '', redirectTo: '/catalogo', pathMatch: 'full' },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'admin', component: ProductoFormComponent },
  { path: 'pedidos', component: AdminPedidosComponent }
];
