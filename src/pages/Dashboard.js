import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // Fetch customers
    axios.get(`${process.env.REACT_APP_API_URL}/api/customers`)
      .then(res => setCustomers(res.data))
      .catch(err => console.error(err));

    // Fetch sales
    axios.get(`${process.env.REACT_APP_API_URL}/api/sales`)
      .then(res => setSales(res.data))
      .catch(err => console.error(err));

    // Fetch inventory
    axios.get(`${process.env.REACT_APP_API_URL}/api/inventory`)
      .then(res => setInventory(res.data))
      .catch(err => console.error(err));

    // Fetch expenses
    axios.get(`${process.env.REACT_APP_API_URL}/api/expenses`)
      .then(res => setExpenses(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      <h2>Customers</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th><th>Phone</th><th>Address</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.address}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Sales</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Product</th><th>Type</th><th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s._id}>
              <td>{s.product}</td>
              <td>{s.type}</td>
              <td>{s.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Inventory</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th><th>Status</th><th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(i => (
            <tr key={i._id}>
              <td>{i.name}</td>
              <td>{i.status}</td>
              <td>{i.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Expenses</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Description</th><th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(e => (
            <tr key={e._id}>
              <td>{e.description}</td>
              <td>{e.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
