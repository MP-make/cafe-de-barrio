package com.cafedebarrio.backend.service;

import com.cafedebarrio.backend.entity.Producto;
import com.cafedebarrio.backend.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> obtenerTodosActivos() {
        return productoRepository.findByActivoTrue();
    }

    public List<Producto> obtenerPorCategoria(Integer categoriaId) { // Cambiado a Integer
        return productoRepository.findByCategoriaId(categoriaId);
    }

    public Optional<Producto> obtenerPorId(Integer id) { // Cambiado a Integer
        return productoRepository.findById(id);
    }
    // Añade esto debajo de tus otros métodos
    public Producto guardarProducto(Producto producto) {
        return productoRepository.save(producto);
    }
    public void eliminarProducto(Integer id) {
        productoRepository.deleteById(id);
    }
    
    public Producto actualizarProducto(Integer id, Producto productoDetalles) {
        Producto producto = productoRepository.findById(id).orElseThrow();
        producto.setNombre(productoDetalles.getNombre());
        producto.setPrecio(productoDetalles.getPrecio());
        producto.setStock(productoDetalles.getStock());
        producto.setDescripcion(productoDetalles.getDescripcion());
        producto.setImagenUrl(productoDetalles.getImagenUrl());
        return productoRepository.save(producto);
    }
}