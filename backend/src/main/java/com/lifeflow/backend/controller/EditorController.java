package com.lifeflow.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class EditorController {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Fetch metadata for link preview (Editor.js LinkTool)
     * Expected request: { "url": "https://example.com" }
     * Returns: { "success": 1, "meta": { "title": "...", "description": "...", "image": { "url": "..." } } }
     */
    @PostMapping("/linkmetadata")
    public ResponseEntity<?> fetchLinkMetadata(@RequestBody Map<String, String> request) {
        String url = request.get("url");

        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", 0,
                    "error", "URL is required"
            ));
        }

        try {
            // Validate URL format
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            // Fetch the page
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(java.time.Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return ResponseEntity.ok(Map.of(
                        "success", 1,
                        "meta", Map.of(
                                "title", url,
                                "description", "Unable to fetch description",
                                "image", Map.of("url", "")
                        )
                ));
            }

            String html = response.body();

            // Extract metadata
            String title = extractMetaTag(html, "og:title", "title");
            String description = extractMetaTag(html, "og:description", "description");
            String image = extractMetaTag(html, "og:image", "image");

            Map<String, Object> meta = new HashMap<>();
            meta.put("title", title);
            meta.put("description", description);
            meta.put("image", Map.of("url", image));

            return ResponseEntity.ok(Map.of(
                    "success", 1,
                    "meta", meta
            ));

        } catch (IOException | InterruptedException e) {
            return ResponseEntity.ok(Map.of(
                    "success", 1,
                    "meta", Map.of(
                            "title", url,
                            "description", "Unable to fetch metadata",
                            "image", Map.of("url", "")
                    )
            ));
        }
    }

    /**
     * Extract meta tag content from HTML
     */
    private String extractMetaTag(String html, String openGraphTag, String fallbackTag) {
        // Try Open Graph tag first
        Pattern pattern = Pattern.compile(
                String.format("<meta\\s+property=['\"]%s['\"]\\s+content=['\"]([^'\"]*)['\"]", openGraphTag),
                Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(html);
        if (matcher.find()) {
            return matcher.group(1);
        }

        // Try fallback tag (meta name)
        pattern = Pattern.compile(
                String.format("<meta\\s+name=['\"]%s['\"]\\s+content=['\"]([^'\"]*)['\"]", fallbackTag),
                Pattern.CASE_INSENSITIVE
        );
        matcher = pattern.matcher(html);
        if (matcher.find()) {
            return matcher.group(1);
        }

        return "";
    }
}
