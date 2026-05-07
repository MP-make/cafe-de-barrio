package com.cafedebarrio.backend.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays; // <-- AÑADIDO PARA LA LISTA

@Configuration
public class CorsConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowCredentials(true);
        // ⚠️ MODO DIOS: Permite que Vercel, Localhost, o cualquier origen se conecte
        config.addAllowedOriginPattern("*"); 
        config.addAllowedHeader("*");
        
        // 🛠️ LA CORRECCIÓN: Declaramos los métodos uno por uno. 
        // Esto evita que el navegador bloquee el PUT y el DELETE cuando hay credenciales.
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        source.registerCorsConfiguration("/**", config);
        
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        // Se ejecuta PRIMERO que nada (Antes de la seguridad)
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE); 
        return bean;
    }
}