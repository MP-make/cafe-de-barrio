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
// Ya no usamos @RequiredArgsConstructor aquí
public class ProductoController {

    private final ProductoService productoService;

    // ¡SOLUCIÓN DEFINITIVA! Constructor explícito y manual.
    // Esto evita que Maven y Java se quejen de que la variable no está inicializada.
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
}