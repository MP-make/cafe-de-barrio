package com.cafedebarrio.backend.controller;

import com.cafedebarrio.backend.entity.Categoria;
import com.cafedebarrio.backend.service.CategoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = {"http://localhost:4200", "https://cafe-de-barrio.vercel.app", "https://cafe-de-barrio-git-main-mps-projects-9c97c06d.vercel.app"})
public class CategoriaController {
    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<Categoria>> listarCategorias() {
        return ResponseEntity.ok(categoriaService.obtenerTodas());
    }
}
