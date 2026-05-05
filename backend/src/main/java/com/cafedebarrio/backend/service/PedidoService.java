package com.cafedebarrio.backend.service;

import com.cafedebarrio.backend.entity.DetallePedido;
import com.cafedebarrio.backend.entity.EstadoPedido;
import com.cafedebarrio.backend.entity.Pedido;
import com.cafedebarrio.backend.entity.Producto;
import com.cafedebarrio.backend.repository.PedidoRepository;
import com.cafedebarrio.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    @Transactional
    public Pedido crearPedido(Pedido pedido) {
        // Validar y calcular total
        BigDecimal total = BigDecimal.ZERO;
        for (DetallePedido detalle : pedido.getDetalles()) {
            Producto producto = productoRepository.findById(detalle.getProducto().getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detalle.getProducto().getId()));
            detalle.setProducto(producto);
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(producto.getPrecio().multiply(BigDecimal.valueOf(detalle.getCantidad())));
            producto.setStock(producto.getStock() - detalle.getCantidad()); // Actualizar stock
            total = total.add(detalle.getSubtotal());
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