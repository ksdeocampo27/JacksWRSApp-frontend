import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form } from 'react-bootstrap'; // Make sure react-bootstrap is installed
import moment from 'moment'; // Install this if not yet: npm install moment

function Summary() {
  const [sales, setSales] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/sales`);
      setSales(res.data);

      const months = [...new Set(res.data.map(s => s.date.slice(0, 7)))]; // e.g., '2025-07'
      const sorted = months.sort((a, b) => b.localeCompare(a)); // newest first

        setAvailableMonths(sorted);
        setSelectedMonth(sorted[0] || '');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales()
  }, []);

  const filteredSales = sales.filter(s => s.date.startsWith(selectedMonth));

  // Helpers to compute summary
  const getTotalSales = () => {
    return filteredSales.reduce((sum, s) => {
      const totalAmount = parseFloat(s.totalAmount);
      return sum + (isNaN(totalAmount) ? 0 : totalAmount);
    }, 0);
  };

  const getTotalRefilled = () => {
    return filteredSales
      .filter(s =>
        s.item === 'Refill (Slim 5gal)' || s.item === 'Refill (Round 5gal)'
      )
      .reduce((sum, s) => sum + parseInt(s.quantity), 0);
  };

  const getItemBreakdown = () => {
    const breakdown = {};
    filteredSales.forEach(s => {
      if (!breakdown[s.item]) {
        breakdown[s.item] = {
          quantity: 0,
          totalAmount: 0,
        };
      }
      breakdown[s.item].quantity += parseInt(s.quantity);
      breakdown[s.item].totalAmount += parseFloat(s.totalAmount);
    });
    return breakdown;
  };

  const breakdown = getItemBreakdown();




  return (
    <div className="p-4">
      <h1 className = "mb-3">Summary</h1>

      <Form.Group controlId="monthSelect" className="mb-4" style={{ maxWidth: '300px' }}>
        <Form.Label>Select Month</Form.Label>
        <Form.Select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {moment(month, 'YYYY-MM').format('MMMM YYYY')}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

    {/* Summary Results */}
    <div className="border rounded p-4 shadow-sm bg-light">
      <h4>Total Sales: <span className="text-success">₱{getTotalSales().toFixed(2)}</span></h4>
      <h5 className="mt-3">Total Refilled Containers: <strong>{getTotalRefilled()}</strong></h5>

      <h5 className="mt-4">Item Sales Breakdown:</h5>
      <table className="table table-sm table-bordered mt-2">
        <thead className="table-secondary">
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price per Unit</th>
            <th>Total Amount(₱)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(breakdown).map(([item, data]) => (
            <tr key={item}>
              <td>{item}</td>
              <td>{data.quantity}</td>
              <td className="text-muted">₱{(data.totalAmount / data.quantity).toFixed(2)}</td>
              <td>₱{data.totalAmount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    </div>
  );
}

export default Summary;