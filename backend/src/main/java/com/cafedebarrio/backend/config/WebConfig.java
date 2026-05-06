package com.cafedebarrio.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // Dejamos esta clase vacía. 
    // Spring Security se encargará de los CORS para evitar conflictos.
}