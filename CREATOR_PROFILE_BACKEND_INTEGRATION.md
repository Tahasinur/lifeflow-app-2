# Creator Profile System - Backend Integration Guide

## Status Check

### Frontend ✅ COMPLETE
- All components built and tested
- All routes configured
- TypeScript validation: **0 errors**
- Build status: **✅ SUCCESS** (1,882 modules)
- Dark mode: **Full support**
- Responsive design: **Mobile to Desktop**

### Backend ⏳ PENDING
- API endpoints to implement
- Database schema
- Authentication/Authorization

---

## Backend Implementation Checklist

### 1. Database Schema

#### Creator Profile Table
```sql
CREATE TABLE creator_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  bio TEXT NOT NULL,
  tagline VARCHAR(255),
  categories JSON,
  social_links JSON,
  stats JSON,
  is_public BOOLEAN DEFAULT true,
  is_creator BOOLEAN DEFAULT true,
  badges JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Follow Relationship Table
```sql
CREATE TABLE followers (
  id VARCHAR(36) PRIMARY KEY,
  follower_id VARCHAR(36) NOT NULL,
  following_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES creator_profiles(id),
  FOREIGN KEY (following_id) REFERENCES creator_profiles(id),
  UNIQUE KEY unique_follow (follower_id, following_id)
);
```

#### Update Users Table
```sql
ALTER TABLE users ADD COLUMN is_creator BOOLEAN DEFAULT false;
```

### 2. API Endpoints to Implement

#### Creator Endpoints

**1. Get All Creators**
```
GET /api/creators
Headers: Authorization: Bearer {token}
Response: CreatorCard[]
```

**2. Get Creator by ID**
```
GET /api/creators/:id
Headers: Authorization: Bearer {token}
Response: { user: CreatorProfile, posts: FeedItem[], isFollowing: boolean }
```

**3. Update Creator Profile**
```
PUT /api/creators/:id
Headers: Authorization: Bearer {token}, Content-Type: application/json
Body: CreatorProfile
Response: CreatorProfile
Authorization: Only allow if user_id == current user
```

**4. Get Current User's Profile**
```
GET /api/creators/me
Headers: Authorization: Bearer {token}
Response: CreatorProfile
```

**5. Convert to Creator**
```
POST /api/creators/become
Headers: Authorization: Bearer {token}, Content-Type: application/json
Body: { name, tagline, bio, categories, socialLinks, isPublic }
Response: CreatorProfile
```

**6. Search Creators**
```
GET /api/creators/search?q={query}&category={category}
Headers: Authorization: Bearer {token}
Response: CreatorCard[]
```

**7. Get Recommended Creators**
```
GET /api/creators/recommended?limit={limit}
Headers: Authorization: Bearer {token}
Response: CreatorCard[]
Note: Return creators sorted by follower count, limit 10 default
```

**8. Get Creators by Category**
```
GET /api/creators/category/:category
Headers: Authorization: Bearer {token}
Response: CreatorCard[]
```

#### Follow Endpoints

**1. Follow a Creator**
```
POST /api/followers
Headers: Authorization: Bearer {token}, Content-Type: application/json
Body: { followingId: string }
Response: { success: true }
```

**2. Unfollow a Creator**
```
DELETE /api/followers/:id
Headers: Authorization: Bearer {token}
Response: { success: true }
```

**3. Get Current User's Following List**
```
GET /api/followers/my-following
Headers: Authorization: Bearer {token}
Response: CreatorCard[]
```

**4. Get Current User's Followers**
```
GET /api/followers/my-followers
Headers: Authorization: Bearer {token}
Response: CreatorCard[]
```

**5. Get Creator's Followers**
```
GET /api/followers/:id/followers
Headers: Authorization: Bearer {token}
Response: CreatorCard[]
```

**6. Get Creator's Following List**
```
GET /api/followers/:id/following
Headers: Authorization: Bearer {token}
Response: CreatorCard[]
```

**7. Check if Following**
```
GET /api/followers/check/:id
Headers: Authorization: Bearer {token}
Response: { isFollowing: boolean }
```

### 3. Java Entity Classes

#### CreatorProfile Entity
```java
@Entity
@Table(name = "creator_profiles")
public class CreatorProfile {
    
    @Id
    private String id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String bio;
    private String tagline;
    
    @ElementCollection
    @CollectionTable(name = "creator_categories", joinColumns = @JoinColumn(name = "creator_id"))
    @Column(name = "category")
    private List<String> categories;
    
