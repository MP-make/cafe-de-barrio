import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';
import { AdminPedidosComponent } from './components/admin-pedidos/admin-pedidos.component';
import { LoginComponent } from './components/login/login.component';
import { InicioComponent } from './components/inicio/inicio'; // Importación corregida
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  
  // Vistas de Cliente
  { path: 'inicio', component: InicioComponent, title: 'Inicio | Café de Barrio' },
  { path: 'catalogo', component: CatalogoComponent, title: 'Catálogo | Café de Barrio' },
  { path: 'checkout', component: CheckoutComponent, title: 'Finalizar Pedido | Café de Barrio' },
  
  // Vistas de Administración
  { path: 'admin/productos', component: ProductoFormComponent, canActivate: [AuthGuard], title: 'Panel de Inventario | Café de Barrio' },
  { path: 'admin/productos/:id', component: ProductoFormComponent, canActivate: [AuthGuard], title: 'Editar Producto | Café de Barrio' },
  { path: 'admin/pedidos', component: AdminPedidosComponent, canActivate: [AuthGuard], title: 'Gestión de Pedidos | Café de Barrio' },
  
  // Comodín para rutas no encontradas
  { path: '**', redirectTo: '/inicio' }
];