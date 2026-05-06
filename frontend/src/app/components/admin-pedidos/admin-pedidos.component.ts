import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- 1. Importamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { Pedido, EstadoPedido } from '../../models/pedido.model';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-pedidos.component.html',
  styleUrl: './admin-pedidos.component.scss' // <-- ¡ESTA ES LA LÍNEA MÁGICA QUE FALTA!
})
export class AdminPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  estados = Object.values(EstadoPedido);

  constructor(
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef // <-- 2. Lo inyectamos en el constructor
  ) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.pedidoService.getPedidos().subscribe({
      next: (data: any) => {
        console.log('📦 Datos crudos del backend:', data);
        
        // Asignamos los datos a la variable
        this.pedidos = Array.isArray(data) ? data : (data.content || data.data || []);
        
        console.log('✅ Pedidos procesados para la tabla:', this.pedidos);
        
        // <-- 3. MAGIA: Obligamos a Angular a redibujar el HTML con los nuevos datos
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('❌ Error cargando pedidos:', err)
    });
  }

  updateEstado(pedido: Pedido, nuevoEstado: string): void {
    this.pedidoService.updateEstado(pedido.id!, nuevoEstado as EstadoPedido).subscribe({
      next: (updatedPedido) => {
        pedido.estado = updatedPedido.estado;
        alert('Estado actualizado');
        
        // También forzamos la actualización visual aquí por si acaso
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error actualizando estado:', err)
    });
  }
}