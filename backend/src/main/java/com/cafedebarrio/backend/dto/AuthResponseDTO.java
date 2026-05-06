package com.cafedebarrio.backend.dto;

public class AuthResponseDTO {
    private String token;
    private String username;
    private String rol;

    public AuthResponseDTO() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}