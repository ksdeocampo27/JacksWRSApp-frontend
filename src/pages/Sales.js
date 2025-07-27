import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

function Sales() {
    const [sales, setSales] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [containers, setContainers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);  

    const [editMode, setEditMode] = useState(false);
    const [selectedSalesIds, setSelectedSalesIds] = useState([]);
    const [checkAll, setCheckAll] = useState(false);
    const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState(0);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [currentSale, setCurrentSale] = useState({
      date: new Date().toISOString().split('T')[0],
      customerId: '',
      containerId: '',
      type: 'Delivery',
      item: '',
      quantity: 1,
      pricePerUnit: 0,
      totalAmount: 0,
      paymentMethod: 'Cash',
      status: 'Paid',
      remarks: ''
    });

    const [saleToEditId, setSaleToEditId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const [showMultiAddModal, setShowMultiAddModal] = useState(false);
    const [multiSalesInput, setMultiSalesInput] = useState('');

    const [importProgress, setImportProgress] = useState(0);
    const [showImportResultModal, setShowImportResultModal] = useState(false);
    const [importResult, setImportResult] = useState({ successCount: 0, failedLine: null, errorMessage: '' });

    const [currentSaleId, setCurrentSaleId] = useState(null);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState({
      name: '',
      nickname: '',
      phone: '',
      address: '',
      landmark: '',
      birthday: '',
      remarks: ''
    });

    const itemColors = {
      "Refill (Slim 5gal)": "#00499cff",   
      "Refill (Round 5gal)": "#00b3ffff",  
      "New (Slim 5gal)": "#4aec70ff",      
      "New (Round 5gal)": "#28a745",   
      "Dispenser": "#15e8d3ff",          
      "Bottled Water (500mL)": "#905df7ff",
      "Bottled Water (1000mL)": "#4f26a0ff",            
      // add other items as needed
    };


  // ===============================
  // LOAD SALES & CUSTOMERS
  // ===============================
  useEffect(() => {
    fetchSales();
    fetchCustomers();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/sales`);
      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContainers = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/inventory`);
    setContainers(res.data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchSales();
  fetchCustomers();
  fetchContainers(); // load containers
}, []);


  // ===============================
  // HANDLERS
  // ===============================
  const handleShowAddModal = () => {
    setIsEditing(false);
    setCurrentSale({
      name: '',
      date: new Date().toISOString().split('T')[0],
      customerId: '',
      containerId: '',
      type: 'Delivery',
      item: 'Refill (Slim 5gal)',
      quantity: 1,
      pricePerUnit: 0,
      totalAmount: 0,
      paymentMethod: 'Cash',
      status: 'Paid',
      remarks: ''
    });
    setShowModal(true);
  };

  const handleShowEditModal = (sale) => {
//  if (containers.length === 0) {
//     alert("Containers not loaded yet. Please wait.");
//     return;
//   }else{
//     alert("Containers are loaded.");
//     console.log("Sale.containerIds:", sale.containerIds);
//   }

    setIsEditing(true);
    setSaleToEditId(sale._id);
    setCurrentSale({
      date: sale.date ? sale.date.substring(0,10) : new Date().toISOString().split('T')[0],
      customerId: sale.customerId?._id || '',
      customerName: sale.customerName || '',
      type: sale.type,
      item: sale.item || '',
      quantity: sale.quantity,
      pricePerUnit: sale.pricePerUnit || 0,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      customerContainerQty: sale.customerContainerQty || 0,
      containerIds: sale.containerIds?.map(c => c._id || c) || [],
      remarks: sale.remarks || ''
    });
    setShowModal(true);
  };

  const handleSaveSale = async () => {
    try {
      const calculatedPricePerUnit = currentSale.totalAmount && currentSale.quantity
        ? currentSale.totalAmount / currentSale.quantity
        : 0;

    const saleToSave = { 
      ...currentSale, 
      pricePerUnit: calculatedPricePerUnit,
      customerId: currentSale.customerId || null,
      customerName: currentSale.customerName || '',
      customerContainerQty: currentSale.customerContainerQty || 0,
    };


      if (isEditing) {
        await axios.put(`http://localhost:3001/api/sales/${saleToEditId}`, saleToSave);
      } else {
        await axios.post('http://localhost:3001/api/sales', saleToSave);
      }

      setShowModal(false);
      fetchSales();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (sale) => {
    setSaleToDelete(sale);
    setShowDeleteModal(true);
  };

  const handleDeleteSale = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/sales/${saleToDelete._id}`);
      setShowDeleteModal(false);
      setSaleToDelete(null);
      fetchSales();
    } catch (err) {
      console.error(err);
    }
  };

const handleMultiSalesImport = async () => {    
  if (!multiSalesInput) {
    alert('Please enter sales records first.');
    return;
  }

  let importing = true; // 🔑 local synchronous flag to avoid React async delays

  const lines = multiSalesInput.trim().split('\n');
  let successCount = 0;

  try {
      console.log("Starting import...");
    for (let i = 0; i < lines.length; i++) {
      if (!importing) {
        console.log('Import stopped by user.');
        break;
      }

      const line = lines[i];
      const [date, customerName, type, item, quantity, totalAmount, paymentMethod, status, containersField, remarks] = line.split(';').map(f => f.trim());

      // Process containers field
      let customerContainerQty = 0;
      let containerIds = [];
      if (containersField) {
        const containersArray = containersField.split(',').map(c => c.trim());
        containersArray.forEach(c => {
          if (c.toLowerCase().startsWith('z')) {
            customerContainerQty = parseInt(c.substring(1)) || 0;
          } else {
            const containerObj = containers.find(cont => cont.id === c || cont.name === c || cont._id === c);
            if (containerObj) {
              containerIds.push(containerObj._id);
            } else {
              containerIds.push(c);
            }
          }
        });
      }

      // Calculate
      const qty = parseInt(quantity);
      const total = parseFloat(totalAmount);
      const pricePerUnit = qty !== 0 ? total / qty : 0;

      const customer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());

      const sale = {
        date: date || new Date().toISOString().split('T')[0],
        customerId: customer ? customer._id : null,
        customerName: customer ? customer.name : customerName,
        type: type || 'Walk-in',
        item: item || '',
        quantity: qty || 1,
        totalAmount: total || 0,
        pricePerUnit: pricePerUnit || 0,
        paymentMethod: paymentMethod || 'Cash',
        status: status || 'Paid',
        customerContainerQty,
        containerIds,
        remarks: remarks || '',
      };

      await axios.post('http://localhost:3001/api/sales', sale);
      
      successCount++;

      // Update progress bar
      setImportProgress(Math.round(((i + 1) / lines.length) * 100));
    }

    // Show success modal if all completed
    if (successCount === lines.length) {
      setImportResult(prev => ({ 
        ...prev, 
        successCount 
    }));

      setShowMultiAddModal(false);
      setShowImportResultModal(true);
    }

    fetchSales();

  } catch (err) {
    console.error(err);
    alert('Error importing sales. Check console for details.');
  }
};

const handleAddCustomer = async () => {
  try {
    // 1. Create the new customer
    const res = await axios.post('http://localhost:3001/api/customers', currentCustomer);
    const newCustomer = res.data;

    // 2. Update the sale with new customerId and customerName
    await axios.put(`http://localhost:3001/api/sales/${currentSaleId}`, {
      customerId: newCustomer._id,
      customerName: newCustomer.name
    });

    // 3. Fetch the fully populated updated sale
    const populatedSaleRes = await axios.get(`http://localhost:3001/api/sales/${currentSaleId}`);
    const populatedSale = populatedSaleRes.data;

    // 4. Update sales state locally to reflect immediately
    setSales(prevSales =>
      prevSales.map(s =>
        s._id === populatedSale._id ? populatedSale : s
      )
    );
 // 🔁 Re-fetch inventory to update name link
    fetchSales();

    // 5. Close modal and reset
    
    setShowAddCustomerModal(false);
    setCurrentCustomer({});
    setCurrentSaleId(null);

    setSuccessMessage('Customer added and sale updated!');
    setShowSuccessModal(true);
  } catch (err) {
    console.error(err);
    alert('Error adding customer.');
  }
};






  // ===============================
  //            RENDER
  // ===============================
