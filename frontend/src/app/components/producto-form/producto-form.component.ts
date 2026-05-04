import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService, Categoria } from '../../services/categoria';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.scss'
})
export class ProductoFormComponent implements OnInit {
  productoForm!: FormGroup;
  categorias: Categoria[] = [];

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imagenUrl: [''],
      categoria: this.fb.group({
        id: ['', Validators.required]
      })
    });

    // Cargar categorías para el dropdown
    this.categoriaService.getCategorias().subscribe(data => this.categorias = data);
  }

  guardarProducto() {
    if (this.productoForm.valid) {
      this.productoService.addProducto(this.productoForm.value).subscribe({
        next: () => {
          alert('¡Café registrado con éxito! ☕');
          this.productoForm.reset({ precio: 0, stock: 0 });
          window.location.reload(); // Recarga para ver el nuevo producto en el catálogo
        },
        error: (err) => alert('Error al guardar el producto')
      });
    }
  }
}
