package com.cafedebarrio.backend;

import com.cafedebarrio.backend.entity.Usuario;
import com.cafedebarrio.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    // Este código se ejecuta automáticamente cada vez que prendes el servidor
    @Bean
    CommandLineRunner initUser(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Buscamos si el usuario admin ya existe
            if (repository.findByUsername("admin").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setUsername("admin");
                admin.setEmail("admin@cafedebarrio.com");
                // Java se encarga de generar un Hash BCrypt válido y real
                admin.setPassword(passwordEncoder.encode("admin123")); 
                admin.setRol("ADMIN");
                admin.setActivo(true);
                repository.save(admin);
                System.out.println(">>> USUARIO ADMIN CREADO CORRECTAMENTE <<<");
            } else {
                // Si ya existe (con el hash falso del script SQL), lo reparamos
                Usuario admin = repository.findByUsername("admin").get();
                admin.setPassword(passwordEncoder.encode("admin123"));
                repository.save(admin);
                System.out.println(">>> CONTRASEÑA DE ADMIN REPARADA Y ACTUALIZADA A 'admin123' <<<");
            }
        };
    }
}