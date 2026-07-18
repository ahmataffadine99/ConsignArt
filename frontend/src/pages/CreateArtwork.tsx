import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { artworksService } from '../services/api';
import './CreateArtwork.css';

export const CreateArtwork: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      });
      navigate('/catalog');
    } catch (err: any) {
      setError(err.message || 'Failed to create artwork.');
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

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Artwork'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
