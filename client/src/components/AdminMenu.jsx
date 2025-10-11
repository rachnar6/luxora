// src/components/AdminMenu.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminMenu = () => {
  return (
    <div className="admin-dropdown">
      <div className="dropdown-trigger">
        Admin <span style={{ fontSize: '0.8em' }}>▼</span>
      </div>
      <div className="dropdown-content">
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/sellers">Sellers</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders">Orders</Link>
      </div>
    </div>
  );
};

export default AdminMenu;