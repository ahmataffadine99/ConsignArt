import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { artworksService } from '../services/api';
import './CreateArtwork.css';

export const EditArtwork: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchArtwork = async () => {
      try {
        const data = await artworksService.getById(id);
        const artwork = data.data || data;
        
        setTitle(artwork.title || '');
        setDescription(artwork.description || '');
        setPrice(artwork.price?.toString() || '');
        setImageUrl(artwork.imageUrl || '');
      } catch (err: any) {
        setError('Impossible de charger les données de l\'œuvre.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchArtwork();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setError('');
    setIsLoading(true);

    try {
      await artworksService.update(id, {
        title,
        description,
        price: parseFloat(price),
        imageUrl: imageUrl || undefined,
      });
      navigate('/catalog');
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : JSON.stringify(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="text-center">Chargement des données...</div>;

  return (
    <div className="create-artwork-container">
      <Card className="create-artwork-card">
        <div className="create-artwork-header">
          <h2 className="text-gradient">Edit Artwork</h2>
          <p>Update the details of your masterpiece</p>
        </div>
        
        {error && <div className="error-message glass-panel">{error}</div>}

        <form onSubmit={handleUpdate} className="create-artwork-form">
          <Input 
            label="Title" 
            placeholder="Mona Lisa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input 
            label="Description" 
            placeholder="A beautiful portrait..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input 
            label="Price (€)" 
            type="number"
            min="0"
            step="0.01"
            placeholder="1500.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input 
            label="Image URL (optional)" 
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <Button type="submit" fullWidth disabled={isLoading} style={{ marginTop: '1rem' }}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate(-1)} style={{ marginTop: '0.5rem' }}>
            Cancel
          </Button>
        </form>
      </Card>
    </div>
  );
};
