package com.cafedebarrio.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // <-- Cambiado de Long a Integer
    
    private String username;
    private String email;
    private String password;
    private String rol;
    private boolean activo;

    public Usuario() {}

    public Usuario(String username, String email, String password, String rol, boolean activo) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.activo = activo;
    }

    public Integer getId() { return id; } // <-- Cambiado a Integer
    public void setId(Integer id) { this.id = id; } // <-- Cambiado a Integer
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}