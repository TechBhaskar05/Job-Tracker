import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuth, getToken } from '../lib/auth';
import { showToast } from '../lib/toast';
import api from '../lib/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './Auth.module.css';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setAuth(data.token, data.user);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed. Please try again.';
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
          <h2 className={styles.title}>Create account</h2>
          <p className={styles.subtitle}>Start tracking your job search</p>
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth loading={loading} disabled={loading}>
              Create Account
            </Button>
          </form>
          <p className={styles.switchAuth}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
