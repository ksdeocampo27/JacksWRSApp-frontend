import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Inventory() {
  const [filterType, setFilterType] = useState('Slim');
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMultiAddModal, setShowMultiAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [currentItem, setCurrentItem] = useState({
    id: null,
    name: '',
    type:'',
    status: 'Stock In',
    dateOfPurchase: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [multiInput, setMultiInput] = useState('');
  const [checkAll, setCheckAll] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);

const [currentPage, setCurrentPage] = useState(1);
const recordsPerPage = 100;
// Calculate paginated data
const filteredInventory = inventory.filter(inv => inv.type === filterType);
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredInventory.slice(indexOfFirstRecord, indexOfLastRecord);
const totalPages = Math.ceil(filteredInventory.length / recordsPerPage);

  // ================================
  // FETCH INVENTORY
  // ================================
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/inventory`);
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================================
  // ADD or UPDATE INVENTORY
  // ================================
  const handleSave = async () => {
    try {
      if (currentItem._id) {
        // EDIT
        await axios.put(`${process.env.REACT_APP_API_URL}/api/inventory/${currentItem._id}`, currentItem);
      } else {
        // ADD
        await axios.post(`${process.env.REACT_APP_API_URL}/api/inventory`, currentItem);
      }
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  // ================================
  // DELETE INVENTORY
  // ================================
const confirmDelete = async () => {
  try {
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/inventory/${deleteTargetId}`);
    setShowDeleteModal(false);
    setDeleteTargetId(null);
    fetchInventory();
  } catch (err) {
    console.error(err);
  }
};

  // ================================
  // ADD MULTIPLE INVENTORY
  // ================================
