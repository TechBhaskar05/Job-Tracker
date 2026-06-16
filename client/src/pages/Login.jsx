import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuth, getToken } from '../lib/auth';
import { showToast } from '../lib/toast';
import api from '../lib/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './Auth.module.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (getToken()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.token, data.user);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>
        <div className={styles.leftContent}>
          <div className={styles.logo}>JT</div>
          <h1 className={styles.appName}>JobTrackr</h1>
          <p className={styles.tagline}>Track smarter. Land faster.</p>
          <ul className={styles.featureList}>
            <li>✓ AI Resume Tailoring</li>
            <li>✓ Mock Interview Coach</li>
            <li>✓ Career Roadmap Generator</li>
          </ul>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.authCard}>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Sign in to your account</p>
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              rightIcon={(iconProps) => (
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`${styles.eyeButton} ${iconProps.className || ''}`}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              )}
            />
            <Button type="submit" variant="primary" fullWidth loading={loading} disabled={loading}>
              Sign In
            </Button>
          </form>
          <p className={styles.switchAuth}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