    @Convert(converter = SocialLinksConverter.class)
    private Map<String, String> socialLinks;
    
    @Convert(converter = StatsConverter.class)
    private Stats stats;
    
    private boolean isPublic;
    private boolean isCreator;
    
    @ElementCollection
    @CollectionTable(name = "creator_badges", joinColumns = @JoinColumn(name = "creator_id"))
    @Column(name = "badge")
    private List<String> badges;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### Follow Entity
```java
@Entity
@Table(name = "followers")
public class Follow {
    
    @Id
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "follower_id")
    private CreatorProfile follower;
    
    @ManyToOne
    @JoinColumn(name = "following_id")
    private CreatorProfile following;
    
    private LocalDateTime createdAt;
}
```

#### Stats Class
```java
public class Stats {
    private int followers;
    private int following;
    private int templates;
    private int posts;
}
```

### 4. Repository Interfaces

```java
@Repository
public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, String> {
    Optional<CreatorProfile> findByUserId(Long userId);
    List<CreatorProfile> findByIsPublicTrue();
    List<CreatorProfile> findByNameContainingIgnoreCase(String name);
    List<CreatorProfile> findByCategoriesContaining(String category);
    Page<CreatorProfile> findByIsPublicTrue(Pageable pageable);
}

@Repository
public interface FollowRepository extends JpaRepository<Follow, String> {
    List<Follow> findByFollowerId(String followerId);
    List<Follow> findByFollowingId(String followingId);
    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);
    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);
}
```

### 5. Service Layer

```java
@Service
public class CreatorService {
    
    public CreatorProfile createCreatorProfile(User user, CreateCreatorRequest request) {
        // Create new creator profile
    }
    
    public CreatorProfile updateProfile(String creatorId, CreatorProfile profile) {
        // Update profile (verify ownership)
    }
    
    public List<CreatorCard> searchCreators(String query, String category) {
        // Search by name/bio and optional category filter
    }
    
    public List<CreatorCard> getRecommendedCreators(int limit) {
        // Return top creators by followers
    }
}

@Service
public class FollowService {
    
    public void followCreator(String followerId, String followingId) {
        // Create follow relationship
    }
    
    public void unfollowCreator(String followerId, String followingId) {
        // Delete follow relationship
    }
    
    public List<CreatorCard> getFollowers(String creatorId) {
        // Get all followers of creator
    }
    
    public List<CreatorCard> getFollowing(String creatorId) {
        // Get all creators this user follows
    }
    
    public boolean isFollowing(String followerId, String followingId) {
        // Check if relationship exists
    }
}
```

### 6. Controller Classes

```java
@RestController
@RequestMapping("/api/creators")
public class CreatorController {
    
    @GetMapping
    public ResponseEntity<List<CreatorCard>> getAllCreators() { }
    
    @GetMapping("/{id}")
    public ResponseEntity<CreatorProfileDTO> getCreator(@PathVariable String id) { }
    
    @PutMapping("/{id}")
    public ResponseEntity<CreatorProfile> updateCreator(
        @PathVariable String id,
        @RequestBody CreatorProfile profile,
        @AuthenticationPrincipal UserDetails user) { }
    
    @GetMapping("/me")
    public ResponseEntity<CreatorProfile> getMyProfile(@AuthenticationPrincipal UserDetails user) { }
    
    @PostMapping("/become")
    public ResponseEntity<CreatorProfile> becomeCreator(
        @RequestBody CreateCreatorRequest request,
        @AuthenticationPrincipal UserDetails user) { }
    
    @GetMapping("/search")
    public ResponseEntity<List<CreatorCard>> search(
        @RequestParam String q,
        @RequestParam(required = false) String category) { }
    
    @GetMapping("/recommended")
    public ResponseEntity<List<CreatorCard>> recommended(@RequestParam(defaultValue = "10") int limit) { }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<CreatorCard>> byCategory(@PathVariable String category) { }
}

@RestController
@RequestMapping("/api/followers")
public class FollowController {
    
    @PostMapping
    public ResponseEntity<Map<String, Boolean>> follow(
        @RequestBody FollowRequest request,
        @AuthenticationPrincipal UserDetails user) { }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> unfollow(
        @PathVariable String id,
        @AuthenticationPrincipal UserDetails user) { }
    
    @GetMapping("/my-following")
    public ResponseEntity<List<CreatorCard>> getMyFollowing(@AuthenticationPrincipal UserDetails user) { }
    
    @GetMapping("/my-followers")
    public ResponseEntity<List<CreatorCard>> getMyFollowers(@AuthenticationPrincipal UserDetails user) { }
    
    @GetMapping("/{id}/followers")
    public ResponseEntity<List<CreatorCard>> getFollowers(@PathVariable String id) { }
    
    @GetMapping("/{id}/following")
    public ResponseEntity<List<CreatorCard>> getFollowing(@PathVariable String id) { }
    
    @GetMapping("/check/{id}")
    public ResponseEntity<Map<String, Boolean>> isFollowing(
        @PathVariable String id,
        @AuthenticationPrincipal UserDetails user) { }
}
```

### 7. Data Transfer Objects (DTOs)

```java
public class CreatorProfileDTO {
    private CreatorProfile user;
    private List<FeedItem> posts;
    private boolean isFollowing;
}

public class CreateCreatorRequest {
    private String name;
    private String bio;
    private String tagline;
    private List<String> categories;
    private Map<String, String> socialLinks;
    private boolean isPublic;
}

public class FollowRequest {
    private String followingId;
}
```

---

## Testing Endpoints

### Test Creator Creation
```bash
curl -X POST http://localhost:8080/api/creators/become \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "bio": "Productivity expert",
    "tagline": "Helping you work smarter",
    "categories": ["productivity", "business"],
    "socialLinks": {
      "twitter": "https://twitter.com/johndoe",
      "website": "https://johndoe.com"
    },
    "isPublic": true
  }'
```

### Test Get All Creators
```bash
curl -X GET http://localhost:8080/api/creators \
  -H "Authorization: Bearer {token}"
```

### Test Follow Creator
```bash
curl -X POST http://localhost:8080/api/followers \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"followingId": "creator-id-123"}'
```

---

## Frontend-Backend Integration Points

### Service Methods → Endpoints Mapping

| Frontend Method | HTTP | Backend Endpoint | Returns |
|---|---|---|---|
| getAllCreators() | GET | /api/creators | CreatorCard[] |
| getCreatorProfile(id) | GET | /api/creators/:id | CreatorProfile |
| updateCreatorProfile(id, data) | PUT | /api/creators/:id | CreatorProfile |
| getMyProfile() | GET | /api/creators/me | CreatorProfile |
| becomeCreator(data) | POST | /api/creators/become | CreatorProfile |
| searchCreators(q, cat) | GET | /api/creators/search?q=&cat= | CreatorCard[] |
| getRecommendedCreators() | GET | /api/creators/recommended | CreatorCard[] |
| getCreatorsByCategory(cat) | GET | /api/creators/category/:cat | CreatorCard[] |
| followCreator(id) | POST | /api/followers | {success} |
| unfollowCreator(id) | DELETE | /api/followers/:id | {success} |
| getMyFollowing() | GET | /api/followers/my-following | CreatorCard[] |
| getMyFollowers() | GET | /api/followers/my-followers | CreatorCard[] |
| getFollowers(id) | GET | /api/followers/:id/followers | CreatorCard[] |
| getFollowing(id) | GET | /api/followers/:id/following | CreatorCard[] |
| isFollowing(id) | GET | /api/followers/check/:id | {isFollowing} |

---

## Performance Optimization Tips

1. **Pagination**: Add limit/offset for creator lists
2. **Caching**: Cache popular creators list
3. **Indexing**: Index category, follower_count columns
4. **Query Optimization**: Use SELECT * only when needed
5. **Lazy Loading**: Load stats separately if needed

---

## Security Considerations

1. **Authorization**: Verify user owns profile before updating
2. **Input Validation**: Validate all input (bio length, URL format)
3. **Rate Limiting**: Limit follow/unfollow per minute
4. **XSS Prevention**: Sanitize bio and tagline
5. **CORS**: Configure CORS for frontend domain

---

## Next Steps

1. **Implement database schema**
2. **Create entity classes**
3. **Create repository interfaces**
4. **Create service layer**
5. **Create controller endpoints**
6. **Test all endpoints**
7. **Deploy and verify**

---

**Frontend Status**: ✅ 100% Complete  
**Backend Status**: ⏳ Ready for Implementation  
**Estimated Backend Dev Time**: 2-3 days  
**Deployment Ready**: After backend completion
