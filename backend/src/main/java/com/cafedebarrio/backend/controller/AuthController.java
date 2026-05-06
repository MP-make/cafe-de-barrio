package com.cafedebarrio.backend.controller;

import com.cafedebarrio.backend.dto.AuthResponseDTO;
import com.cafedebarrio.backend.dto.LoginRequestDTO;
import com.cafedebarrio.backend.config.JwtUtils;
import com.cafedebarrio.backend.config.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
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
}