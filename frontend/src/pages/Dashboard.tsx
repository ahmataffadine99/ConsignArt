import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { reportsService } from '../services/api';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user) return;
        let result;
        if (user.role === 'admin') {
          result = await reportsService.getAdminReport();
        } else if (user.role === 'gallery') {
          result = await reportsService.getGalleryReport(user.id);
        } else if (user.role === 'artist') {
          result = await reportsService.getMyArtistReport();
        }
        setData(result.data || result);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (!user) return <div className="text-center">Please login to view your dashboard.</div>;
  if (loading) return <div className="text-center">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <h2 className="text-gradient">Dashboard ({user.role})</h2>
      <div className="dashboard-grid">
        {user.role === 'admin' && data && (
          <>
            <Card><h3>Active Users</h3><p className="stat-value">{data.activeUsers}</p></Card>
            <Card><h3>Total Transactions</h3><p className="stat-value">€{data.totalTransactionVolume}</p></Card>
            <Card><h3>Total Commissions</h3><p className="stat-value">€{data.totalCommissions}</p></Card>
          </>
        )}
        {user.role === 'gallery' && data && (
          <>
            <Card><h3>Total Revenue</h3><p className="stat-value">€{data.totalRevenue}</p></Card>
            <Card><h3>Rotation Rate</h3><p className="stat-value">{data.rotationRate * 100}%</p></Card>
          </>
        )}
        {user.role === 'artist' && data && (
          <>
            <Card><h3>Total Sales</h3><p className="stat-value">{data.totalSales}</p></Card>
            <Card><h3>Your Revenue</h3><p className="stat-value">€{data.totalRevenue}</p></Card>
            <Card><h3>Available Artworks</h3><p className="stat-value">{data.availableArtworks}</p></Card>
          </>
        )}
        {user.role === 'collector' && (
          <Card>
            <h3>Collector Dashboard</h3>
            <p>Welcome! Browse the catalog to find your next masterpiece.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
