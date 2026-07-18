import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Login } from './pages/Login';

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
          <Route path="/dashboard" element={<div>Dashboard (Coming soon)</div>} />
          <Route path="/catalog" element={<div>Catalog (Coming soon)</div>} />
        </Routes>
      </div>
    </>
  );
}

export default App;
