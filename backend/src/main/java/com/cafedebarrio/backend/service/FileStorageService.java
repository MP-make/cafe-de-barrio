package com.cafedebarrio.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    // Instanciamos el Logger para registrar la actividad en la consola
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucketName;

    public String uploadFile(MultipartFile file) throws IOException {
        // 1. Validación de entrada (Evitamos excepciones por archivos nulos o vacíos)
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo a subir no puede ser nulo o estar vacío.");
        }

        // 2. Generamos un nombre único
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename().replaceAll(" ", "_") : "imagen_sin_nombre.webp";
        String fileName = UUID.randomUUID().toString() + "_" + originalName;
        
        // 3. Construimos la URL exacta de la API de Supabase Storage
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        RestTemplate restTemplate = new RestTemplate();
        
        // 4. Configuramos los permisos y el tipo de archivo
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseKey);
        headers.set("apikey", supabaseKey); // <--- ¡ESTA ES LA LÍNEA CRÍTICA QUE FALTABA!
        
        String contentType = file.getContentType();
        if (contentType != null) {
            headers.setContentType(MediaType.valueOf(contentType));
        } else {
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM); // Tipo por defecto seguro
        }

        HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
        
        logger.info("Iniciando subida de archivo a Supabase Storage: {}", fileName);

        // 5. Enviamos la foto a Supabase
        ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

        // 6. Manejo de errores preciso con el body de Supabase
        if (!response.getStatusCode().is2xxSuccessful()) {
            logger.error("Error devuelto por Supabase al subir archivo: {}", response.getBody());
            throw new RuntimeException("Error al subir imagen a Supabase: " + response.getBody());
        }

        logger.info("Archivo subido exitosamente: {}", fileName);

        // 7. Retornamos solo el nombre del archivo para la base de datos
        return fileName;
    }

    // ==========================================
    // NUEVOS MÉTODOS AÑADIDOS SEGÚN EL FEEDBACK
    // ==========================================

    /**
     * Construye la URL pública para acceder a la imagen.
     * (Opcional usarlo en backend, ya que el Frontend de Angular ya lo está haciendo muy bien).
     */
    public String getFileUrl(String fileName) {
        if (fileName == null || fileName.isEmpty()) return null;
        if (fileName.startsWith("http")) return fileName; // Por si ya trae URL completa
        
        return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
    }

    /**
     * Elimina un archivo físicamente de Supabase Storage.
     * Útil para liberar espacio cuando borras un producto o cambias su imagen.
     */
    public void deleteFile(String fileName) {
        if (fileName == null || fileName.isEmpty() || fileName.startsWith("http")) {
            return; // No intentamos borrar si no hay archivo o es un enlace externo
        }

        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseKey);
        headers.set("apikey", supabaseKey); // <--- ¡AQUÍ TAMBIÉN SE NECESITABA PARA BORRAR!

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        logger.info("Intentando eliminar archivo en Supabase: {}", fileName);

        try {
            ResponseEntity<String> response = restTemplate.exchange(deleteUrl, HttpMethod.DELETE, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Archivo eliminado exitosamente de Storage: {}", fileName);
            } else {
                logger.warn("Supabase respondió con status {} al eliminar: {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            logger.error("Error de conexión al intentar eliminar el archivo: {}", fileName, e);
            // Capturamos el error para que, si falla Supabase, el producto igual se pueda borrar de la base de datos
        }
    }
}