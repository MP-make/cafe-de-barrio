package com.cafedebarrio.backend.repository;

import com.cafedebarrio.backend.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    // Aquí podrías agregar búsquedas por celular o nombre en el futuro
}