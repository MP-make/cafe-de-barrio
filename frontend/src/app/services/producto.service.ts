import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) { }

  getProductos(categoriaId?: number): Observable<Producto[]> {
    let params = new HttpParams();
    if (categoriaId) {
      params = params.set('categoriaId', categoriaId.toString());
    }
    return this.http.get<Producto[]>(this.apiUrl, { params });
  }

  crearProducto(formData: FormData): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, formData);
  }

  // NUEVO: Método para buscar
  buscarProductos(query: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/search?query=${query}`);
  }
}