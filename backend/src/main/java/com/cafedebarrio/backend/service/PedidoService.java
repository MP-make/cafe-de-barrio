package com.cafedebarrio.backend.service;

import com.cafedebarrio.backend.entity.DetallePedido;
import com.cafedebarrio.backend.entity.EstadoPedido;
import com.cafedebarrio.backend.entity.Pedido;
import com.cafedebarrio.backend.entity.Producto;
import com.cafedebarrio.backend.repository.PedidoRepository;
import com.cafedebarrio.backend.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public Pedido crearPedido(Pedido pedido) {
        // Validar y calcular total
        BigDecimal total = BigDecimal.ZERO;
        
        // Verificamos que vengan detalles para evitar NullPointerException
        if (pedido.getDetalles() != null) {
            for (DetallePedido detalle : pedido.getDetalles()) {
                
                // Vinculamos el hijo (detalle) con el padre (pedido)
                detalle.setPedido(pedido);
                
                Producto producto = productoRepository.findById(detalle.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detalle.getProducto().getId()));
                
                // 👇 NUEVA VALIDACIÓN DE STOCK (RF-BE-08)
                if (producto.getStock() < detalle.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre() + ". Disponible: " + producto.getStock() + ", solicitado: " + detalle.getCantidad());
                }
                
                detalle.setProducto(producto);
                detalle.setPrecioUnitario(producto.getPrecio());
                detalle.setSubtotal(producto.getPrecio().multiply(BigDecimal.valueOf(detalle.getCantidad())));
                
                // Actualizar stock (RF-BE-09)
                producto.setStock(producto.getStock() - detalle.getCantidad()); 
                
                total = total.add(detalle.getSubtotal());
            }
        }
        
        pedido.setTotal(total);
        return pedidoRepository.save(pedido);
    }

    public List<Pedido> obtenerTodos() {
        return pedidoRepository.findAll();
    }

    public Optional<Pedido> obtenerPorId(Integer id) {
        return pedidoRepository.findById(id);
    }

    @Transactional
    public Pedido actualizarEstado(Integer id, EstadoPedido estado) {
        Pedido pedido = obtenerPorId(id)
            .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        pedido.setEstado(estado);
        return pedidoRepository.save(pedido);
    }
}