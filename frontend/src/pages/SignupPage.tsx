import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import authService from "../services/authService";
import "./AuthLayout.css";

// Declare custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url: string }, HTMLElement>;
    }
  }
}

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.41/build/spline-viewer.js';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(email, password, name);
      if (response.token) {
        authService.setToken(response.token);
        // Store user data for other components
        localStorage.setItem('lifeflow-user', JSON.stringify({
          id: response.userId,
          email: response.email,
          name: response.name,
          firstName: response.name?.split(' ')[0] || response.name,
          role: response.role
        }));
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = () => {
    toast.info('Social signup coming soon!');
  };

  return (

    <div className="auth-container">
      {/* Left Side - Form */}
      <div className="auth-left">
        <div className="auth-card">
          <Link to="/" className="auth-logo">
            <img src="/logo.svg" alt="LifeFlow Logo" className="auth-logo-icon" />
            LifeFlow
          </Link>

          <div className="auth-header">
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Join thousands of users building better habits.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="auth-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="auth-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="name@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="auth-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div>
              <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or sign up with</span>
          </div>

          <div className="space-y-3">
            <button type="button" onClick={handleSocialLogin} className="auth-btn-social">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/auth/login" className="auth-link">
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Spline Mascot */}
      <div className="auth-right">
        <spline-viewer url="https://prod.spline.design/ykFpBzHJheQSGypM/scene.splinecode"></spline-viewer>
      </div>
    </div>
  );
}