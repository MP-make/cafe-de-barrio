package com.cafedebarrio.backend.service;

import com.cafedebarrio.backend.dto.ProductoRequestDTO;
import com.cafedebarrio.backend.dto.ProductoResponseDTO;
import com.cafedebarrio.backend.entity.Categoria;
import com.cafedebarrio.backend.entity.Producto;
import com.cafedebarrio.backend.repository.CategoriaRepository;
import com.cafedebarrio.backend.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final FileStorageService fileStorageService;

    public ProductoService(ProductoRepository productoRepository, 
                           CategoriaRepository categoriaRepository,
                           FileStorageService fileStorageService) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<ProductoResponseDTO> obtenerProductos(Integer categoriaId) {
        List<Producto> productos = (categoriaId != null) 
            ? productoRepository.findByCategoriaId(categoriaId) 
            : productoRepository.findAll();
            
        return productos.stream()
                .filter(Producto::getActivo) // 👻 EL FILTRO MÁGICO CORREGIDO
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductoResponseDTO> buscarProductos(String query) {
        List<Producto> productos = productoRepository.findByNombreContainingIgnoreCaseOrDescripcionContainingIgnoreCase(query, query);
        
        return productos.stream()
                .filter(Producto::getActivo) // 👻 EL FILTRO MÁGICO CORREGIDO
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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
                String fileName = fileStorageService.uploadFile(dto.getImagenFile());
                producto.setImagenUrl(fileName); 
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar la imagen en la nube", e);
            }
        }

        Producto guardado = productoRepository.save(producto);
        return mapToDTO(guardado);
    }

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
            
            // ESCUDO 1: Intentamos borrar la foto vieja, si falla, ignoramos y seguimos
            try {
                if (producto.getImagenUrl() != null && !producto.getImagenUrl().isEmpty()) {
                    fileStorageService.deleteFile(producto.getImagenUrl());
                }
            } catch (Exception e) {
                System.out.println("⚠️ Advertencia: No se pudo borrar la foto anterior en Supabase. " + e.getMessage());
            }
            
            // Subimos la nueva foto
            try {
                String fileName = fileStorageService.uploadFile(dto.getImagenFile());
                producto.setImagenUrl(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Error al actualizar la imagen en la nube", e);
            }
        }

        Producto actualizado = productoRepository.save(producto);
        return mapToDTO(actualizado);
    }

    public void eliminarProducto(Integer id) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
            
        // ESCUDO 2: Intentamos borrar la imagen en Supabase, si falla, ignoramos y seguimos
        try {
            if (producto.getImagenUrl() != null && !producto.getImagenUrl().isEmpty()) {
                fileStorageService.deleteFile(producto.getImagenUrl());
            }
        } catch (Exception e) {
            System.out.println("⚠️ Advertencia: No se pudo borrar la foto en Supabase al eliminar. " + e.getMessage());
        }

        // ESCUDO 3: Intentamos borrar el producto. Si está atado a un Pedido, hacemos Baja Lógica.
        try {
            productoRepository.delete(producto);
            System.out.println("✅ Producto eliminado físicamente de la base de datos.");
        } catch (Exception e) {
            System.out.println("⚠️ El producto está en un pedido. Cambiando estado a INACTIVO.");
            producto.setActivo(false);
            productoRepository.save(producto);
        }
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