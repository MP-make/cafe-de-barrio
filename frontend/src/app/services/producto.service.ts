import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para tipar la respuesta (basada en el DTO de Spring Boot)
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  activo: boolean;
  categoriaId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  // Cambiaremos esto a las variables de entorno (environment) más adelante
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) { }

  // Obtener productos (con filtro opcional por categoría)
  getProductos(categoriaId?: number): Observable<Producto[]> {
    let params = new HttpParams();
    if (categoriaId) {
      params = params.set('categoriaId', categoriaId.toString());
    }
    return this.http.get<Producto[]>(this.apiUrl, { params });
  }

  // Crear un nuevo producto
  // Crear un nuevo producto
  crearProducto(formData: FormData): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, formData);
  }
}