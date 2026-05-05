package com.cafedebarrio.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "cliente_nombre", nullable = false)
    private String clienteNombre;

    @Column(nullable = false, length = 20)
    private String celular;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String direccion;

    // Usamos ZonedDateTime para alinear con TIMESTAMP WITH TIME ZONE en Postgres
    @Column(insertable = false, updatable = false)
    private ZonedDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetallePedido> detalles = new ArrayList<>();

    // Método helper para añadir detalles y sincronizar la relación bidireccional
    public void addDetalle(DetallePedido detalle) {
        detalles.add(detalle);
        detalle.setPedido(this);
    }
}