package com.cafedebarrio.backend.service;

import com.cafedebarrio.backend.dto.ProductoRequestDTO;
import com.cafedebarrio.backend.dto.ProductoResponseDTO;
import com.cafedebarrio.backend.entity.Categoria;
import com.cafedebarrio.backend.entity.Producto;
import com.cafedebarrio.backend.repository.CategoriaRepository;
import com.cafedebarrio.backend.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.Base64;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }
    private static final String UPLOAD_DIR = "uploads/";



    public List<ProductoResponseDTO> obtenerProductos(Integer categoriaId) {
        List<Producto> productos = (categoriaId != null) 
            ? productoRepository.findByCategoriaId(categoriaId) 
            : productoRepository.findAll();
            
        return productos.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<ProductoResponseDTO> buscarProductos(String query) {
        List<Producto> productos = productoRepository.findByNombreContainingIgnoreCaseOrDescripcionContainingIgnoreCase(query, query);
        return productos.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ProductoResponseDTO crearProducto(ProductoRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Producto producto = new Producto();
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setStock(dto.getStock());
        producto.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
        producto.setCategoria(categoria);

        if (dto.getImagenFile() != null && !dto.getImagenFile().isEmpty()) {
            try {
                String fileName = UUID.randomUUID().toString() + "_" + dto.getImagenFile().getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, dto.getImagenFile().getBytes());
                
                producto.setImagenUrl("/uploads/" + fileName); 
                
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar la imagen", e);
            }
        }

        Producto guardado = productoRepository.save(producto);
        return mapToDTO(guardado);
    }

    // --- MÉTODOS AÑADIDOS PARA ACTUALIZAR Y ELIMINAR ---

    public ProductoResponseDTO actualizarProducto(Integer id, ProductoRequestDTO dto) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setStock(dto.getStock());
        producto.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
        producto.setCategoria(categoria);

        if (dto.getImagenFile() != null && !dto.getImagenFile().isEmpty()) {
            try {
                String fileName = UUID.randomUUID().toString() + "_" + dto.getImagenFile().getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, dto.getImagenFile().getBytes());
                
                producto.setImagenUrl("/uploads/" + fileName); 
                
            } catch (IOException e) {
                throw new RuntimeException("Error al actualizar la imagen", e);
            }
        }

        Producto actualizado = productoRepository.save(producto);
        return mapToDTO(actualizado);
    }

    public void eliminarProducto(Integer id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado");
        }
        productoRepository.deleteById(id);
    }

    private ProductoResponseDTO mapToDTO(Producto producto) {
        return new ProductoResponseDTO(
            producto.getId(),
            producto.getNombre(),
            producto.getDescripcion(),
            producto.getPrecio(),
            producto.getStock(),
            producto.getImagenUrl(),
            producto.getActivo(),
            producto.getCategoria() != null ? producto.getCategoria().getId() : null
        );
    }
}
