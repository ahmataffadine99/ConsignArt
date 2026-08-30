import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { artworksService, salesService } from '../services/api';
import './Catalog.css';

export const Catalog: React.FC = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchArtworks = async () => {
    try {
      const data = await artworksService.getAll();
      setArtworks(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch catalog', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) return;
    try {
      await artworksService.delete(id);
      fetchArtworks();
    } catch (err: any) {
      alert(typeof err.message === 'string' ? err.message : JSON.stringify(err.message) || 'Failed to delete artwork');
    }
  };

  const handleBuy = async (artwork: any) => {
    if (!window.confirm(`Buy ${artwork.title} for €${artwork.price}?`)) return;
    try {
      await salesService.create({
        artworkId: artwork.id,
        buyerId: user.id,
        salePrice: parseFloat(artwork.price),
      });
      alert('Purchase successful!');
      fetchArtworks();
    } catch (err: any) {
      alert(err.message || 'Failed to complete purchase.');
    }
  };

  if (loading) return <div className="text-center">Loading catalog...</div>;

  return (
    <div className="catalog-container">
      <div className="catalog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient">Art Catalog</h2>
          <p>Discover and acquire contemporary masterpieces.</p>
        </div>
        {user && (user.role === 'artist' || user.role === 'gallery') && (
          <Link to="/artworks/new">
            <Button>+ Add Artwork</Button>
          </Link>
        )}
      </div>

      <div className="catalog-grid">
        {artworks.map((artwork: any) => (
          <Card key={artwork.id} className="artwork-card">
            <div className="artwork-image-placeholder">
               {artwork.imageUrl ? <img src={artwork.imageUrl} alt={artwork.title} /> : 'No Image'}
            </div>
            <div className="artwork-info">
              <h3>{artwork.title || 'Untitled'}</h3>
              <p className="artist-name">{artwork.artist?.firstName} {artwork.artist?.lastName}</p>
              <p className="price">€{artwork.price}</p>
              <div className="artwork-actions">
                <Link to={`/artworks/${artwork.id}`} style={{ textDecoration: 'none' }}>
                  <Button fullWidth>View Details</Button>
                </Link>
                {user && user.role === 'collector' && artwork.status === 'AVAILABLE' && (
                  <Button variant="secondary" fullWidth style={{ marginTop: '0.5rem', borderColor: '#10b981', color: '#10b981' }} onClick={() => handleBuy(artwork)}>
                    Buy Now
                  </Button>
                )}
                {user && artwork.status === 'AVAILABLE' && (user.id === artwork.artist?.userId || user.role === 'gallery') && (
                  <Link to={`/artworks/${artwork.id}/edit`} style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" fullWidth style={{ marginTop: '0.5rem', borderColor: '#3b82f6', color: '#3b82f6' }}>
                      Edit
                    </Button>
                  </Link>
                )}
                {user && (user.role === 'admin' || user.id === artwork.artist?.userId || user.role === 'gallery') && (
                  <Button variant="secondary" fullWidth style={{ marginTop: '0.5rem', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDelete(artwork.id)}>
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {artworks.length === 0 && (
          <p className="text-center" style={{ gridColumn: '1 / -1' }}>No artworks available at the moment.</p>
        )}
      </div>
    </div>
  );
};
