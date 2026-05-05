package com.cafedebarrio.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;

public class ProductoRequestDTO {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    private MultipartFile imagenFile;

    private Boolean activo;

    @NotNull(message = "La categoría es obligatoria")
    private Integer categoriaId;

    // Constructors, getters, setters
    public ProductoRequestDTO() {}

    public ProductoRequestDTO(String nombre, String descripcion, BigDecimal precio, Integer stock, MultipartFile imagenFile, Boolean activo, Integer categoriaId) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.imagenFile = imagenFile;
        this.activo = activo;
        this.categoriaId = categoriaId;
    }

    // Getters and setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public MultipartFile getImagenFile() { return imagenFile; }
    public void setImagenFile(MultipartFile imagenFile) { this.imagenFile = imagenFile; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public Integer getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }
}