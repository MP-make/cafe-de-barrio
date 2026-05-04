package com.cafedebarrio.backend.repository;

import com.cafedebarrio.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> { // Cambiado a Integer
    List<Producto> findByCategoriaId(Integer categoriaId); // Cambiado a Integer
    List<Producto> findByActivoTrue(); 
}