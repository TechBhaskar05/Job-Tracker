import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuth, getToken } from '../lib/auth';
import { showToast } from '../lib/toast';
import api from '../lib/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
    <>
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10%, -10%); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15%, 15%); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(5%, 5%); }
        }
      `}</style>
      <div className="grid grid-cols-1 md:grid-cols-[40%_60%] min-h-screen">
        <div className="hidden md:flex relative overflow-hidden bg-gradient-to-br from-[#05050E] via-[#0E0830] to-[#05050E] items-center justify-center p-6">
          <div className="absolute rounded-full blur-[100px] opacity-35" style={{ width: '400px', height: '400px', background: '#7C6FFF', top: '-5%', right: '-5%', animation: 'float1 12s ease-in-out infinite' }} />
          <div className="absolute rounded-full blur-[100px] opacity-35" style={{ width: '300px', height: '300px', background: '#A78BFA', bottom: '-5%', left: '-5%', animation: 'float2 8s ease-in-out infinite alternate' }} />
          <div className="absolute rounded-full blur-[100px] opacity-35" style={{ width: '250px', height: '250px', background: '#6366F1', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'float3 15s ease-in-out infinite' }} />
          <div className="relative z-1 text-center">
            <div className="w-12 h-12 bg-accent-tint border border-border text-accent text-2xl font-bold rounded-lg inline-flex items-center justify-center">JT</div>
            <h1 className="text-3xl font-bold text-text-100 mt-3">JobTrackr</h1>
            <p className="text-text-300 text-base">Track smarter. Land faster.</p>
            <ul className="list-none mt-8 text-left inline-block">
              <li className="text-text-200 mb-2 before:content-['✓'] before:text-success before:mr-2">AI Resume Tailoring</li>
              <li className="text-text-200 mb-2 before:content-['✓'] before:text-success before:mr-2">Mock Interview Coach</li>
              <li className="text-text-200 mb-2 before:content-['✓'] before:text-success before:mr-2">Career Roadmap Generator</li>
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-center p-6">
          <div className="bg-bg-800 border border-border-bright rounded-xl p-10 w-full max-w-[420px]">
            <h2 className="text-3xl font-bold text-text-100 text-center">Create account</h2>
            <p className="text-text-300 text-sm mb-6 text-center">Start tracking your job search</p>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {error && <div className="bg-danger-tint border border-danger text-danger rounded-sm p-3 text-sm mb-1">{error}</div>}
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
            <p className="text-center mt-4 text-sm text-text-200">
              Already have an account? <Link to="/login" className="text-accent font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
