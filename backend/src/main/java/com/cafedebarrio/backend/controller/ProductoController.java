package com.cafedebarrio.backend.controller;

import com.cafedebarrio.backend.dto.ProductoRequestDTO;
import com.cafedebarrio.backend.dto.ProductoResponseDTO;
import com.cafedebarrio.backend.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = {"http://localhost:4200", "https://cafe-de-barrio.vercel.app", "https://cafe-de-barrio-git-main-mps-projects-9c97c06d.vercel.app"})
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> getProductos(@RequestParam(required = false) Integer categoriaId) {
        return ResponseEntity.ok(productoService.obtenerProductos(categoriaId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoResponseDTO> createProducto(@Valid @ModelAttribute ProductoRequestDTO dto) {
        return new ResponseEntity<>(productoService.crearProducto(dto), HttpStatus.CREATED);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ProductoResponseDTO>> searchProductos(@RequestParam String query) {
        return ResponseEntity.ok(productoService.buscarProductos(query));
    }

    // --- MÉTODOS AÑADIDOS PARA ACTUALIZAR Y ELIMINAR ---

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoResponseDTO> updateProducto(
            @PathVariable Integer id, 
            @Valid @ModelAttribute ProductoRequestDTO dto) {
        return ResponseEntity.ok(productoService.actualizarProducto(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable Integer id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }
}
