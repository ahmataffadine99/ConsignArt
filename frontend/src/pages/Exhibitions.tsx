import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { exhibitionsService, artworksService } from '../services/api';
import './Exhibitions.css';

export const Exhibitions: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For creation form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [availableArtworks, setAvailableArtworks] = useState<any[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchExhibitions = async () => {
    try {
      const data = await exhibitionsService.getAll();
      setExhibitions(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
    if (user && user.role === 'gallery') {
      artworksService.getAll().then(data => {
        const arts = Array.isArray(data) ? data : data.data || [];
        // Only show AVAILABLE artworks to add to exhibition
        setAvailableArtworks(arts.filter((a: any) => a.status === 'AVAILABLE'));
      });
    }
  }, [user]);

  const toggleArtwork = (id: string) => {
    setSelectedArtworks(prev => 
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedArtworks.length === 0) {
      alert('Please select at least one artwork.');
      return;
    }
    try {
      await exhibitionsService.create({
        name,
        startDate,
        endDate,
        location,
        artworkIds: selectedArtworks
      });
      setShowForm(false);
      setName(''); setStartDate(''); setEndDate(''); setLocation(''); setSelectedArtworks([]);
      fetchExhibitions();
    } catch (err: any) {
      alert(err.message || 'Failed to create exhibition.');
    }
  };

  if (loading) return <div className="text-center">Loading exhibitions...</div>;

  return (
    <div className="exhibitions-container">
      <div className="exhibitions-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient">Exhibitions</h2>
          <p>Upcoming and ongoing art shows.</p>
        </div>
        {user && user.role === 'gallery' && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Exhibition'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="exhibition-form-card">
          <h3>Create Exhibition</h3>
          <form onSubmit={handleCreate}>
            <Input label="Exhibition Name" value={name} onChange={e => setName(e.target.value)} required />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
            <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} />
            
            <div className="artwork-selection">
              <h4>Select Artworks ({selectedArtworks.length} selected)</h4>
              <div className="artwork-checkboxes">
                {availableArtworks.map(art => (
                  <label key={art.id} className="artwork-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedArtworks.includes(art.id)} 
                      onChange={() => toggleArtwork(art.id)} 
                    />
                    {art.title} (€{art.price})
                  </label>
                ))}
                {availableArtworks.length === 0 && <p>No available artworks found.</p>}
              </div>
            </div>
            
            <Button type="submit" fullWidth style={{ marginTop: '1rem' }}>Create</Button>
          </form>
        </Card>
      )}

      <div className="exhibitions-list">
        {exhibitions.map((exh: any) => (
          <Card key={exh.id} className="exhibition-card">
            <h3>{exh.name}</h3>
            <p className="exhibition-dates">{new Date(exh.startDate).toLocaleDateString()} - {new Date(exh.endDate).toLocaleDateString()}</p>
            {exh.location && <p className="exhibition-location">📍 {exh.location}</p>}
            <p className="exhibition-gallery">Gallery: {exh.gallery?.email || exh.gallery?.id}</p>
            <div className="exhibition-artworks">
              <strong>Artworks included:</strong>
              <ul>
                {exh.artworks?.map((art: any) => (
                  <li key={art.id}>{art.title}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
        {exhibitions.length === 0 && <p>No exhibitions currently.</p>}
      </div>
    </div>
  );
};
