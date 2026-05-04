import { Producto } from './producto.model';

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  EN_PREPARACION = 'EN_PREPARACION',
  ENTREGADO = 'ENTREGADO'
}

export interface Pedido {
  id?: number;
  clienteNombre: string;
  celular: string;
  direccion: string;
  fecha?: string;
  estado: EstadoPedido;
  total: number;
  detalles: DetallePedido[];
}

export interface DetallePedido {
  id?: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: Producto;
}
