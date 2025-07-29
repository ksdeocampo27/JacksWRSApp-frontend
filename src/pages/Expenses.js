import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Expenses() {
 
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/expenses`);
      //setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  // ================================
  // RENDER JSX
  // ================================
  return (
    <div style={{ padding: '20px' }}>
        <h2>Expenses</h2>


    </div>
  );
}

export default Expenses;
