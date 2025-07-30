import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Select from 'react-select';
import ColoredSelect from '../components/ColoredSelect';
import { expenseTypesOptions } from '../constants/ExpenseTypesOptions';

function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);  

    const [currentExpense, setCurrentExpense] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category:'Operating Cost',
        type: '',
        store: '',
        quantity: '',
        unit: '',
        totalAmount: '',
        remarks: ''
    });
    
    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/expenses`);
          setExpenses(res.data);
        } catch (err) {
          console.error(err);
        }
    };

  // ================================
  //            HANDLERS
  // ================================

    // ADD or UPDATE Expenses
const handleSave = async () => {
    try {
        console.log("Saving Expense:", currentExpense); // 👈 Add this
        if (currentExpense._id) {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/expenses/${currentExpense._id}`, currentExpense);
        } else {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/expenses`, currentExpense);
        }
        setShowModal(false);
        fetchExpenses();
    } catch (err) {
        console.error("Error saving expense:", err.response?.data || err.message); // 👈 Also log the error clearly
    }
};

    // Handle Show Add Modal
      const handleShowAddModal = () => {
        setIsEditing(false);
        setCurrentExpense({
            date: new Date().toISOString().split('T')[0],
            description: '',
            category: 'Operating Cost',
            type: '',
            store: '',
            quantity: 1,
            totalAmount: 0,
            remarks: ''
        });
        setShowModal(true);
  };

  // ================================
  // RENDER JSX
  // ================================
  return (
    <div style={{ padding: '20px' }}>        
        <h2>Expenses</h2>

 {/* ////////////////////////////// */}
 {/* /////      Buttons       ///// */}
 {/* ////////////////////////////// */}

        {/* Button - Add Inventory Button*/}
        <Button variant="primary" onClick={handleShowAddModal}>Add Expense</Button>

        {/* Button - Add Multiple Inventory Button */}
        <Button 
            variant="secondary" 
            className="ms-2"
            onClick={() => {
                //setShowMultiAddModal(true)
            }} 
        > Add Multiple Expenses </Button>
            

        {/* Button - Edit Mode Button*/}
        <Button
          variant={editMode ? "danger" : "warning"}
          className="ms-2"
          onClick={() => {
              //setEditMode(!editMode);
              //setSelectedIds([]);
              //setCheckAll(false);
          }}
        > {editMode ? "Exit Edit Mode" : "Edit Mode"} </Button>

        {/* Multiple Delete Interface and Buttons*/}
        {editMode && (
            <>
                <Button
                    variant="secondary"
                    className="ms-2"
                    disabled={selectedIds.length === 0 || deleting}
                    onClick={() => setShowDeleteSelectedModal(true)}
                > {deleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`} </Button>

                {deleting && (
                    <div className="mt-3" style={{ width: '300px' }}>
                        <div className="progress">
                            <div
                                className="progress-bar bg-danger"
                                role="progressbar"
                                style={{ width: `${deleteProgress}%` }}
                                aria-valuenow={deleteProgress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            > {deleteProgress}% 
                            </div>
                        </div>
                        <div className="text-center mt-2">Deleting... Please wait.</div>
                    </div>
                )}

                {deleteSuccess && (
                    <Alert variant="success" className="mt-3">
                        Selected expense records deleted successfully!
                    </Alert>
                )}
            </>
        )}


        {/* ////////////////////////////// */}
        {/* /////       TABLE        ///// */}
        {/* ////////////////////////////// */}
        <table className="table table-hover mt-3">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Store</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Unit Price</th>
                    <th>Total Amount</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                { expenses
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(e => {
                        return (
                            <tr key={e._id}>
                                <td> { new Date(e.date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: '2-digit',
                                        year: 'numeric'
                                    })}
                                </td>
                                <td>{ e.description }</td>
                                <td>{ e.category }</td>
                                <td>{ e.type }</td>
                                <td>{ e.store }</td>
                                <td>{ e.quantity }</td>
                                <td>{ e.unit }</td>
                                <td className="text-muted fst-italic">₱{e.quantity ? (e.totalAmount / e.quantity).toFixed(2) : '—'}</td>
                                <td>₱{e.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="fst-italic">{ e.remarks }</td>
                            </tr>     
                        );
                    })
                }
            </tbody>
        </table>

        {/* ////////////////////////////// */}
        {/* /////       Modals       ///// */}
        {/* ////////////////////////////// */}

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{currentExpense._id ? 'Edit Expense' : 'Add Expense'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={currentExpense.date}
                             onChange={(e) => setCurrentExpense({ ...currentExpense, date: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                value={currentExpense.description}
                                onChange={(e) => setCurrentExpense({ ...currentExpense, description: e.target.value })}
                            />
                    </Form.Group>

                    <Form.Group>                        
                        <Form.Label>Category</Form.Label>
                        <div className="d-flex flex-wrap">
                            {[
                                { label: "Assets", selectedColor: '#00badbff', borderColor: '#00badbff', color: '#05444fff' },
                                { label: "Operating Cost", selectedColor: '#ff4656ff', borderColor: '#ff4656ff', color: '#5b0f16ff' },
                                { label: "Overhead Cost", selectedColor: '#ffd455ff', borderColor: '#ffd455ff', color: '#3e3210ff' },
                                { label: "Liability", selectedColor: '#43af39ff', borderColor: '#43af39ff', color: '#133210ff'  },
                                { label: "Cost of Goods Sold", selectedColor: '#df90dcff', borderColor: '#df90dcff', color: '#4a2f49ff'  },
                            ].map(category => {
                                const isSelected = currentExpense.category === category.label;
                                return (
                                    <Button
                                        key={category.label}
                                        size="sm"
                                        variant={isSelected ? category.bg : `outline-${category.bg}`}
                                        className="me-2 mb-2"
                                        onClick={() => setCurrentExpense({ ...currentExpense, category: category.label })}
                                        style={{
                                            backgroundColor: isSelected ? category.selectedColor : category.defaultColor,
                                            borderColor: isSelected ? category.borderColor : category.borderColor,
                                            color: isSelected ? category.color : category.selectedColor,
                                        }}
                                    > {category.label} </Button>
                                )
                            })}
                        </div>
                    </Form.Group>

<Form.Group>
    <Form.Label>Type</Form.Label>
    <ColoredSelect
        options={expenseTypesOptions}
        value={expenseTypesOptions.find(opt => opt.value === currentExpense.type)}
        onChange={(selected) =>
            setCurrentExpense({ ...currentExpense, type: selected.value })
        }
    />
</Form.Group>

                    <Form.Group>
                        <Form.Label>Store</Form.Label>
                        <Form.Control
                            type="text"
                            value={currentExpense.store}
                            onChange={(e) => setCurrentExpense({ ...currentExpense, store: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Quantity</Form.Label>
                        <Form.Control
                           type="number"
                           value={currentExpense.quantity}
                           onChange={(e) => setCurrentExpense({ ...currentExpense, quantity: Number(e.target.value) })}
                         />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Total Amount</Form.Label>
                        <Form.Control
                           type="number"
                           value={currentExpense.totalAmount}
                           onChange={(e) => setCurrentExpense({ ...currentExpense, totalAmount: Number(e.target.value) })}
                         />
                    </Form.Group>
  
                    <Form.Group>
                        <Form.Label>Remarks</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={currentExpense.remarks}
                            onChange={(e) => setCurrentExpense({ ...currentExpense, remarks: e.target.value })}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save</Button>
            </Modal.Footer>
        </Modal>


    </div>
  );
}

export default Expenses;
