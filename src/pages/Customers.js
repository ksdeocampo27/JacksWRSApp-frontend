import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMultiAddModal, setShowMultiAddModal] = useState(false); // Modal for adding multiple customers
  const [multiCustomerInput, setMultiCustomerInput] = useState(''); // Input value for multiple customers
  const [selectedIds, setSelectedIds] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentRemarks, setCurrentRemarks] = useState(''); 
  const [currentCustomer, setCurrentCustomer] = useState({
    name: '',
    nickname: '',
    phone: '',
    address: '',
    landmark: '',
    frequency: '',
    birthday: '',
    lastTransactionDate: '',
    remarks: '',
    createdAt:''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Show Add Modal
  const handleShowAddModal = () => {
    setIsEditing(false);
    setCurrentCustomer({ 
      name: '', 
      nickname: '', 
      phone: '', 
      address: '', 
      landmark: '', 
      frequency: '',
      birthday: '', 
      lastTransactionDate: '',
      remarks: ''
    });
    setShowModal(true);
  };

  // Show Edit Modal
  const handleShowEditModal = (customer) => {
    setIsEditing(true);
    setCurrentCustomer({
      ...customer,
      birthday: customer.birthday ? customer.birthday.substring(0,10) : ''
    });
    setShowModal(true);
  };

  // Handle Remarks Modal
  const handleShowRemarksModal = (remarks) => {
    setCurrentRemarks(remarks);
    setShowRemarksModal(true);
  };

  // Save Single Customer (Add or Edit)
  const handleSaveCustomer = async () => {
    try {
      if (isEditing) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/customers/${currentCustomer._id}`, currentCustomer);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/customers`, currentCustomer);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Customer
  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteCustomer = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/customers/${customerToDelete._id}`);
      setShowDeleteModal(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  // ===========================
  // ADD MULTIPLE CUSTOMERS
  // ===========================
  // Expecting format: name;nickname;phone;address;landmark;frequency;birthday;remarks;lastTransactionDate
  const handleAddMultipleCustomers = async () => {
    const lines = multiCustomerInput.trim().split('\n');

    try {
      for (const line of lines) {
        const [name, nickname, phone, address, landmark, birthday, remarks] = line.split(';').map(x => x.trim());
        if (name) {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/customers`, {
            name,
            nickname,
            phone,
            address,
            landmark,
            birthday: birthday ? new Date(birthday) : null,
            remarks
          });
        }
      }
      alert('Multiple customers added successfully!');
      setShowMultiAddModal(false);
      setMultiCustomerInput('');
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert('Error adding multiple customers. Check console for details.');
    }
  };



  // ===========================
  // COMPONENT RENDER
  // ===========================
  return (
    <div style={{ padding: '20px' }}>
      <h2>Customers</h2>

      <Button variant="primary" onClick={handleShowAddModal}>Add Customer</Button>{' '}
      <Button variant="success" onClick={() => setShowMultiAddModal(true)}>Add Multiple Customers</Button>

      {/* Button - Edit Mode Button*/}
      <Button
        variant={editMode ? "danger" : "warning"}
        className="ms-2"
        onClick={() => {
            setEditMode(!editMode);
        }}
      >
      {editMode ? "Exit Edit Mode" : "Edit Mode"}
      </Button>

      {/* Multiple Delete Interface and Buttons*/}
        {editMode && (
        <>
        <Button
            variant="secondary"
            className="ms-2"
            disabled={selectedIds.length === 0 || deleting}
            onClick={() => setShowDeleteSelectedModal(true)}
        >
            {deleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
        </Button>

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
              >
                {deleteProgress}%
              </div>
            </div>
            <div className="text-center mt-2">Deleting... Please wait.</div>
          </div>
        )}

        {deleteSuccess && (
          <Alert variant="success" className="mt-3">
            Selected items deleted successfully!
          </Alert>
        )}
    </>
    )}
      
      {/* Customers Table */}
      <table className="table mt-3">
        <thead>
          <tr>
            {editMode && (
            <th>
                <Form.Check
                  type="checkbox"
                  checked={checkAll}
                  onChange={(e) => {
                    const filteredIds = customers
                      .map(cus => cus._id);
                    setCheckAll(e.target.checked);
                    if (e.target.checked) {
                      setSelectedIds(filteredIds);
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
            </th>
            )}
            <th>Name</th>
            <th>Nickname</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Landmark</th>
            <th>Frequency</th>
            <th>Remarks</th>
            {editMode && (
              <>
              <th>Birthday</th>
              <th>Last Transaction Date</th>
              <th>Created At</th>
              <th>Actions</th>
              </>
            )}
            
          </tr>
        </thead>

        {/*Table Body or Records*/}
        <tbody>
        {customers
        .sort((a, b) => a.name.localeCompare(b.name)) // 🔽 Sorts by name alphabetically
        .map(c => {
          const isChecked = selectedIds.includes(c._id);
          return (
            <tr key={c._id}>
              {editMode && (
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newSelected = [...selectedIds, c._id];
                        setSelectedIds(newSelected);
                        if (newSelected.length === customers.length) {
                          setCheckAll(true);
                        }
                      } else {
                        const newSelected = selectedIds.filter(id => id !== c._id);
                        setSelectedIds(newSelected);
                        setCheckAll(false);
                      }
                    }}
                  />
                </td>
        )}
        <td>
          <Link to={`/customers/${c._id}/profile`}>{c.name}</Link>
        </td>
        <td>{c.nickname}</td>
        <td>{c.phone}</td>
        <td>{c.address}</td>
        <td>{c.landmark}</td>
        <td>{c.frequency}</td>
        <td>
          {editMode ? (
            c.remarks
          ) : (
            c.remarks && c.remarks.trim() !== '' ? (
              <span
                style={{ cursor: 'pointer', color: '#0d6efd' }}
                onClick={() => handleShowRemarksModal(c.remarks)}
              >
                🛈
              </span>
            ) : null
          )}
        </td>
        {editMode && (
          <>         
          <td>{c.birthday ? new Date(c.birthday).toLocaleDateString() : ''}</td>
          <td>{c.lastTransactionDate ? new Date(c.lastTransactionDate).toLocaleDateString() : ''}</td>
          <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</td>
          <td>
            <Button variant="warning" size="sm" onClick={() => handleShowEditModal(c)}>Edit</Button>{' '}
            <Button variant="danger" size="sm" onClick={() => handleDeleteClick(c)}>Delete</Button>
          </td></>

        )}
      </tr>
    );
  })}
