import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Catalog } from './pages/Catalog';
import { CreateArtwork } from './pages/CreateArtwork';
import { Exhibitions } from './pages/Exhibitions';

function App() {
  return (
    <>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to ConsignArt</h1>
              <p style={{ color: 'var(--color-secondary)', fontSize: '1.2rem' }}>
                The premium B2B platform for contemporary art galleries.
              </p>
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/artworks/new" element={<CreateArtwork />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
