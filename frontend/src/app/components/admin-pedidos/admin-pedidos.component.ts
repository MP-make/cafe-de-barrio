import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { Pedido, EstadoPedido } from '../../models/pedido.model';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-pedidos.component.html',
  styleUrl: './admin-pedidos.component.scss'
})
export class AdminPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  estados = Object.values(EstadoPedido);

  constructor(
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.pedidoService.getPedidos().subscribe({
      next: (data: any) => {
        this.pedidos = Array.isArray(data) ? data : (data.content || data.data || []);
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('❌ Error cargando pedidos:', err)
    });
  }

  updateEstado(pedido: Pedido, nuevoEstado: string): void {
    this.pedidoService.updateEstado(pedido.id!, nuevoEstado as EstadoPedido).subscribe({
      next: (updatedPedido) => {
        pedido.estado = updatedPedido.estado;
        alert('Estado actualizado exitosamente');
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error actualizando estado:', err)
    });
  }
}