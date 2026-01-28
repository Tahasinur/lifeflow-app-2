package com.lifeflow.backend.controller;

import com.lifeflow.backend.dto.OpenTabDTO;
import com.lifeflow.backend.model.OpenTab;
import com.lifeflow.backend.model.Page;
import com.lifeflow.backend.repository.OpenTabRepository;
import com.lifeflow.backend.repository.PageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tabs")
@CrossOrigin(origins = "http://localhost:3000")
public class OpenTabController {

    private final OpenTabRepository openTabRepository;
    private final PageRepository pageRepository;

    public OpenTabController(OpenTabRepository openTabRepository, PageRepository pageRepository) {
        this.openTabRepository = openTabRepository;
        this.pageRepository = pageRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllOpenTabs(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "User ID is required"));
        }

        List<OpenTab> openTabs = openTabRepository.findByUserIdOrderByTabOrderAsc(userId);

        // Fetch page details for each tab
        List<OpenTabDTO> tabsWithPages = openTabs.stream()
                .map(tab -> {
                    Optional<Page> pageOpt = pageRepository.findById(tab.getPageId());
                    return OpenTabDTO.builder()
                            .id(tab.getId())
                            .userId(tab.getUserId())
                            .pageId(tab.getPageId())
                            .tabOrder(tab.getTabOrder())
                            .openedAt(tab.getOpenedAt())
                            .page(pageOpt.orElse(null))
                            .build();
                })
                .filter(dto -> dto.getPage() != null) // Filter out tabs with deleted pages
                .collect(Collectors.toList());

        return ResponseEntity.ok(tabsWithPages);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> openTab(@RequestBody Map<String, String> request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "User ID is required"));
        }

        String pageId = request.get("pageId");
        if (pageId == null || pageId.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Page ID is required"));
        }

        // Check if page exists and belongs to user
        Optional<Page> pageOpt = pageRepository.findById(pageId);
        if (pageOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Page page = pageOpt.get();
        if (!page.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to access this page"));
        }

        // Check if tab already exists
        Optional<OpenTab> existingTab = openTabRepository.findByUserIdAndPageId(userId, pageId);
        if (existingTab.isPresent()) {
            // Return existing tab instead of creating duplicate
            OpenTab tab = existingTab.get();
            return ResponseEntity.ok(OpenTabDTO.builder()
                    .id(tab.getId())
                    .userId(tab.getUserId())
                    .pageId(tab.getPageId())
                    .tabOrder(tab.getTabOrder())
                    .openedAt(tab.getOpenedAt())
                    .page(page)
                    .build());
        }

        // Get max order and increment
        List<OpenTab> userTabs = openTabRepository.findByUserIdOrderByTabOrderAsc(userId);
        int maxOrder = userTabs.stream()
                .mapToInt(OpenTab::getTabOrder)
                .max()
                .orElse(-1);

        OpenTab newTab = OpenTab.builder()
                .userId(userId)
                .pageId(pageId)
                .tabOrder(maxOrder + 1)
                .build();

        OpenTab savedTab = openTabRepository.save(newTab);

        return ResponseEntity.ok(OpenTabDTO.builder()
                .id(savedTab.getId())
                .userId(savedTab.getUserId())
                .pageId(savedTab.getPageId())
                .tabOrder(savedTab.getTabOrder())
                .openedAt(savedTab.getOpenedAt())
                .page(page)
                .build());
    }

    @DeleteMapping("/{tabId}")
    @Transactional
    public ResponseEntity<?> closeTab(@PathVariable String tabId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "User ID is required"));
        }

        Optional<OpenTab> tabOpt = openTabRepository.findById(tabId);
        if (tabOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        OpenTab tab = tabOpt.get();
        if (!tab.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to close this tab"));
        }

        openTabRepository.delete(tab);

        // Reorder remaining tabs to fill the gap
        List<OpenTab> remainingTabs = openTabRepository.findByUserIdOrderByTabOrderAsc(userId);
        for (int i = 0; i < remainingTabs.size(); i++) {
            remainingTabs.get(i).setTabOrder(i);
        }
        openTabRepository.saveAll(remainingTabs);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/reorder")
    @Transactional
    public ResponseEntity<?> reorderTabs(@RequestBody Map<String, List<String>> request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "User ID is required"));
        }

        List<String> tabIds = request.get("tabIds");
        if (tabIds == null || tabIds.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Tab IDs are required"));
        }

        // Update order for each tab
        for (int i = 0; i < tabIds.size(); i++) {
            String tabId = tabIds.get(i);
            Optional<OpenTab> tabOpt = openTabRepository.findById(tabId);
            if (tabOpt.isPresent()) {
                OpenTab tab = tabOpt.get();
                if (tab.getUserId().equals(userId)) {
                    tab.setTabOrder(i);
                    openTabRepository.save(tab);
                }
            }
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<?> closeAllTabs(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "User ID is required"));
        }

        openTabRepository.deleteByUserId(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