return (
    <div style={{ padding: '20px' }}>
      <h2>Sales</h2>

      <Button variant="primary" onClick={handleShowAddModal}>Add Sale</Button>
      <Button
          variant="secondary"
          onClick={() => {
            setImportProgress(0);  // reset progress
            setShowMultiAddModal(true);
          }}
        >
          Add Multiple Sales
        </Button>
        <Button
          variant={editMode ? "danger" : "warning"}
          className="ms-2"
          onClick={() => {
            setEditMode(!editMode);
            setSelectedSalesIds([]);
            setCheckAll(false);
          }}
        >
          {editMode ? "Exit Edit Mode" : "Edit Mode"}
        </Button>

        {editMode && (
          <Button
            variant="secondary"
            className="ms-2"
            disabled={selectedSalesIds.length === 0 || deleting}
            onClick={() => setShowDeleteSelectedModal(true)}
          >
            {deleting ? 'Deleting...' : `Delete Selected (${selectedSalesIds.length})`}
          </Button>
        )}

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

      <table className="table table-hover mt-3">
        <thead>
          <tr>
            {editMode && (
              <th>
                <Form.Check
                  type="checkbox"
                  checked={checkAll}
                  onChange={(e) => {
                    const allIds = sales.map(s => s._id);
                    setCheckAll(e.target.checked);
                    if (e.target.checked) {
                      setSelectedSalesIds(allIds);
                    } else {
                      setSelectedSalesIds([]);
                    }
                  }}
                />
              </th>
            )}
            <th>Date</th>
            <th>Customer Name</th>
            <th>Type</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price Per Unit</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Containers</th>
            <th>Remarks</th>
            {editMode && (
                <>            
                <th>Actions</th>
                </>
            )}
            
          </tr>
        </thead>
        <tbody>
            {sales
            .sort((a, b) => new Date(a.date) - new Date(b.date))
              // .sort((a, b) => {
              //   // 1️⃣ Compare names (case-insensitive)
              //   const nameA = a.customerName?.toLowerCase() || '';
              //   const nameB = b.customerName?.toLowerCase() || '';
              //   if (nameA < nameB) return -1;
              //   if (nameA > nameB) return 1;

              //   // 2️⃣ If names are the same, compare dates
              //   const dateA = new Date(a.date);
              //   const dateB = new Date(b.date);
              //   return dateA - dateB;
              // })

            .map(s => {
              const isChecked = selectedSalesIds.includes(s._id);
              return (
              <tr key={s._id}>
                {editMode && (
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newSelected = [...selectedSalesIds, s._id];
                        setSelectedSalesIds(newSelected);
                        if (newSelected.length === sales.length) {
                          setCheckAll(true);
                        }
                      } else {
                        const newSelected = selectedSalesIds.filter(id => id !== s._id);
                        setSelectedSalesIds(newSelected);
                        setCheckAll(false);
                      }
                    }}
                  />
                </td>)}
                <td>
                  {new Date(s.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: '2-digit',
                    year: 'numeric'
                  })}
                </td>
                <td>
                    {(() => {
                      const customer = customers.find(c => c._id === (s.customerId?._id || s.customerId));
                      if (customer) {
                        return (
                          <a href={`/customers/${customer._id}/profile`} style={{ textDecoration: 'underline' }}>
                            {customer.name}
                          </a>
                        );
                      } else {
                        return s.customerName || '-';
                      }
                    })()}
                  </td>
                <td>{s.type}</td>
                <td><span
                      style={{
                        display: "inline-block",
                        backgroundColor: itemColors[s.item] || "#ccc", // default gray if not found
                        color: "white",
                        borderRadius: "15px",
                        padding: "2px 8px",
                        fontSize: "1rem",
                      }}
                    >
                      {s.item}
                    </span></td>                    
                <td>{s.quantity}</td>
                <td className="text-muted">₱{s.pricePerUnit?.toFixed(2) || '0.00'}</td>
                <td>₱{s.totalAmount}</td>
                <td>{s.paymentMethod}</td>
                <td>{s.status}</td>
                <td>
                 {/*
                   Display owned containers if qty > 0
                 */}
                 {s.customerContainerQty > 0 && (
                   <span>
                     z{s.customerContainerQty}
                     {s.containerIds && s.containerIds.length > 0 ? ', ' : ''}
                   </span>
                 )}
               
                 {/*
                   Display borrowed containers as clickable links
                 */}
                 {s.containerIds && s.containerIds.length > 0
                   ? s.containerIds.map((c, index) => {
                       const cid = c._id || c; // handle object or ID
                       const container = containers.find(cont => cont._id === cid);
                       return container ? (
                         <span key={cid}>
                           <a href={`/inventory/${container._id}`} style={{ textDecoration: 'underline' }}>
                             {container.name}
                           </a>
                           {index < s.containerIds.length - 1 ? ', ' : ''}
                         </span>
                       ) : (
                         <span key={cid}>
                           {cid}
                           {index < s.containerIds.length - 1 ? ', ' : ''}
                         </span>
                       );
                     })
                   : (!s.customerContainerQty || s.customerContainerQty === 0) && '-'}
                 </td>
                 <td className="fst-italic">{s.remarks}</td>
                 {editMode && (
                  <>
                 <td>
                  {!customers.some(c => c.name.toLowerCase() === s.customerName.toLowerCase()) && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        setCurrentCustomer({ name: s.customerName });
                        setCurrentSaleId(s._id);
                        setShowAddCustomerModal(true);
                      }}
                    >
                      <FaPlus /> {/* or your add icon */}
                    </Button>
                )}
                    <Button variant="link" size="sm" onClick={() => handleShowEditModal(s)}>
                      <FaEdit color="orange" />
                    </Button>
                    <Button variant="link" size="sm" onClick={() => handleDeleteClick(s)}>
                      <FaTrash color="red" />
                    </Button>
                  </td>
                  </>
                 )}  
            </tr>
          );
          })}
        </tbody>
      </table>


 {/* ////////////////////////////// */}
 {/* /////       MODALS       ///// */}
 {/* ////////////////////////////// */}


    {/* Add/Edit Modal */}
    <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Edit Sale' : 'Add Sale'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={currentSale.date}
                      onChange={(e) => setCurrentSale({ ...currentSale, date: e.target.value })}
                    />
                </Form.Group>
                
                <Form.Group>
                    <Form.Label>Customer Name</Form.Label>
                        <Typeahead
                            id="customer-typeahead"
                            labelKey="name" // which property to display as label
                            options={customers} // array of customers from database
                            placeholder="Type customer name..."
                            allowNew // allows typing new names not in the list
                            newSelectionPrefix="New: "
                  
                            selected={
                                (() => {
                                  const found = customers.find(c => c._id === currentSale.customerId);
                                  if (found) {
                                    return [found]; // show existing customer as selected
                                  } else if (currentSale.customerName) {
                                    return [{ name: currentSale.customerName }]; // show typed name as selected
                                  } else {
                                    return []; // no selection
                                  }
                                })()
                            }
            
                            onChange={(selected) => {
                                if (selected.length > 0) {
                                    const sel = selected[0];
                                    if (sel._id) {
                                        setCurrentSale({
                                          ...currentSale,
                                          customerId: sel._id,
                                          customerName: sel.name
                                      });
                                    } else if (sel.name) {
                                        // New typed name
                                        setCurrentSale({
                                          ...currentSale,
                                          customerId: null,
                                          customerName: sel.name
                                        });
                                    } else if (typeof sel === 'string') {
                                        // Typed raw string (edge case)
                                        setCurrentSale({
                                          ...currentSale,
                                          customerId: null,
                                          customerName: sel
                                        });
                                    }
                                } else {
                                    // If cleared selection
                                    setCurrentSale({
                                      ...currentSale,
                                      customerId: null,
                                      customerName: ''
                                    });
                                }
                            }}
                        />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Type</Form.Label><br/>
                    <Button
                      value = {currentSale.type}
                      variant={currentSale.type === 'Walk-in' ? 'success' : 'outline-success'}
                      onClick={() => setCurrentSale({ ...currentSale, type: 'Walk-in' })}
                      className="me-2"
                    >
                        Walk-in
                    </Button>
                    <Button
                      variant={currentSale.type === 'Delivery' ? 'primary' : 'outline-primary'}
                      onClick={() => setCurrentSale({ ...currentSale, type: 'Delivery' })}
                    >
                        Delivery
                    </Button>
                </Form.Group>

                <Form.Group>
                    <Form.Label>Item</Form.Label>
                    <div className="d-flex flex-wrap">
                      {[
                        { label: "Refill (Slim 5gal)", bg: "primary" },
                        { label: "Refill (Round 5gal)", bg: "info" },
                        { label: "New (Slim 5gal)", bg: "success" },
                        { label: "New (Round 5gal)", bg: "success" },
                        { label: "Plan A - Standard Plan", bg: "danger" },
                        { label: "Plan B - Family Plan", bg: "danger" },
                        { label: "Plan C - Business Plan", bg: "danger" },
                        { label: "Plan D - Enterprise Plan", bg: "danger" },
                        { label: "Plan E - Custom Plan", bg: "danger" },
                        { label: "Big Cap", bg: "warning" },
                        { label: "Small Cap", bg: "warning" },
                        { label: "Faucet", bg: "warning" },
                        { label: "Others", bg: "warning" },
                        { label: "Bottled Water (500mL)", bg: "purple" },
                        { label: "Bottled Water (1000mL)", bg: "purple" },
                        { label: "Dispenser", bg: "info" },
                      ].map(item => {
                        const isSelected = currentSale.item === item.label;
                        return (
                          <Button
                            key={item.label}
                            size="sm"
                            variant={isSelected ? item.bg : `outline-${item.bg}`}
                            className="me-2 mb-2"
                            onClick={() => setCurrentSale({ ...currentSale, item: item.label })}
                            style={{
                              backgroundColor: item.bg === "purple" && isSelected ? "#d6b3ff"
                                               : item.bg === "purple" ? "transparent"
                                               : undefined,
                              borderColor: item.bg === "purple" ? "#d6b3ff" : undefined,
                              color: item.bg === "purple" && isSelected ? "#5c2d91"
                                    : item.bg === "purple" ? "#5c2d91"
                                    : undefined,
                            }}
                          >
                            {item.label}
                          </Button>
                        )
                      })}
                    </div>
                </Form.Group>
                
                <Form.Group>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={currentSale.quantity}
                      onChange={(e) => setCurrentSale({ ...currentSale, quantity: Number(e.target.value) })}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Total Amount</Form.Label>
                    <Form.Control
                      type="number"
                      value={currentSale.totalAmount}
                      onChange={(e) => setCurrentSale({ ...currentSale, totalAmount: Number(e.target.value) })}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Select
                      value={currentSale.paymentMethod}
                      onChange={(e) => setCurrentSale({ ...currentSale, paymentMethod: e.target.value })}
                    >
                      <option>Cash</option>
                      <option>GCash</option>
                      <option>Free</option>
                    </Form.Select>
                </Form.Group>
                
                <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={currentSale.status}
                      onChange={(e) => setCurrentSale({ ...currentSale, status: e.target.value })}
                    >
                      <option>Paid</option>
                      <option>Unpaid</option>
                      <option>Free</option>
                    </Form.Select>
                </Form.Group>
                
            <Form.Group>
            <Form.Label>Containers</Form.Label>
            <div className="d-flex align-items-center">

              {/* Owned qty input */}
              <div className="me-2 d-flex align-items-center">
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Owned"
                  value={currentSale.customerContainerQty}
                  onChange={(e) =>
                    setCurrentSale({
                      ...currentSale,
                      customerContainerQty: Number(e.target.value)
                    })
                  }
                  style={{ width: "100px" }}
                />
              </div>
              
              {/* Select containers Typeahead */}
              <div style={{ flex: 1 }}>
                <Typeahead
                  id="container-typeahead"
                  labelKey={(option) => `${option.id} - ${option.name}`}
                  options={containers}
                  placeholder="Select containers..."
                  multiple
                  selected={containers.filter(c =>
                    currentSale.containerIds?.includes(c._id)
                  )}
                  onChange={(selected) => {
                    setCurrentSale({
                      ...currentSale,
                      containerIds: selected.map(s => s._id)
                    });
                  }}
                />
              </div>
              
            </div>
          </Form.Group>
              
          <Form.Group>
            <Form.Label>Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={currentSale.remarks}
              onChange={(e) => setCurrentSale({ ...currentSale, remarks: e.target.value })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
        <Button variant="primary" 
            onClick = { () => {
                handleSaveSale();
                console.log("currentSale.containerIds", currentSale.containerIds);
                console.log("containers", containers);
            }}
            >Save</Button>
      </Modal.Footer>
    </Modal>

      {/* Delete Confirmation Modal */}
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Sale</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this sale?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
        <Button variant="danger" onClick={handleDeleteSale}>Delete</Button>
      </Modal.Footer>
    </Modal>

    {/* Add Multi Sales Modal */}
    <Modal show={showMultiAddModal} onHide={() => setShowMultiAddModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Add Multiple Sales</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group>
                    <Form.Label>Enter multiple sales (one per line, semicolon-separated fields: date;customer name;type;quantity;total amount;payment method;status;containers;remarks)</Form.Label>
                    {importProgress > 0 && (
                      <div className="my-2">
                        <div className="progress">
                          <div
                            className="progress-bar progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            style={{ width: `${importProgress}%` }}
                            aria-valuenow={importProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {importProgress}%
                          </div>
                        </div>
                      </div>
                    )}                        
                    <Form.Control as="textarea" rows={10} value={multiSalesInput} onChange={(e) => setMultiSalesInput(e.target.value)} />
                </Form.Group>
                <Button variant="primary" className="mt-2" onClick={handleMultiSalesImport}>Import Sales</Button>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMultiAddModal(false)}>Close</Button>
        </Modal.Footer>
    </Modal>

    {/* Multi Add Result Modal */}
    <Modal show={showImportResultModal} onHide={() => setShowImportResultModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Import Result</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {importResult.failedLine
          ? <>
              <p>✅ Successfully added: {importResult.successCount}</p>
              <p>❌ Failed at line: {importResult.failedLine}</p>
              <p>Error: {importResult.errorMessage}</p>
            </>
          : <p>✅ All records successfully imported! Total added: {importResult.successCount}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button 
            variant="primary" 
            onClick={() => {
                setShowImportResultModal(false);
                setShowMultiAddModal(false);
                setImportProgress(0);
            }}
        >
          Close
        </Button>
        </Modal.Footer>
    </Modal>

    {/* Add Delete Selected Modal */}
    <Modal show={showDeleteSelectedModal} onHide={() => setShowDeleteSelectedModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete Selected</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete {selectedSalesIds.length} selected sale{selectedSalesIds.length > 1 ? 's' : ''}?
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
            
              for (let i = 0; i < selectedSalesIds.length; i++) {
                const id = selectedSalesIds[i];
                await axios.delete(`http://localhost:3001/api/sales/${id}`);
                setDeleteProgress(Math.round(((i + 1) / selectedSalesIds.length) * 100));
              }
          
              setDeleteSuccess(true);
              setTimeout(() => setDeleteSuccess(false), 3000);
          
              fetchSales();
              setSelectedSalesIds([]);
              setCheckAll(false);
            } catch (err) {
              console.error(err);
              alert('Error deleting selected sales.');
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

    {/* Add New Customer Modal */}
    <Modal show={showAddCustomerModal} onHide={() => setShowAddCustomerModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Add Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <Form>
                <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentCustomer.name || ''}
                      onChange={(e) =>
                        setCurrentCustomer({ ...currentCustomer, name: e.target.value })
                      }
                    />
                </Form.Group>
                    
                <Form.Group>
                    <Form.Label>Nickname</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentCustomer.nickname || ''}
                      onChange={(e) =>
                        setCurrentCustomer({ ...currentCustomer, nickname: e.target.value })
                      }
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentCustomer.phone || ''}
                      onChange={(e) =>
                        setCurrentCustomer({ ...currentCustomer, phone: e.target.value })
                      }
                    />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentCustomer.address || ''}
                      onChange={(e) =>
                        setCurrentCustomer({ ...currentCustomer, address: e.target.value })
                      }
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Landmark</Form.Label>
                    <Form.Control
                      type="text"
                      value={currentCustomer.landmark || ''}
                      onChange={(e) =>
                        setCurrentCustomer({ ...currentCustomer, landmark: e.target.value })
                      }
                    />
                </Form.Group>

      <Form.Group>
        <Form.Label>Frequency</Form.Label>
        <Form.Control
          type="number"
          value={currentCustomer.frequency || ''}
          onChange={(e) =>
            setCurrentCustomer({ ...currentCustomer, frequency: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Birthday</Form.Label>
        <Form.Control
          type="date"
          value={currentCustomer.birthday || ''}
          onChange={(e) =>
            setCurrentCustomer({ ...currentCustomer, birthday: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Last Transaction Date</Form.Label>
        <Form.Control
          type="date"
          value={currentCustomer.lastTransactionDate || ''}
          onChange={(e) =>
            setCurrentCustomer({
              ...currentCustomer,
              lastTransactionDate: e.target.value,
            })
          }
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Remarks</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={currentCustomer.remarks || ''}
          onChange={(e) =>
            setCurrentCustomer({ ...currentCustomer, remarks: e.target.value })
          }
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowAddCustomerModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleAddCustomer}>
      Save
    </Button>
  </Modal.Footer>
    </Modal>

<Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Success</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>{successMessage}</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="primary" onClick={() => {
  setShowSuccessModal(false);
  fetchSales(); // refresh when modal is closed
}}>
  OK
</Button>
  </Modal.Footer>
</Modal>

             


    </div>
  );
}

export default Sales;

/*
2025-07-18;John Cruz;Delivery;Refill (Slim 5gal);3;75;Cash;Paid;z2,S001;Morning delivery
2025-07-18;Maria Santos;Walk-in;Refill (Round 5gal);2;50;GCash;Paid;z1,S002;Regular customer
2025-07-18;Alex Dela Cruz;Delivery;New (Slim 5gal);1;200;Cash;Paid;S003;First time order
2025-07-18;Jenny Lopez;Walk-in;New (Round 5gal);1;220;Cash;Paid;z1;Bought new round container
2025-07-18;Mark Reyes;Delivery;Refill (Slim 5gal);5;125;GCash;Paid;z3,S004,S005;Monthly refill
2025-07-18;Louie Mendoza;Walk-in;Refill (Round 5gal);4;100;Cash;Paid;z2,S006,S007;Walk-in refill
2025-07-18;Cathy Villanueva;Delivery;Plan A - Standard Plan;1;350;GCash;Paid;;Subscribed to Plan A
2025-07-18;Ryan Tan;Walk-in;Plan B - Family Plan;1;500;Cash;Paid;;Subscribed to Plan B
2025-07-18;Mikaela Lim;Delivery;Big Cap;2;40;Cash;Paid;;Bought extra caps
2025-07-18;Chris Uy;Walk-in;Small Cap;3;30;GCash;Paid;;Bought small caps
2025-07-18;Daryl Ong;Delivery;Faucet;1;50;Cash;Paid;;Bought faucet
2025-07-18;Shiela Gomez;Walk-in;Bottled Water (500mL);10;150;GCash;Paid;;Bought bottled water
2025-07-18;Aaron Perez;Delivery;Bottled Water (1000mL);5;125;Cash;Paid;;Ordered bottled water
2025-07-18;Regine Velasquez;Walk-in;Dispenser;1;1200;GCash;Paid;;Bought dispenser
2025-07-18;Janine Gutierrez;Delivery;Refill (Slim 5gal);2;50;Cash;Paid;z1,S008;Regular delivery
2025-07-18;Enrique Gil;Walk-in;New (Slim 5gal);1;200;Cash;Paid;S009;Bought new slim container
2025-07-18;Liza Soberano;Delivery;Plan C - Business Plan;1;800;GCash;Paid;;Subscribed to Plan C
2025-07-18;Daniel Padilla;Walk-in;Plan D - Enterprise Plan;1;1500;Cash;Paid;;Subscribed to Plan D
2025-07-18;Kathryn Bernardo;Delivery;Plan E - Custom Plan;1;2000;GCash;Paid;;Subscribed to Plan E
2025-07-18;Piolo Pascual;Walk-in;Refill (Round 5gal);3;75;Cash;Paid;z2,S010;Walk-in refill
2025-07-19;NoRecord;Delivery;Refill (Slim 5gal);3;75;Cash;Paid;z2,S001,S002;First delivery this week
2025-07-18;Maria Santos;Walk-in;Refill (Round 5gal);2;50;GCash;Paid;z1,S003;Bought bottled water
2025-07-17;Pedro Reyes;Delivery;Dispenser;1;25;Cash;Unpaid;S004;Pending payment

*/