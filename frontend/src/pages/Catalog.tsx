import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { artworksService } from '../services/api';
import './Catalog.css';

export const Catalog: React.FC = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const data = await artworksService.getAll();
        // Assuming data is an array of artworks or data.data
        setArtworks(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error('Failed to fetch catalog', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  if (loading) return <div className="text-center">Loading catalog...</div>;

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h2 className="text-gradient">Art Catalog</h2>
        <p>Discover and acquire contemporary masterpieces.</p>
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
                <Button fullWidth>View Details</Button>
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
