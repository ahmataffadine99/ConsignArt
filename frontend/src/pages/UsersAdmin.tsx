import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usersService } from '../services/api';
import './UsersAdmin.css';

export const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await usersService.getAll();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (user: any) => {
    try {
      await usersService.update(user.id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  if (loading) return <div className="text-center">Loading users...</div>;

  return (
    <div className="users-admin-container">
      <div className="users-admin-header">
        <h2 className="text-gradient">Users Management</h2>
        <p>Activate galleries or block users.</p>
      </div>

      <div className="users-grid">
        {users.map((user: any) => (
          <Card key={user.id} className="user-card">
            <div className="user-info">
              <h3>{user.email}</h3>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
            </div>
            
            <div className="user-status-section">
              <p>Status: <strong className={user.isActive ? 'status-active' : 'status-inactive'}>
                {user.isActive ? 'Active' : 'Inactive (Waiting)'}
              </strong></p>
              
              {user.role !== 'admin' && (
                <Button 
                  variant="secondary" 
                  onClick={() => toggleStatus(user)}
                  style={{ 
                    borderColor: user.isActive ? '#ef4444' : '#10b981', 
                    color: user.isActive ? '#ef4444' : '#10b981',
                    marginTop: '0.5rem'
                  }}
                  fullWidth
                >
                  {user.isActive ? 'Block Account' : 'Activate Account'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
