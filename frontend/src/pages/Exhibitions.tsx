import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { exhibitionsService, artworksService } from '../services/api';
import './Exhibitions.css';

export const Exhibitions: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For creation form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [availableArtworks, setAvailableArtworks] = useState<any[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);

  // For loan creation form
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanArtworkId, setLoanArtworkId] = useState('');
  const [toGalleryId, setToGalleryId] = useState('');
  const [loanStartDate, setLoanStartDate] = useState('');
  const [loanEndDate, setLoanEndDate] = useState('');
  const [conditions, setConditions] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchExhibitions = async () => {
    try {
      const data = await exhibitionsService.getAll();
      setExhibitions(Array.isArray(data) ? data : data.data || []);
      const loansData = await exhibitionsService.getAllLoans();
      setLoans(Array.isArray(loansData) ? loansData : loansData.data || []);
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
  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await exhibitionsService.createLoan({
        artworkId: loanArtworkId,
        toGalleryId,
        startDate: loanStartDate,
        endDate: loanEndDate,
        conditions
      });
      setShowLoanForm(false);
      setLoanArtworkId(''); setToGalleryId(''); setLoanStartDate(''); setLoanEndDate(''); setConditions('');
      fetchExhibitions();
    } catch (err: any) {
      alert(err.message || 'Failed to create loan.');
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button onClick={() => { setShowForm(!showForm); setShowLoanForm(false); }}>
              {showForm ? 'Cancel' : '+ New Exhibition'}
            </Button>
            <Button variant="outline" onClick={() => { setShowLoanForm(!showLoanForm); setShowForm(false); }}>
              {showLoanForm ? 'Cancel' : '+ New Loan'}
            </Button>
          </div>
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

      <div className="exhibitions-header" style={{ marginTop: '2rem' }}>
        <h2 className="text-gradient">Loans (Prêts Inter-Galeries)</h2>
      </div>

      {showLoanForm && (
        <Card className="exhibition-form-card">
          <h3>Create Loan</h3>
          <form onSubmit={handleCreateLoan}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Artwork to Lend</label>
                <select 
                  className="input-field" 
                  value={loanArtworkId} 
                  onChange={e => setLoanArtworkId(e.target.value)} 
                  required
                >
                  <option value="">Select an available artwork...</option>
                  {availableArtworks.map(art => (
                    <option key={art.id} value={art.id}>{art.title} (€{art.price})</option>
                  ))}
                </select>
              </div>
              <Input label="To Gallery (ID)" value={toGalleryId} onChange={e => setToGalleryId(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Input label="Start Date" type="date" value={loanStartDate} onChange={e => setLoanStartDate(e.target.value)} required />
              <Input label="End Date" type="date" value={loanEndDate} onChange={e => setLoanEndDate(e.target.value)} required />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label className="input-label">Conditions</label>
              <textarea 
                className="input-field" 
                value={conditions} 
                onChange={e => setConditions(e.target.value)} 
                rows={3} 
                style={{ width: '100%' }}
              />
            </div>
            <Button type="submit" fullWidth style={{ marginTop: '1rem' }}>Lend Artwork</Button>
          </form>
        </Card>
      )}

      <div className="exhibitions-list">
        {loans.map((loan: any) => (
          <Card key={loan.id} className="exhibition-card">
            <h3>Loan: {loan.artwork?.title || 'Unknown Artwork'}</h3>
            <p className="exhibition-dates">{new Date(loan.startDate).toLocaleDateString()} - {new Date(loan.endDate).toLocaleDateString()}</p>
            <p className="exhibition-location">Status: {loan.status}</p>
            <p className="exhibition-gallery">From: {loan.fromGallery?.email || loan.fromGalleryId}</p>
            <p className="exhibition-gallery">To: {loan.toGallery?.email || loan.toGalleryId}</p>
            {loan.conditions && <p><strong>Conditions:</strong> {loan.conditions}</p>}
          </Card>
        ))}
        {loans.length === 0 && <p>No active loans.</p>}
      </div>
    </div>
  );
};
