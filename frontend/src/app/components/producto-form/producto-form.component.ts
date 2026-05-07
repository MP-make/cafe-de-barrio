import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CategoriaService, Categoria } from '../../services/categoria';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.scss'
})
export class ProductoFormComponent implements OnInit {
  // Datos
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  categorias: Categoria[] = [];
  
  // Filtros
  searchTerm: string = '';
  selectedFilterCategoria: string = '';

  // Control de Formulario y Modal
  productoForm!: FormGroup;
  selectedFile: File | null = null;
  isSubmitting: boolean = false;
  editMode: boolean = false;
  currentProductId: number | null = null;
  mostrarModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imagenFile: [null],
      categoriaId: ['', Validators.required]
    });
  }

  loadData() {
    // Cargar Categorías
    this.categoriaService.getCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err: any) => console.error('Error cargando categorías', err)
    });

    // Cargar Productos
    this.productoService.getProductos().subscribe({
      next: (data: any) => {
        this.productos = Array.isArray(data) ? data : (data.content || data.data || []);
        this.filteredProductos = [...this.productos];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error cargando productos', err)
    });
  }

  aplicarFiltros() {
    this.filteredProductos = this.productos.filter(p => {
      const matchName = p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCat = this.selectedFilterCategoria ? (p.categoriaId?.toString() || '') === this.selectedFilterCategoria : true;
      return matchName && matchCat;
    });
  }

  // --- CONTROL DEL MODAL ---
  abrirModalNuevo() {
    this.editMode = false;
    this.currentProductId = null;
    this.productoForm.reset({ precio: 0, stock: 0, categoriaId: '' });
    this.selectedFile = null;
    this.mostrarModal = true; 
  }

  abrirModalEditar(producto: Producto) {
    this.editMode = true;
    this.currentProductId = producto.id!;
    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      categoriaId: producto.categoriaId
    });
    this.selectedFile = null; // Al editar, la imagen es opcional
    this.mostrarModal = true; 
  }

  cerrarModal() {
    this.mostrarModal = false; 
  }

  // --- CRUD (Crear y Editar) ---
  guardarProducto() {
    if (this.productoForm.invalid) {
      alert('Completa los campos obligatorios.');
      return;
    }

    if (!this.editMode && !this.selectedFile) {
      alert('La imagen es obligatoria para nuevos productos.');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('nombre', this.productoForm.get('nombre')?.value);
    formData.append('descripcion', this.productoForm.get('descripcion')?.value || '');
    formData.append('precio', this.productoForm.get('precio')?.value.toString());
    formData.append('stock', this.productoForm.get('stock')?.value.toString());
    formData.append('categoriaId', this.productoForm.get('categoriaId')?.value.toString());
    
    if (this.selectedFile) {
      formData.append('imagenFile', this.selectedFile);
    }

    if (!this.editMode) {
      // POST: Crear nuevo producto
      this.productoService.crearProducto(formData).subscribe({
        next: () => this.finalizarGuardado('¡Café registrado con éxito!'),
        error: (err: any) => this.manejarError(err)
      });
    } else {
      // PUT: Actualizar producto existente
      if (this.currentProductId) {
        this.productoService.actualizarProducto(this.currentProductId, formData).subscribe({
          next: () => this.finalizarGuardado('¡Café actualizado correctamente!'),
          error: (err: any) => this.manejarError(err)
        });
      }
    }
  }

  // --- ELIMINAR ---
  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          alert('🗑️ Producto eliminado del catálogo.');
          this.loadData(); // Refrescar la tabla al instante
        },
        error: (err: any) => {
          console.error('Error al eliminar:', err);
          alert('Hubo un error al eliminar. Revisa la consola.');
        }
      });
    }
  }

  finalizarGuardado(mensaje: string) {
    this.isSubmitting = false;
    alert(mensaje);
    this.loadData();
    this.cerrarModal(); 
  }

  manejarError(err: any) {
    this.isSubmitting = false;
    console.error(err);
    alert('Ocurrió un error. Revisa la consola para más detalles.');
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // --- UTILIDADES ---
  getCategoriaNombre(id: number | undefined): string {
    if (!id) return 'Desconocida';
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'Desconocida';
  }

  // --- MÉTODOS DE CORRECCIÓN DE IMÁGENES ---
  
  getImagenUrl(nombreArchivo?: string): string {
    // 1. Si no hay imagen, devolvemos el logo por defecto
    if (!nombreArchivo || nombreArchivo === '' || nombreArchivo === 'null') {
      return '/logo.webp'; 
    }
    
    // 2. Si ya es una URL web completa, la dejamos pasar
    if (nombreArchivo.startsWith('http') || nombreArchivo.startsWith('data:')) {
      return nombreArchivo;
    }

    // 3. PARCHE: Limpiamos el texto por si es un producto viejo que se guardó con "/uploads/" en tu base de datos
    let nombreLimpio = nombreArchivo;
    if (nombreArchivo.startsWith('/uploads/')) {
      nombreLimpio = nombreArchivo.replace('/uploads/', '');
    }

    // 4. Armamos la URL oficial apuntando a TU bóveda pública de Supabase
    const SUPABASE_STORAGE_URL = 'https://olxldsfzyixhwivznemo.supabase.co/storage/v1/object/public/productos/';
    
    return `${SUPABASE_STORAGE_URL}${nombreLimpio}`;
  }

  // --- EXPORTAR A PDF ---
  exportarPDF() {
    const doc = new jsPDF();
    
    // Título y Fecha
    doc.setFontSize(18);
    doc.text('Inventario de Productos - Café de Barrio', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de reporte: ${new Date().toLocaleDateString()}`, 14, 30);

    // Tabla autogenerada
    autoTable(doc, {
      startY: 35,
      head: [['ID', 'Nombre', 'Categoría', 'Precio', 'Stock']],
      body: this.filteredProductos.map(p => [
        p.id?.toString() || '',
        p.nombre,
        this.getCategoriaNombre(p.categoriaId),
        `$${p.precio}`,
        p.stock?.toString() || '0'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [20, 15, 10] } // Color café oscuro corporativo
    });
    
    // Descarga automática
    doc.save('inventario-cafe.pdf');
  }
}