const handleMultiAdd = async () => {
  const lines = multiInput.trim().split('\n');
  setImporting(true);
  setImportProgress(0);

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [id, name, type, status, dateOfPurchase, remarks] = line.split(';').map(f => f.trim());
      const item = {
        id: Number(id),
        name,
        type,
        status: status || 'Stock In',
        dateOfPurchase: dateOfPurchase ? new Date(dateOfPurchase) : new Date(),
        remarks: remarks || ''
      };
      await axios.post(`${process.env.REACT_APP_API_URL}/api/inventory`, item);

      // Update progress
      setImportProgress(Math.round(((i + 1) / lines.length) * 100));
    }

    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 3000); // hides after 3 seconds
    setShowMultiAddModal(false);
    setMultiInput('');
    fetchInventory();
  } catch (err) {
    console.error(err);
    alert('Error importing inventory.');
  } finally {
    setImporting(false);
    setImportProgress(0);
  }
};


  // ================================
  // RENDER JSX
  // ================================
  return (
    <div style={{ padding: '20px' }}>
        <h2>Inventory</h2>

        {/* Button - Add Inventory Button*/}
        <Button variant="primary" onClick={() => {
          setCurrentItem({
            id: null,
            name: '',
            type: '',
            status: 'Stock In',
            dateOfPurchase: new Date().toISOString().split('T')[0],
            remarks: ''
          });
          setShowModal(true);
        }}>Add Inventory</Button>

        {/* Button - Add Multiple Inventory Button */}
        <Button variant="secondary" onClick={() => setShowMultiAddModal(true)} className="ms-2">Add Multiple Inventory</Button>

        {/* Button - Edit Mode Button*/}
        <Button
          variant={editMode ? "danger" : "warning"}
          className="ms-2"
          onClick={() => {
              setEditMode(!editMode);
              setSelectedIds([]);
              setCheckAll(false);
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

{/* Buttons to filter by type */}
<div className="d-flex justify-content-between align-items-center mt-3">
  <div className="d-flex flex-wrap">
    {[
      { label: 'Slim', selectedColor: '#225ffbff', borderColor: '#102968ff', defaultColor: '#143a98ff' },
      { label: 'Round', selectedColor: '#00aaffff', borderColor: '#00486dff', defaultColor: '#006ea6ff' },
      { label: 'Dispenser', selectedColor: '#00dfefff', borderColor: '#005359ff', defaultColor: '#0096a1ff' }
    ].map(type => {
      const isSelected = filterType === type.label;
      return (
        <Button
          key={type.label}
          size="Default"
          variant="outline-secondary"
          className="me-2 mb-2"
          onClick={() => {
            setFilterType(type.label);
            setCurrentPage(1); // reset to first page when filter changes
          }}
          disabled={isSelected}
          style={{
            backgroundColor: isSelected ? type.selectedColor : type.defaultColor,
            borderColor: isSelected ? type.borderColor : 'transparent',
            color: isSelected ? '#000' : type.borderColor,
          opacity: 1, // ✅ keep full opacity even when disabled
          cursor: isSelected ? 'default' : 'pointer'
          }}
        >
          {type.label}
        </Button>
      );
    })}
  </div>

  {/* Page Controls */}
  <div className="d-flex align-items-center mt-2 mt-md-0">
    <Button
      variant="secondary"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(currentPage - 1)}
      className="me-2"
    >
      Previous
    </Button>

    <span>Page {currentPage} of {totalPages}</span>

    <Button
      variant="secondary"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(currentPage + 1)}
      className="ms-2"
    >
      Next
    </Button>
  </div>
</div>


      <table className="table mt-3">
        {/*Table Head*/}
        <thead>
          <tr>
            {editMode && (
            <th>
                <Form.Check
                  type="checkbox"
                  checked={checkAll}
                  onChange={(e) => {
                    const filteredIds = inventory
                      .filter(inv => inv.type === filterType)
                      .map(inv => inv._id);
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
            <th>_ID</th>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Date of Purchase</th>            
            <th>Remarks</th>
            {editMode && (
                <th>Actions</th>
                )}
          </tr>
        </thead>

        {/*Table Body or Records*/}
        <tbody>
        {currentRecords.map(inv => {
                const isChecked = selectedIds.includes(inv._id);
                return (
                <tr key={inv._id}>
                {editMode && (
                    <td>
                        <Form.Check
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    const newSelected = [...selectedIds, inv._id];
                                    setSelectedIds(newSelected);
                                    const filteredIds = inventory.filter(i => i.type === filterType).map(i => i._id);
                                    if (newSelected.length === filteredIds.length) {
                                      setCheckAll(true);
                                    }
                                } else {
                                  const newSelected = selectedIds.filter(id => id !== inv._id);
                                  setSelectedIds(newSelected);
                                  setCheckAll(false);
                                }
                            }}
                        />
                    </td>
                )}
        <td>{inv._id}</td>
        <td>{inv.id}</td>
        <td>
          <Link to={`/inventory/${inv._id}`}>{inv.name}</Link>
        </td>
        <td>{inv.type}</td>
        <td>{inv.status}</td>
        <td>
          {inv.dateOfPurchase
            ? new Date(inv.dateOfPurchase).toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
              })
            : ''}
        </td>
        <td className="fst-italic">{inv.remarks}</td>
        {editMode &&(
        <td>
          <FaEdit
            style={{ cursor: 'pointer', color: 'orange', marginRight: '10px' }}
            onClick={() => {
              setCurrentItem({
                _id: inv._id,
                id: inv.id,
                name: inv.name,
                type: inv.type,
                status: inv.status,
                dateOfPurchase: inv.dateOfPurchase ? new Date(inv.dateOfPurchase).toISOString().split('T')[0] : '',
                remarks: inv.remarks
              });
              setShowModal(true);
            }}
          />
          <FaTrash
            style={{ cursor: 'pointer', color: 'red' }}
            onClick={() => {
              setDeleteTargetId(inv._id);
              setShowDeleteModal(true);
            }}
          />
        </td>
        )}
      </tr>
    )
  })}
