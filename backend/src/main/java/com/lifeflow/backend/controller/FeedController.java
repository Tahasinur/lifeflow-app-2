package com.lifeflow.backend.controller;

import com.lifeflow.backend.model.Comment;
import com.lifeflow.backend.model.FeedItem;
import com.lifeflow.backend.model.FeedLike;
import com.lifeflow.backend.model.Page;
import com.lifeflow.backend.model.User;
import com.lifeflow.backend.repository.CommentRepository;
import com.lifeflow.backend.repository.FeedItemRepository;
import com.lifeflow.backend.repository.FeedLikeRepository;
import com.lifeflow.backend.repository.PageRepository;
import com.lifeflow.backend.repository.UserRepository;
import com.lifeflow.backend.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5000", "http://localhost:5173" })
public class FeedController {

    private final FeedItemRepository feedRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final PageRepository pageRepository;
    private final FeedLikeRepository feedLikeRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public FeedController(
            FeedItemRepository feedRepository,
            UserRepository userRepository,
            CommentRepository commentRepository,
            PageRepository pageRepository,
            FeedLikeRepository feedLikeRepository,
            JwtTokenProvider jwtTokenProvider) {
        this.feedRepository = feedRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.pageRepository = pageRepository;
        this.feedLikeRepository = feedLikeRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    // Helper method to extract user from JWT token
    private User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return null;
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email).orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(required = false) String authorId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User currentUser = getUserFromToken(authHeader);

            List<FeedItem> items;
            if (authorId != null && !authorId.isEmpty()) {
                items = feedRepository.findByAuthorIdOrderByCreatedAtDesc(authorId);
            } else {
                items = feedRepository.findAllByOrderByCreatedAtDesc();
            }
            List<Map<String, Object>> response = new ArrayList<>();

