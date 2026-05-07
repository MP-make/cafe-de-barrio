package com.cafedebarrio.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Enlaza la URL de Angular con la carpeta física de tu PC o servidor
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // ¡ESTO ES VITAL PARA VERCEL! Permite peticiones de otros dominios
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:4200", 
                    "https://cafe-de-barrio.vercel.app" // ¡Asegúrate de que esta sea la URL exacta de tu Vercel!
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}