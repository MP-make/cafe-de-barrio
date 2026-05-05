package com.cafedebarrio.backend.dto;

import java.math.BigDecimal;

public record ProductoResponseDTO(
    Integer id,
    String nombre,
    String descripcion,
    BigDecimal precio,
    Integer stock,
    String imagenUrl,
    Boolean activo,
    Integer categoriaId
) {}