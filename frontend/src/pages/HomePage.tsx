import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Page, FeedItem } from '../types';
import feedService from '../services/feedService';
import './HomePage.css';

interface HomePageProps {
  pages: Page[];
}

export function HomePage({ pages }: HomePageProps) {
  const navigate = useNavigate();
  const [recentFeed, setRecentFeed] = useState<FeedItem[]>([]);
  const [userName, setUserName] = useState<string>('there');
  const [loading, setLoading] = useState(true);

  // Get user name and recent feed items
  useEffect(() => {
    // Get user from local storage
    const userStr = localStorage.getItem('lifeflow-user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.firstName || user.name.split(' ')[0] || 'there');
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }

    // Fetch recent community posts
    const fetchFeed = async () => {
      try {
        const allPosts = await feedService.getAllPosts();
        // Take top 3 recent posts
        setRecentFeed(allPosts.slice(0, 3));
      } catch (error) {
        console.error('Failed to load feed highlights', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  // Filter recent pages (sorted by updatedAt)
  const recentPages = [...pages]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  const handlePageClick = (pageId: string) => {
    navigate(`/dashboard?pageId=${pageId}`);
  };

  const handleFeedClick = (item: FeedItem) => {
    if (item.type === 'template') {
      navigate(`/dashboard/feed/template/${item.id}`);
    } else {
      navigate(`/dashboard/feed/blog/${item.id}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="home-container">
      {/* Background Spline */}
      <div className="home-bg-spline">
        <spline-viewer url="https://prod.spline.design/9veWxzoTg30TRC-P/scene.splinecode"></spline-viewer>
      </div>

      <div className="home-content">
        <header className="home-header">
          <h1 className="home-welcome">Welcome back, {userName}</h1>
          <div className="home-date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        {/* Recent Pages Section */}
        <section className="home-section">
          <div className="home-section-title">
            <span>🕘</span> Recently Visited
          </div>
          
          {recentPages.length > 0 ? (
            <div className="home-grid">
              {recentPages.map((page) => (
                <Link 
                  key={page.id} 
                  to={`/dashboard?pageId=${page.id}`}
                  className="home-card"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="home-card-icon">{page.icon || '📄'}</div>
                  <div className="home-card-title">{page.title || 'Untitled'}</div>
                  <div className="home-card-meta">
                    Last edited {formatDate(page.updatedAt)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="home-empty-state">
              No recent pages found. Create a new page to get started!
            </div>
          )}
        </section>

        {/* Community Feed Section */}
        <section className="home-section">
          <div className="home-section-title">
            <span>🌍</span> Community Highlights
          </div>
          
          {!loading ? (
            recentFeed.length > 0 ? (
              <div className="home-grid">
                {recentFeed.map((item) => (
                  <Link 
                    key={item.id} 
                    to={item.type === 'template' ? `/dashboard/feed/template/${item.id}` : `/dashboard/feed/blog/${item.id}`}
                    className="home-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="home-card-icon">
                      {item.type === 'template' ? '📋' : '✍️'}
                    </div>
                    <div className="home-card-title">{item.title}</div>
                    
                    <div className="home-card-meta">
                      <div className="home-card-author">
                        {item.author?.avatar ? (
                          <img 
                            src={item.author.avatar.startsWith('http') ? item.author.avatar : `https://ui-avatars.com/api/?name=${item.author.name}&background=random`} 
                            alt={item.author.name}
                            className="home-card-avatar" 
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="home-card-avatar">
                             {item.author?.name?.substring(0, 2).toUpperCase() || 'AN'}
                          </div>
                        )}
                        <span>{item.author?.name || 'Anonymous'}</span>
                      </div>
                      <span style={{ marginLeft: 'auto' }}>
                        ❤️ {item.likes}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="home-empty-state">
                No community posts yet. Be the first to share!
              </div>
            )
          ) : (
            <div className="home-empty-state">Loading community feed...</div>
          )}
        </section>
      </div>
    </div>
  );
}
