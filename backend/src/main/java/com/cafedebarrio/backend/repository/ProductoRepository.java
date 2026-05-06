package com.cafedebarrio.backend.repository;

import com.cafedebarrio.backend.entity.Producto;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> { 

    // @EntityGraph le dice a la base de datos: "¡Tráeme la categoría en el mismo viaje, no vayas dos veces!"

    @EntityGraph(attributePaths = "categoria")
    List<Producto> findByCategoriaId(Integer categoriaId); 

    @EntityGraph(attributePaths = "categoria")
    List<Producto> findByActivoTrue(); 

    @EntityGraph(attributePaths = "categoria")
    List<Producto> findByNombreContainingIgnoreCaseOrDescripcionContainingIgnoreCase(String nombre, String descripcion);
}