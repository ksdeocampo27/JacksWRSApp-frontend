import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';

import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import InventoryDetails from './pages/InventoryDetails';
import CustomerProfile from './pages/CustomerProfile';

function App() {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '200px', background: '#f0f0f0', padding: '20px', minHeight: '100vh' }}>
        <h3>JacksWRS App</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/customers">Customers</Link></li>
          <li><Link to="/sales">Sales</Link></li>
          <li><Link to="/inventory">Inventory</Link></li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:id" element={<InventoryDetails />} />
          <Route path="/customers/:id/profile" element={<CustomerProfile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