</tbody>

      </table>

{/* Add/Edit Modal */}
<Modal show={showModal} onHide={() => setShowModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>{isEditing ? 'Edit Customer' : 'Add Customer'}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          value={currentCustomer.name}
          onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Nickname</Form.Label>
        <Form.Control
          type="text"
          value={currentCustomer.nickname}
          onChange={(e) => setCurrentCustomer({ ...currentCustomer, nickname: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Phone</Form.Label>
        <Form.Control
          type="text"
          value={currentCustomer.phone}
          onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Address</Form.Label>
        <Form.Control
          type="text"
          value={currentCustomer.address}
          onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Landmark</Form.Label>
        <Form.Control
          type="text"
          value={currentCustomer.landmark}
          onChange={(e) => setCurrentCustomer({ ...currentCustomer, landmark: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Frequency</Form.Label>
        <Form.Control
          type="number"
          value={currentCustomer.frequency}
          onChange={(e) => setCurrentCustomer({ ...currentCustomer, frequency: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Birthday</Form.Label>
        <Form.Control
          type="date"
          value={currentCustomer.birthday}
          onChange={(e) => setCurrentCustomer({ ...currentCustomer, birthday: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Last Transaction Date</Form.Label>
        <Form.Control
          type="date"
          value={currentCustomer.lastTransactionDate}
          onChange={(e) => setCurrentCustomer({ ...currentCustomer, lastTransactionDate: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Remarks</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={currentCustomer.remarks}
          onChange={(e) => setCurrentCustomer({ ...currentCustomer, remarks: e.target.value })}
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
    <Button variant="primary" onClick={handleSaveCustomer}>Save</Button>
  </Modal.Footer>
</Modal>


      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {customerToDelete?.name}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteCustomer}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Multiple Customers Modal */}
      <Modal show={showMultiAddModal} onHide={() => setShowMultiAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Multiple Customers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Enter multiple customers (one per line, semicolon-separated: name;nickname;phone;address;landmark;birthday;remarks)</Form.Label>
              <Form.Control as="textarea" rows={6} value={multiCustomerInput} onChange={(e) => setMultiCustomerInput(e.target.value)} placeholder="Example: Juan Dela Cruz;09171234567;San Juan;1990-01-01;Frequent buyer" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMultiAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddMultipleCustomers}>Add All</Button>
        </Modal.Footer>
      </Modal>

      {/* Multi Delete Confirmation Modal */}
      <Modal show={showDeleteSelectedModal} onHide={() => setShowDeleteSelectedModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Selected</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {selectedIds.length} selected customer{selectedIds.length > 1 ? 's' : ''}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteSelectedModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                setShowDeleteSelectedModal(false);
                setDeleting(true);
                setDeleteProgress(0);
              
                for (let i = 0; i < selectedIds.length; i++) {
                  const id = selectedIds[i];
                  await axios.delete(`http://localhost:3001/api/customers/${id}`);
                  setDeleteProgress(Math.round(((i + 1) / selectedIds.length) * 100));
                }
              
                setDeleteSuccess(true);
                setTimeout(() => setDeleteSuccess(false), 3000);
              
                fetchCustomers();
                setSelectedIds([]);
                setCheckAll(false);
              } catch (err) {
                console.error(err);
                alert('Error deleting selected customers.');
              } finally {
                setDeleting(false);
                setDeleteProgress(0);
              }
            }}
          >
            Confirm Delete
          </Button>
          </Modal.Footer>
    </Modal>

    {/*Remarks Modal*/}
<Modal show={showRemarksModal} onHide={() => setShowRemarksModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Remarks</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {currentRemarks}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowRemarksModal(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>



    </div>
  );
}

export default Customers;
