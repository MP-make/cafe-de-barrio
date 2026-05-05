package com.cafedebarrio.backend.dto;

import java.util.List;

public record PedidoRequestDTO(
    String clienteNombre,
    String celular,
    String direccion,
    List<DetalleItemDTO> items
) {
    public record DetalleItemDTO(
        Integer productoId,
        Integer cantidad
    ) {}
}