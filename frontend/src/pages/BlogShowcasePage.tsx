import { useState } from 'react';
import { MessageCircle, Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar: string;
  category: string;
  date: string;
  readTime: number;
  likes: number;
  comments: number;
  tags: string[];
  featured?: boolean;
}

const DEMO_BLOGS: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with Lifeflow: A Beginner\'s Guide',
    excerpt: 'Learn the basics of Lifeflow and how to organize your workspace for maximum productivity.',
    content: 'Lifeflow is a powerful workspace management tool...',
    author: 'Sarah Johnson',
    authorAvatar: 'SJ',
    category: 'Guide',
    date: '2024-01-20',
    readTime: 5,
    likes: 342,
    comments: 28,
    tags: ['lifeflow', 'getting-started', 'productivity'],
    featured: true
  },
  {
    id: '2',
    title: 'Advanced Tips for Project Management',
    excerpt: 'Master advanced techniques to manage complex projects efficiently with Lifeflow.',
    content: 'When managing multiple projects, organization is key...',
    author: 'Michael Chen',
    authorAvatar: 'MC',
    category: 'Tips',
    date: '2024-01-18',
    readTime: 8,
    likes: 287,
    comments: 15,
    tags: ['project-management', 'tips', 'advanced'],
    featured: true
  },
  {
    id: '3',
    title: 'Collaboration Best Practices for Teams',
    excerpt: 'Discover how teams can collaborate effectively using Lifeflow\'s built-in features.',
    content: 'Team collaboration is more important than ever...',
    author: 'Emma Wilson',
    authorAvatar: 'EW',
    category: 'Best Practices',
    date: '2024-01-15',
    readTime: 6,
    likes: 456,
    comments: 42,
    tags: ['collaboration', 'teams', 'best-practices']
  },
  {
    id: '4',
    title: 'Automation Workflows: Save Time Every Day',
    excerpt: 'Learn how to automate repetitive tasks and focus on what matters most.',
    content: 'Automation is one of the most powerful features...',
    author: 'David Martinez',
    authorAvatar: 'DM',
    category: 'Guide',
    date: '2024-01-12',
    readTime: 7,
    likes: 523,
    comments: 56,
    tags: ['automation', 'workflows', 'productivity']
  },
  {
    id: '5',
    title: 'Security and Privacy: Keeping Your Data Safe',
    excerpt: 'Understanding Lifeflow\'s security features to protect your sensitive information.',
    content: 'Data security is our top priority...',
    author: 'Lisa Anderson',
    authorAvatar: 'LA',
    category: 'Security',
    date: '2024-01-10',
    readTime: 5,
    likes: 234,
    comments: 19,
    tags: ['security', 'privacy', 'data-protection']
  },
  {
    id: '6',
    title: 'Real Success Stories from Our Community',
    excerpt: 'See how real users are transforming their workflows with Lifeflow.',
    content: 'Our community is doing amazing things...',
    author: 'James Rodriguez',
    authorAvatar: 'JR',
    category: 'Community',
    date: '2024-01-08',
    readTime: 9,
    likes: 678,
    comments: 73,
    tags: ['community', 'success-stories', 'testimonials']
  }
];

export function BlogShowcasePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const categories = ['All', 'Guide', 'Tips', 'Best Practices', 'Security', 'Community'];
  
  const filteredPosts = DEMO_BLOGS.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = DEMO_BLOGS.filter(p => p.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAuthorClick = (authorName: string) => {
    navigate(`/user/${authorName}`);
  };

  const handleReadBlog = (post: BlogPost) => {
    toast.info(`Opening "${post.title}"...`);
    // You can navigate to a blog detail page if needed: navigate(`/blog/${post.id}`)
  };

  const handleLikeBlog = (postId: string) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
    toast.success('Liked!');
  };

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-[#191919]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#191919] border-b border-gray-200 dark:border-[#2F2F2F] px-8 py-6">
        <h1 className="text-3xl font-bold text-[#37352F] dark:text-[#E3E3E3] mb-2">
          Blog & Knowledge Base
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore tips, guides, and insights from the Lifeflow community
        </p>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#37352F] dark:text-[#E3E3E3] mb-6">
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredPosts.map(post => (
                <article
                  key={post.id}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#2F2F2F] dark:to-[#202020] border border-blue-200 dark:border-[#3F3F3F] rounded-lg overflow-hidden hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-200 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
                      Featured
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatDate(post.date)}
                    </span>
                  </div>
                    <h3 className="text-xl font-bold text-[#37352F] dark:text-[#E3E3E3] mb-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                      {post.title}
                    </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                        {post.authorAvatar}
                      </div>
                      <div>
                        <button
                          onClick={() => handleAuthorClick(post.author)}
                          className="text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                        >
                          {post.author}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {post.readTime} min read
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <button
                      onClick={() => handleLikeBlog(post.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        likedPosts.has(post.id)
                          ? 'text-red-600 dark:text-red-400'
                          : 'hover:text-red-600 dark:hover:text-red-400'
                      }`}
                    >
                      <Heart className="w-4 h-4" fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </button>
                    <button
                      onClick={() => handleReadBlog(post)}
                      className="ml-auto flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-1 hover:bg-blue-50 dark:hover:bg-[#2F2F2F] rounded"
                    >
                      <span>Read Article</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#202020] text-[#37352F] dark:text-[#E3E3E3] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] hover:bg-gray-200 dark:hover:bg-[#3F3F3F]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* All Posts */}
        <h2 className="text-2xl font-bold text-[#37352F] dark:text-[#E3E3E3] mb-6">
          {selectedCategory === 'All' ? 'All Articles' : selectedCategory}
        </h2>
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <article
                key={post.id}
                className="bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2F2F2F] rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleReadBlog(post)}
                      className="text-lg font-bold text-[#37352F] dark:text-[#E3E3E3] mb-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors text-left"
                    >
                      {post.title}
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                        {post.authorAvatar}
                      </div>
                      <button
                        onClick={() => handleAuthorClick(post.author)}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                      >
                        {post.author}
                      </button>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        • {post.readTime} min read
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-[#2F2F2F] text-gray-600 dark:text-gray-400 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 sm:flex-col sm:items-end">
                    <button
                      onClick={() => handleLikeBlog(post.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        likedPosts.has(post.id)
                          ? 'text-red-600 dark:text-red-400'
                          : 'hover:text-red-600 dark:hover:text-red-400'
                      }`}
                    >
                      <Heart className="w-4 h-4" fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                      <span className="hidden sm:inline">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">{post.comments}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No articles found. Try adjusting your search or filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
