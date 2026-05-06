package com.cafedebarrio.backend.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {
    // Clave secreta larga para que el algoritmo HS256 esté feliz
    private String jwtSecret = "CafeDeBarrioSecretKeyParaSeguridadJWT2026SistemaDeVentasSuperSeguro"; 
    private int jwtExpirationMs = 86400000; // 24 horas

    public String generateToken(UserDetailsImpl userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("rol", userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                // AQUÍ CAMBIAMOS A HS256
                .signWith(SignatureAlgorithm.HS256, jwtSecret) 
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}