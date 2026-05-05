export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
  activo?: boolean;
  categoriaId?: number; // <-- ¡Asegúrate de que tenga el signo de interrogación!
}