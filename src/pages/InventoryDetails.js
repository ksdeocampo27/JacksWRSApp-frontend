import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';


function InventoryDetails() {
  const { id } = useParams();
  const [inventory, setInventory] = useState(null);
  const [sales, setSales] = useState([]);

useEffect(() => {
  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/inventory/${id}`);
      setInventory(res.data);

      const salesRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/sales/byContainer/${id}`);
      setSales(salesRes.data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchInventory();
}, [id]);



  if (!inventory) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Inventory Details</h2>
      <Link to="/inventory"><Button variant="secondary">Back to Inventory</Button></Link>

      <div className="mt-3">
        <p>
        <span style={{ fontSize: '1rem', fontWeight: 'bold', marginRight: '0.5rem' }}>Name:</span>
        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{inventory.name}</span>
        </p>
        <p><strong>ID:</strong> {inventory.id}</p>
        <p><strong>Status:</strong> {inventory.status}</p>
        <p><strong>Date of Purchase:</strong> {inventory.dateOfPurchase ? new Date(inventory.dateOfPurchase).toLocaleDateString() : '-'}</p>
        <p><strong>Remarks:</strong> {inventory.remarks}</p>
      </div>

      <h4 className="mt-4">Sales Records for {inventory.name}</h4>
<Table striped bordered hover responsive>
  <thead>
    <tr>
      <th>Date</th>
      <th>Customer</th>
      <th>Type</th>
      <th>Item</th>
      <th>Qty</th>
      <th>Price/Unit</th>
      <th>Total</th>
      <th>Payment</th>
      <th>Status</th>
      <th>Containers</th>
      <th>Remarks</th>
    </tr>
  </thead>
  <tbody>
    {sales.length > 0 ? (
      sales
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(s => (
        <tr key={s._id}>
          <td>{new Date(s.date).toLocaleDateString()}</td>
          <td>{s.customerId?.name || s.customerName || '-'}</td>
          <td>{s.type}</td>
          <td>{s.item}</td>
          <td>{s.quantity}</td>
          <td>₱{s.pricePerUnit?.toFixed(2) || '-'}</td>
          <td>₱{s.totalAmount?.toFixed(2) || '-'}</td>
          <td>{s.paymentMethod}</td>
          <td>{s.status}</td>
          <td>
            {s.containerIds && s.containerIds.length > 0
              ? s.containerIds.map(c => c.name || c.id || c._id).join(', ')
              : '-'}
          </td>
          <td>{s.remarks}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="11" className="text-center">No sales records found for this container.</td>
      </tr>
    )}
  </tbody>
</Table>

    </div>
  );
}

export default InventoryDetails;
