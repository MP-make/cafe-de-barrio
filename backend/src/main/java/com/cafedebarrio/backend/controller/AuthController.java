package com.cafedebarrio.backend.controller;

import com.cafedebarrio.backend.dto.AuthResponseDTO;
import com.cafedebarrio.backend.dto.LoginRequestDTO;
import com.cafedebarrio.backend.dto.RegisterRequestDTO; // Importar DTO
import com.cafedebarrio.backend.entity.Usuario; // Importar Entidad
import com.cafedebarrio.backend.repository.UsuarioRepository; // Importar Repositorio
import com.cafedebarrio.backend.config.JwtUtils;
import com.cafedebarrio.backend.config.UserDetailsImpl;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder; // Importar para encriptar
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UsuarioRepository usuarioRepository; // Añadido
    private final PasswordEncoder passwordEncoder; // Añadido

    // Actualizamos el constructor
    public AuthController(AuthenticationManager authenticationManager, 
                          JwtUtils jwtUtils, 
                          UsuarioRepository usuarioRepository, 
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String token = jwtUtils.generateToken(userDetails);
        
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setUsername(userDetails.getUsername());
        response.setRol(userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""));
        
        return ResponseEntity.ok(response);
    }

    // --- NUEVO: MÉTODO DE REGISTRO ---
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDTO registerRequest) {
        
        // 1. Validar si el usuario existe
        if (usuarioRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: El nombre de usuario ya está en uso.");
        }

        // 2. Validar si el correo existe
        if (usuarioRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: El correo electrónico ya está en uso.");
        }

        // 3. Crear el nuevo usuario
        Usuario user = new Usuario(
            registerRequest.getUsername(),
            registerRequest.getEmail(),
            passwordEncoder.encode(registerRequest.getPassword()), // ENCRIPTAMOS LA CONTRASEÑA
            "CLIENTE", // Forzamos el rol a CLIENTE por seguridad
            true // Activo por defecto
        );

        // 4. Guardar en base de datos
        usuarioRepository.save(user);

        return ResponseEntity.ok("Usuario registrado exitosamente.");
    }
}