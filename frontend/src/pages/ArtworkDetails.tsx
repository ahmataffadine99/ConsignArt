import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { artworksService } from '../services/api';
import './ArtworkDetails.css';

export const ArtworkDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const data = await artworksService.getById(id);
        setArtwork(data.data || data);

        // Fetch history if user is allowed (admin, gallery, or owner)
        if (user && ['admin', 'gallery', 'artist'].includes(user.role)) {
          const histData = await artworksService.getHistory(id);
          setHistory(Array.isArray(histData) ? histData : histData.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user]);

  if (loading) return <div className="text-center">Loading details...</div>;
  if (!artwork) return <div className="text-center">Artwork not found.</div>;

  return (
    <div className="details-container">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          &larr; Back to Catalog
        </Button>
        {user && artwork.status === 'AVAILABLE' && (user.id === artwork.artist?.userId || user.role === 'gallery') && (
          <Button variant="secondary" onClick={() => navigate(`/artworks/${artwork.id}/edit`)} style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>
            Edit Artwork
          </Button>
        )}
      </div>

      <div className="details-layout">
        <Card className="details-image-card">
          <div className="details-image">
            {artwork.imageUrl ? (
              <img src={artwork.imageUrl} alt={artwork.title} />
            ) : (
              <div className="no-image-large">No Image Provided</div>
            )}
          </div>
        </Card>

        <div className="details-info-section">
          <Card className="details-main-info">
            <h2 className="text-gradient">{artwork.title}</h2>
            <p className="details-artist">
              Artist: <strong>{artwork.artist?.firstName} {artwork.artist?.lastName}</strong>
            </p>
            <p className="details-price">€{artwork.price}</p>
            
            <div className="details-metadata">
              {artwork.year && <p><span>Year:</span> {artwork.year}</p>}
              {artwork.technique && <p><span>Technique:</span> {artwork.technique}</p>}
              <p><span>Status:</span> <span className={`status-badge status-${artwork.status.toLowerCase()}`}>{artwork.status}</span></p>
              {artwork.gallery && <p><span>Consigned at:</span> {artwork.gallery.email || artwork.gallery.id}</p>}
            </div>

            <div className="details-description">
              <h3>Description</h3>
              <p>{artwork.description}</p>
            </div>
          </Card>

          {history.length > 0 && (
            <Card className="details-history">
              <h3>Consignment History (Status)</h3>
              <ul className="history-list">
                {history.map((h: any) => (
                  <li key={h.id} className="history-item">
                    <div className="history-bullet"></div>
                    <div className="history-content">
                      <span className="history-status">{h.status}</span>
                      <span className="history-date">{new Date(h.changedAt).toLocaleString()}</span>
                      {h.notes && <p className="history-notes">{h.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
