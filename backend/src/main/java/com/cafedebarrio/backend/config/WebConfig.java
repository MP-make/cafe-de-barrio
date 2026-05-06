package com.cafedebarrio.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ¡ESTO ES VITAL! Enlaza la URL de Angular con la carpeta física de tu PC
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}