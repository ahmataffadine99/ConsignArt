import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { artworksService, artistsService } from '../services/api';
import './CreateArtwork.css';

export const CreateArtwork: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [artistId, setArtistId] = useState('');
  const [artists, setArtists] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (user && user.role === 'gallery') {
      artistsService.getAll().then(data => {
        const allArtists = Array.isArray(data) ? data : data.data || [];
        setArtists(allArtists);
      });
    }
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await artworksService.create({
        title,
        description,
        price: parseFloat(price),
        imageUrl: imageUrl || undefined,
        artistId: user?.role === 'gallery' ? artistId : undefined,
      });
      navigate('/catalog');
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : JSON.stringify(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-artwork-container">
      <Card className="create-artwork-card">
        <div className="create-artwork-header">
          <h2 className="text-gradient">Add New Artwork</h2>
          <p>List a new masterpiece on ConsignArt</p>
        </div>
        
        {error && <div className="error-message glass-panel">{error}</div>}

        <form onSubmit={handleCreate} className="create-artwork-form">
          <Input 
            label="Title" 
            placeholder="Mona Lisa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input 
            label="Description" 
            placeholder="A beautiful portrait..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input 
            label="Price (€)" 
            type="number"
            min="0"
            step="0.01"
            placeholder="1500.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <Input 
            label="Image URL (optional)" 
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          {user && user.role === 'gallery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Artist</label>
              <select 
                value={artistId} 
                onChange={(e) => setArtistId(e.target.value)}
                required
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'inherit' }}
              >
                <option value="" disabled>Select an artist...</option>
                {artists.map(a => (
                  <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>
                ))}
              </select>
            </div>
          )}

          <Button type="submit" fullWidth disabled={isLoading} style={{ marginTop: '1rem' }}>
            {isLoading ? 'Creating...' : 'Create Artwork'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
