import { Component } from '@angular/core';

import { CatalogoComponent } from './components/catalogo/catalogo.component'; // Importación
import { ProductoFormComponent } from './components/producto-form/producto-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CatalogoComponent, ProductoFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'frontend';
}
