import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'https://cafe-de-barrio-backend.onrender.com/api/productos';

  constructor(private http: HttpClient) { }

  // --- EXTRAER TOKEN CORRECTAMENTE ---
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    
    if (token) {
      console.log('Token encontrado, añadiendo a los headers...');
      return {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      };
    } else {
      console.warn('⚠️ No hay token en localStorage. La petición fallará con 403.');
      return { headers: new HttpHeaders() };
    }
  }

  getProductos(categoriaId?: number): Observable<Producto[]> {
    let params = new HttpParams();
    if (categoriaId) {
      params = params.set('categoriaId', categoriaId.toString());
    }
    // Para GET no solemos pedir token en este sistema, pero lo enviamos por si acaso
    return this.http.get<Producto[]>(this.apiUrl, { params, ...this.getHeaders() });
  }

  crearProducto(formData: FormData): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, formData, this.getHeaders());
  }

  actualizarProducto(id: number, formData: FormData): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, formData, this.getHeaders());
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  buscarProductos(query: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/search?query=${query}`, this.getHeaders());
  }
}