            for (FeedItem item : items) {
                Map<String, Object> itemData = new HashMap<>();
                itemData.put("id", item.getId());
                itemData.put("title", item.getTitle());
                itemData.put("description", item.getDescription());
                itemData.put("type", item.getType());
                itemData.put("sourcePageId", item.getSourcePageId());
                itemData.put("tags", item.getTags());
                itemData.put("createdAt", item.getCreatedAt());

                // Get actual author information
                User author = item.getAuthor();
                if (author != null) {
                    Map<String, String> authorData = new HashMap<>();
                    authorData.put("id", author.getId());
                    authorData.put("name", author.getName());
                    authorData.put("email", author.getEmail());
                    authorData.put("avatar", author.getAvatar() != null ? author.getAvatar()
                            : author.getName().substring(0, Math.min(2, author.getName().length())).toUpperCase());
                    itemData.put("author", authorData);
                } else {
                    Map<String, String> authorData = new HashMap<>();
                    authorData.put("id", "");
                    authorData.put("name", "Anonymous");
                    authorData.put("email", "anonymous@example.com");
                    authorData.put("avatar", "AN");
                    itemData.put("author", authorData);
                }

                // Get like count and user's like status
                int likeCount = feedLikeRepository.countByFeedItemId(item.getId());
                itemData.put("likes", likeCount);

                if (currentUser != null) {
                    boolean isLiked = feedLikeRepository.existsByFeedItemIdAndUserId(
                            item.getId(), currentUser.getId());
                    itemData.put("isLiked", isLiked);
                } else {
                    itemData.put("isLiked", false);
                }

                // Get comment count
                int commentCount = commentRepository.countByFeedItemId(item.getId());
                itemData.put("commentCount", commentCount);

                response.add(itemData);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to load feed: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFeedItem(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User currentUser = getUserFromToken(authHeader);
            Optional<FeedItem> itemOpt = feedRepository.findById(id);

            if (itemOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            FeedItem item = itemOpt.get();
            Map<String, Object> itemData = new HashMap<>();
            itemData.put("id", item.getId());
            itemData.put("title", item.getTitle());
            itemData.put("description", item.getDescription());
            itemData.put("type", item.getType());
            itemData.put("sourcePageId", item.getSourcePageId());
            itemData.put("tags", item.getTags());
            itemData.put("createdAt", item.getCreatedAt());

            // Get author information
            User author = item.getAuthor();
            if (author != null) {
                Map<String, String> authorData = new HashMap<>();
                authorData.put("id", author.getId());
                authorData.put("name", author.getName());
                authorData.put("email", author.getEmail());
                authorData.put("avatar", author.getAvatar() != null ? author.getAvatar()
                        : author.getName().substring(0, Math.min(2, author.getName().length())).toUpperCase());
                itemData.put("author", authorData);
            }

            // Get like count and user's like status
            int likeCount = feedLikeRepository.countByFeedItemId(item.getId());
            itemData.put("likes", likeCount);

            if (currentUser != null) {
                boolean isLiked = feedLikeRepository.existsByFeedItemIdAndUserId(
                        item.getId(), currentUser.getId());
                itemData.put("isLiked", isLiked);
            } else {
                itemData.put("isLiked", false);
            }

            // Get comment count
            int commentCount = commentRepository.countByFeedItemId(item.getId());
            itemData.put("commentCount", commentCount);

            // If it has a sourcePageId, get the page content
            if (item.getSourcePageId() != null) {
                Optional<Page> pageOpt = pageRepository.findById(item.getSourcePageId());
                if (pageOpt.isPresent()) {
                    Page page = pageOpt.get();
                    String content = page.getEditorContentJson();
                    if (content == null || content.trim().isEmpty() || "null".equals(content) || "[]".equals(content)) {
                        content = page.getBlocksJson();
                    }
                    itemData.put("content", content);
                    itemData.put("icon", page.getIcon());
                    itemData.put("coverImage", page.getCoverImage());
                }
            }

            return ResponseEntity.ok(itemData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to load feed item: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            FeedItem item = new FeedItem();

            // Extract fields from payload
            Object titleObj = payload.get("title");
            item.setTitle(titleObj != null ? titleObj.toString() : "Untitled");

            Object descObj = payload.get("description");
            item.setDescription(descObj != null ? descObj.toString() : "");

            Object typeObj = payload.get("type");
            item.setType(typeObj != null ? typeObj.toString() : "blog");

            Object sourcePageObj = payload.get("sourcePageId");
            item.setSourcePageId(sourcePageObj != null ? sourcePageObj.toString() : null);

            @SuppressWarnings("unchecked")
            List<String> tags = (List<String>) payload.get("tags");
            item.setTags(tags != null ? tags : new ArrayList<>());

            // Get authenticated user
            User author = getUserFromToken(authHeader);

            if (author == null) {
                // If no valid token, check if userId is provided in payload
                Object userIdObj = payload.get("userId");
                if (userIdObj != null) {
                    String userId = userIdObj.toString();
                    author = userRepository.findById(userId).orElse(null);
                }

                // If still no author, create/find anonymous user
                if (author == null) {
                    String authorName = (String) payload.getOrDefault("authorName", "Anonymous");
                    String authorEmail = (String) payload.getOrDefault("authorEmail", "anonymous@example.com");
                    author = userRepository.findByEmail(authorEmail).orElseGet(() -> {
                        User newUser = new User();
                        newUser.setName(authorName);
                        newUser.setEmail(authorEmail);
                        newUser.setAvatar(authorName.substring(0, Math.min(2, authorName.length())).toUpperCase());
                        newUser.setPassword(UUID.randomUUID().toString());
                        return userRepository.save(newUser);
                    });
                }
            }

            item.setAuthor(author);
            FeedItem savedItem = feedRepository.save(item);

            return ResponseEntity.ok(savedItem);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create post: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> likePost(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = true) String authHeader) {
        try {
            User currentUser = getUserFromToken(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            Optional<FeedItem> feedItemOpt = feedRepository.findById(id);
            if (feedItemOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            FeedItem feedItem = feedItemOpt.get();

            // Check if user already liked this post
            Optional<FeedLike> existingLike = feedLikeRepository
                    .findByFeedItemIdAndUserId(id, currentUser.getId());

            if (existingLike.isPresent()) {
                // Unlike
                feedLikeRepository.delete(existingLike.get());
            } else {
                // Like
                FeedLike like = new FeedLike();
                like.setFeedItem(feedItem);
                like.setUser(currentUser);
                feedLikeRepository.save(like);

                // TODO: Create notification for post author
            }

            // Return updated like count and status
            int likeCount = feedLikeRepository.countByFeedItemId(id);
            boolean isLiked = feedLikeRepository.existsByFeedItemIdAndUserId(id, currentUser.getId());

            return ResponseEntity.ok(Map.of(
                    "likes", likeCount,
                    "isLiked", isLiked));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to toggle like: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable String id) {
        return commentRepository.findByFeedItemIdOrderByCreatedAtDesc(id);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "Authorization", required = true) String authHeader) {
        try {
            User currentUser = getUserFromToken(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            Optional<FeedItem> feedItemOpt = feedRepository.findById(id);
            if (feedItemOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            String text = payload.get("text");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Comment text is required"));
            }

            Comment comment = new Comment();
            comment.setText(text);
            comment.setAuthor(currentUser);
            comment.setFeedItem(feedItemOpt.get());

            Comment savedComment = commentRepository.save(comment);

            // TODO: Create notification for post author

            return ResponseEntity.ok(savedComment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to add comment: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<?> cloneTemplate(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = true) String authHeader) {
        try {
            User currentUser = getUserFromToken(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            Optional<FeedItem> feedItemOpt = feedRepository.findById(id);
            if (feedItemOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            FeedItem feedItem = feedItemOpt.get();
            if (!"template".equals(feedItem.getType())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only templates can be cloned"));
            }

            String sourcePageId = feedItem.getSourcePageId();
            if (sourcePageId == null || sourcePageId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No source page linked to this template"));
            }

            Optional<Page> sourcePageOpt = pageRepository.findById(sourcePageId);
            if (sourcePageOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Source page not found"));
            }

            Page sourcePage = sourcePageOpt.get();

            // Create new page owned by the current user
            Page newPage = new Page();
            newPage.setId(UUID.randomUUID().toString());
            newPage.setTitle(sourcePage.getTitle() + " (Copy)");
            newPage.setIcon(sourcePage.getIcon());
            newPage.setCoverImage(sourcePage.getCoverImage());
            newPage.setBlocksJson(sourcePage.getBlocksJson());
            newPage.setParentId(null);
            newPage.setFavorite(false);
            newPage.setDeleted(false);
            // Associate with current user
            newPage.setUserId(currentUser.getId());

            Page savedPage = pageRepository.save(newPage);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "pageId", savedPage.getId(),
                    "message", "Template copied successfully!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to clone template: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = true) String authHeader) {
        try {
            User currentUser = getUserFromToken(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            Optional<FeedItem> feedItemOpt = feedRepository.findById(id);
            if (feedItemOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            FeedItem feedItem = feedItemOpt.get();

            // Check if user owns this post
            if (feedItem.getAuthor() != null &&
                    !feedItem.getAuthor().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only delete your own posts"));
            }

            // Delete associated comments and likes
            commentRepository.deleteAll(commentRepository.findByFeedItemIdOrderByCreatedAtDesc(id));
            feedLikeRepository.deleteAll(feedLikeRepository.findAll().stream()
                    .filter(like -> like.getFeedItem().getId().equals(id))
                    .toList());

            feedRepository.delete(feedItem);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete post: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{feedId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable String feedId,
            @PathVariable String commentId,
            @RequestHeader(value = "Authorization", required = true) String authHeader) {
        try {
            User currentUser = getUserFromToken(authHeader);
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            Optional<Comment> commentOpt = commentRepository.findById(commentId);
            if (commentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Comment comment = commentOpt.get();

            // Check if user owns this comment
            if (comment.getAuthor() != null &&
                    !comment.getAuthor().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only delete your own comments"));
            }

            commentRepository.delete(comment);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete comment: " + e.getMessage()));
        }
    }
}
