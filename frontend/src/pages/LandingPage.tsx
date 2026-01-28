import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// Declare custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url: string }, HTMLElement>;
    }
  }
}

export function LandingPage() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.41/build/spline-viewer.js';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  const handleLogin = () => {
    navigate('/auth/login');
  };

  return (
    <div className="landing-wrap">
      <header className="landing-nav">
        <a className="landing-brand" href="#top" aria-label="LifeFlow Home">
          <img src="/logo.svg" alt="LifeFlow Logo" className="landing-logo" />
          <div>LifeFlow</div>
        </a>

        <nav className="landing-navlinks" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#stack">Tech</a>
          <a href="#architecture">Architecture</a>
          <a href="#roadmap">Roadmap</a>
        </nav>

        <div className="landing-navActions">
          <button className="landing-btn" onClick={handleLogin}>
            🔐 Login
          </button>
          <button className="landing-btn landing-primary" onClick={handleGetStarted}>
            🚀 Get started free
          </button>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="landing-hero" aria-label="Hero">
          <div>
            <div className="landing-kicker">
              <span className="landing-kdot" /> ✨ Your productivity + journaling hub
            </div>

            <h1>
              One workspace for your life 🧠📓{" "}
              <span className="landing-gradient-text">
                built to keep you consistent.
              </span>
            </h1>

            <p className="landing-sub">
              <b>LifeFlow</b> combines a Notion-style workspace 🧱, a social progress feed 👥,
              and an AI assistant 🤖 — so planning your day feels simple, not stressful.
            </p>

            <div className="landing-heroActions" id="demo">
              <button className="landing-btn landing-primary" onClick={handleGetStarted}>
                ✨ Get started free
              </button>
              <a className="landing-btn" href="#features">
                🔍 Explore features
              </a>
              <a className="landing-btn" href="#stack">
                ⚙️ Tech stack
              </a>
            </div>

            <div className="landing-logos" aria-label="Trusted by section">
              <div className="landing-logosTop">
                <span>Built for students, teams, and makers 🛠️</span>
                <span style={{ fontWeight: 900 }}>React ⚛️ • Spring Boot 🌱 • TypeScript 📘</span>
              </div>
              <div className="landing-logoRow" aria-hidden="true">
                <div className="landing-logoChip">Notion-like</div>
                <div className="landing-logoChip">Social Feed</div>
                <div className="landing-logoChip">AI Chat</div>
                <div className="landing-logoChip">REST API</div>
                <div className="landing-logoChip">Real-time</div>
                <div className="landing-logoChip">Modern UI</div>
              </div>
            </div>
          </div>

          {/* Preview card */}
          {/* Spline 3D Scene */}
          <aside className="landing-preview" aria-label="3D Interactive Scene" style={{ background: 'transparent', border: 'none', boxShadow: 'none', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <spline-viewer url="https://prod.spline.design/jEPPxip9dwfBLhD9/scene.splinecode"></spline-viewer>
          </aside>
        </section>

        {/* FEATURES */}
        <section id="features" aria-label="Features">
          <div className="landing-sectionHead">
            <div>
              <h2>Everything you need, in one flow ✨</h2>
              <p className="landing-desc">
                A clean workspace for notes + tasks, motivation via a social feed, and an assistant
                that helps you move faster.
              </p>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1606166325683-e6deb697d301?auto=format&fit=crop&w=1400&q=80"
            alt="Productivity illustration"
            className="landing-feature-img"
            loading="lazy"
          />

          <div className="landing-bento">
            <div className="landing-card">
              <h3 className="landing-cardTitle">🧱 Personal Workspace</h3>
              <p className="landing-cardP">
                Create pages, notes, and checklists—organized with search and tags.
              </p>
              <ul className="landing-bullets">
                <li>✍️ Notes & pages</li>
                <li>☑️ Checklist blocks</li>
                <li>🔎 Search + tags</li>
              </ul>

              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                <div className="landing-mini">📌 Today's tasks</div>
                <div className="landing-mini">✍️ Daily journal</div>
                <div className="landing-mini">🔥 Habit streak</div>
                <div className="landing-mini">🎯 Weekly goals</div>
              </div>
            </div>

            <div className="landing-bentoRight">
              <div className="landing-card landing-small">
                <h3 className="landing-cardTitle">👥 Social Progress Feed</h3>
                <p className="landing-cardP">Daily updates with likes/comments to keep momentum.</p>
                <ul className="landing-bullets">
                  <li>⚡ Real-time updates</li>
                  <li>💬 Likes & comments</li>
                  <li>🏆 Celebrate wins</li>
                </ul>
              </div>

              <div className="landing-card landing-small">
                <h3 className="landing-cardTitle">🤖 AI Chatbot Assistant</h3>
                <p className="landing-cardP">Turns ideas into action: tasks, routines, reminders.</p>
                <ul className="landing-bullets">
                  <li>📝 To-do creation</li>
                  <li>🧘 Routine suggestions</li>
                  <li>⏰ Reminder support</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="landing-bento">
            <div className="landing-card landing-small">
              <h3 className="landing-cardTitle">⏱️ Task & Routine Manager</h3>
              <p className="landing-cardP">Priorities, deadlines, and progress tracking—built-in.</p>
              <ul className="landing-bullets">
                <li>⭐ Priority tasks</li>
                <li>📅 Deadlines</li>
                <li>📈 Progress tracking</li>
              </ul>
            </div>

            <div className="landing-card">
              <h3 className="landing-cardTitle">🖥️ Modern React UI</h3>
              <p className="landing-cardP">
                Beautiful desktop experience with sidebar navigation, dashboard, feed view, and chatbot
                widget.
              </p>
              <div className="landing-chips">
                <span className="landing-chip">🧭 Sidebar navigation</span>
                <span className="landing-chip">📊 Dashboard</span>
                <span className="landing-chip">📰 Feed view</span>
                <span className="landing-chip">💬 Chat widget</span>
              </div>
            </div>
          </div>
        </section>

        {/* STACK */}
        <section id="stack" aria-label="Tech stack">
          <div className="landing-sectionHead">
            <div>
              <h2>Built with a real client–server architecture 🧩</h2>
              <p className="landing-desc">
                A modern stack: React + TypeScript frontend, Spring Boot backend, REST APIs, and
                persistence.
              </p>
            </div>
          </div>

          <div className="landing-bento">
            <div className="landing-card">
              <h3 className="landing-cardTitle">⚛️ Frontend</h3>
              <p className="landing-cardP">
                React + TypeScript with modern hooks, routing, and state management for smooth
                interactions.
              </p>
              <div className="landing-chips">
                <span className="landing-chip">⚛️ React 18</span>
                <span className="landing-chip">📘 TypeScript</span>
                <span className="landing-chip">🎨 Tailwind CSS</span>
                <span className="landing-chip">🚀 Vite</span>
                <span className="landing-chip">🎭 Framer Motion</span>
              </div>
            </div>
            <div className="landing-card landing-small">
              <h3 className="landing-cardTitle">🌱 Backend</h3>
              <p className="landing-cardP">
                Spring Boot REST APIs with JWT authentication and real-time features.
              </p>
              <div className="landing-chips">
                <span className="landing-chip">🌱 Spring Boot</span>
                <span className="landing-chip">🔌 REST API</span>
                <span className="landing-chip">🔐 JWT Auth</span>
                <span className="landing-chip">🧱 PostgreSQL</span>
              </div>
            </div>
          </div>
        </section>

        {/* ARCHITECTURE */}
        <section id="architecture" aria-label="Architecture">
          <div className="landing-sectionHead">
            <div>
              <h2>How it works 🔁</h2>
              <p className="landing-desc">
                React frontend calls REST endpoints for data, with JWT authentication and real-time
                updates.
              </p>
            </div>
          </div>

          <div className="landing-card" style={{ padding: 18 }}>
            <div className="landing-arch-grid">
              <div className="landing-box">
                <div className="landing-boxTitle">⚛️ React Frontend</div>
                <div className="landing-boxText">Workspace UI, feed view, and chat interface.</div>
              </div>
              <div className="landing-box">
                <div className="landing-boxTitle">🌱 Spring Boot Server</div>
                <div className="landing-boxText">Controllers + services + authentication.</div>
              </div>
              <div className="landing-box">
                <div className="landing-boxTitle">🧱 Database</div>
                <div className="landing-boxText">Persist users, pages, tasks, and feed posts.</div>
              </div>
            </div>

            <div className="landing-arch-footer">
              🔌 REST API ⇄ 🧱 Database &nbsp;&nbsp;•&nbsp;&nbsp; 🔐 JWT Authentication → 🔒 Secure
            </div>
          </div>
        </section>

        {/* ROADMAP */}
        <section id="roadmap" aria-label="Roadmap">
          <div className="landing-sectionHead">
            <div>
              <h2>What's next 🚀</h2>
              <p className="landing-desc">Continuous improvements to make your experience better.</p>
            </div>
          </div>

          <div className="landing-bento">
            <div className="landing-card landing-small">
              <h3 className="landing-cardTitle">🎨 Experience</h3>
              <ul className="landing-bullets">
                <li>🌗 Light/Dark mode toggle</li>
                <li>🎙️ Voice commands</li>
              </ul>
            </div>
            <div className="landing-card">
              <h3 className="landing-cardTitle">📤 Productivity</h3>
              <ul className="landing-bullets">
                <li>📄 PDF export</li>
                <li>☁️ Cloud sync</li>
                <li>🧩 Better onboarding templates</li>
              </ul>
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="landing-quote" aria-label="Testimonial">
            <p>
              "LifeFlow keeps planning, journaling, and motivation together — it's the first time
              my daily routine feels simple."
            </p>
            <div className="landing-by">— Early adopter</div>
          </div>
        </section>

        {/* CONTACT / FOOTER */}
        <section id="contact" aria-label="Footer CTA">
          <div className="landing-final">
            <div>
              <h3>Ready to start your productivity journey? ✅</h3>
              <p>
                Join thousands of users who are building better habits and achieving their goals with
                LifeFlow.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="landing-btn landing-primary" onClick={handleGetStarted}>
                🚀 Get started now
              </button>
              <a className="landing-btn" href="#top">
                ⬆️ Back to top
              </a>
            </div>
          </div>

          <div className="landing-footer">
            <div>
              © {year} LifeFlow ✨ Built with React ⚛️ + Spring Boot 🌱
            </div>
            <div>
              Made with ❤️ for productivity enthusiasts
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
