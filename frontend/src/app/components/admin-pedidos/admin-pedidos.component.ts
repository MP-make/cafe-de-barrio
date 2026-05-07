import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- AÑADIDO PARA EL FILTRO
import { PedidoService } from '../../services/pedido.service';
import { Pedido, EstadoPedido } from '../../models/pedido.model';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- AÑADIDO AQUÍ
  templateUrl: './admin-pedidos.component.html',
  styleUrl: './admin-pedidos.component.scss'
})
export class AdminPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  filteredPedidos: Pedido[] = []; // <-- ARRAY PARA LA TABLA
  estados = Object.values(EstadoPedido);
  
  // Filtro por defecto en PENDIENTE
  filtroEstado: string = EstadoPedido.PENDIENTE; 

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
        this.aplicarFiltro(); // <-- APLICA EL FILTRO AL CARGAR
      },
      error: (err) => console.error('❌ Error cargando pedidos:', err)
    });
  }

  aplicarFiltro(): void {
    if (this.filtroEstado === 'TODOS') {
      this.filteredPedidos = [...this.pedidos];
    } else {
      this.filteredPedidos = this.pedidos.filter(p => p.estado === this.filtroEstado);
    }
    this.cdr.detectChanges();
  }

  updateEstado(pedido: Pedido, nuevoEstado: string): void {
    this.pedidoService.updateEstado(pedido.id!, nuevoEstado as EstadoPedido).subscribe({
      next: (updatedPedido) => {
        pedido.estado = updatedPedido.estado;
        this.aplicarFiltro(); // <-- ACTUALIZA LA VISTA (Si pasas de Pendiente a Entregado, desaparece de la lista actual)
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error actualizando estado:', err)
    });
  }
}