</tbody>

      </table>
 {/* ////////////////////////////// */}
 {/* /////       MODALS       ///// */}
 {/* ////////////////////////////// */}
 
      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentItem._id ? 'Edit Inventory' : 'Add Inventory'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>ID</Form.Label>
              <Form.Control
                type="number"
                value={currentItem.id || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, id: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
                <Form.Label>Type</Form.Label>
                <div className="d-flex flex-wrap">
                  {[
                    { label: "Slim", bg: "primary" },
                    { label: "Round", bg: "info" },
                    { label: "Dispenser", bg: "success" },
                  ].map(type => {
                    const isSelected = currentItem.type === type.label;
                    return (
                      <Button
                        key={type.label}
                        size="sm"
                        variant={isSelected ? type.bg : `outline-${type.bg}`}
                        className="me-2 mb-2"
                        onClick={() => setCurrentItem({ ...currentItem, type: type.label })}
                        style={{
                          backgroundColor: type.bg === "navy blue" && isSelected ? "#2b35c4ff"
                                           : type.bg === "navy blue" ? "transparent"
                                           : undefined,
                          borderColor: type.bg === "navy blue" ? "#1b206bff" : undefined,
                          color: type.bg === "navy blue" && isSelected ? "#636dfeff"
                                : type.bg === "purple" ? "#636dfeff"
                                : undefined,
                        }}
                      >
                        {type.label}
                      </Button>
                    )
                  })}
                </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={currentItem.status}
                onChange={(e) => setCurrentItem({ ...currentItem, status: e.target.value })}
              >
                <option>Stock In</option>
                <option>Issued</option>
                <option>Lost</option>
                <option>Repaired</option>
                <option>Damaged</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Date of Purchase</Form.Label>
              <Form.Control
                type="date"
                value={currentItem.dateOfPurchase}
                onChange={(e) => setCurrentItem({ ...currentItem, dateOfPurchase: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={currentItem.remarks}
                onChange={(e) => setCurrentItem({ ...currentItem, remarks: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* Multi Add Modal */}
      <Modal show={showMultiAddModal} onHide={() => setShowMultiAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Multiple Inventory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Enter multiple inventory records (one per line, semicolon-separated fields: id;name;type;status;dateOfPurchase;remarks)</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={multiInput}
                onChange={(e) => setMultiInput(e.target.value)}
              />              
            </Form.Group>
            <Button
                variant="primary"
                className="mt-2"
                onClick={handleMultiAdd}
                disabled={importing}
            >
            {importing ? 'Importing...' : 'Import Inventory'}
            </Button>
          </Form>
            {importing && (
                <div className="mt-3">
                  <div className="progress">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${importProgress}%` }}
                      aria-valuenow={importProgress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {importProgress}%
                    </div>
                  </div>
                  <div className="text-center mt-2">Importing... DO NOT CLOSE. Please wait.</div>
                </div>
            )}

            {importSuccess && (
  <Alert variant="success" className="mt-3">
    Import successful!
  </Alert>
)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMultiAddModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Are you sure you want to delete this inventory item?
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
                Delete
            </Button>
        </Modal.Footer>
    </Modal>

      {/* Multi Delete Confirmation Modal */}
<Modal show={showDeleteSelectedModal} onHide={() => setShowDeleteSelectedModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Delete Selected</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    Are you sure you want to delete {selectedIds.length} selected item{selectedIds.length > 1 ? 's' : ''}?
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
            await axios.delete(`http://localhost:3001/api/inventory/${id}`);
            setDeleteProgress(Math.round(((i + 1) / selectedIds.length) * 100));
          }

          setDeleteSuccess(true);
          setTimeout(() => setDeleteSuccess(false), 3000);

          fetchInventory();
          setSelectedIds([]);
          setCheckAll(false);
        } catch (err) {
          console.error(err);
          alert('Error deleting selected items.');
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



    </div>
  );
}

export default Inventory;
