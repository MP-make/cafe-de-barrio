import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService, Categoria } from '../../services/categoria';
import { ProductoService, Producto } from '../../services/producto.service';

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
  selectedFile: File | null = null;
  
  // NUEVO: Bandera para saber si estamos subiendo datos al backend
  isSubmitting: boolean = false; 

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
      imagenFile: [null],
      categoriaId: ['', Validators.required]
    });

    // Cargar categorías para el dropdown
    this.categoriaService.getCategorias().subscribe({
      next: (data: Categoria[]) => this.categorias = data,
      error: (err: any) => console.error('Error cargando categorías:', err)
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  guardarProducto() {
    if (this.productoForm.valid && this.selectedFile) {
      
      this.isSubmitting = true; // <-- Bloqueamos el botón y mostramos carga

      const formData = new FormData();
      formData.append('nombre', this.productoForm.get('nombre')?.value);
      formData.append('descripcion', this.productoForm.get('descripcion')?.value);
      formData.append('precio', this.productoForm.get('precio')?.value.toString());
      formData.append('stock', this.productoForm.get('stock')?.value.toString());
      formData.append('categoriaId', this.productoForm.get('categoriaId')?.value.toString());
      formData.append('imagenFile', this.selectedFile);

      this.productoService.crearProducto(formData).subscribe({
        next: () => {
          this.isSubmitting = false; // <-- Desbloqueamos
          alert('¡Café registrado con éxito! ☕');
          this.productoForm.reset({ precio: 0, stock: 0 });
          this.selectedFile = null;
          
          // Recargamos la vista para que el catálogo traiga el dato fresco
          window.location.reload();
        },
        error: (err: any) => {
          this.isSubmitting = false; // <-- Desbloqueamos si hay error
          console.error(err);
          alert('Error al guardar el producto. Revisa la consola.');
        }
      });
    } else {
      alert('Por favor, complete todos los campos obligatorios, incluyendo la imagen.');
    }
  }
}