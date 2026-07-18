import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/api';
import './Signup.css';

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('collector');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.register({ email, password, role });
      // Après inscription, on se connecte automatiquement ou on redirige
      await authService.login(email, password);
      navigate('/dashboard');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Card className="signup-card">
        <div className="signup-header">
          <h2 className="text-gradient">Create Account</h2>
          <p>Join the ConsignArt platform</p>
        </div>
        
        {error && <div className="signup-error glass-panel">{error}</div>}

        <form onSubmit={handleSignup} className="signup-form">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="input-wrapper">
            <label className="input-label">I am a...</label>
            <select 
              className="input-field glass-panel select-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="collector">Collector</option>
              <option value="artist">Artist</option>
              <option value="gallery">Gallery</option>
            </select>
          </div>

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="signup-footer">
          <p>Already have an account? <Link to="/login" className="text-gradient" style={{ fontWeight: 'bold' }}>Sign In</Link></p>
        </div>
      </Card>
    </div>
  );
};
