import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { isWithinInterval, parseISO } from "date-fns";
import ColoredSelect from "../components/ColoredSelect";

import AddEditSalesModal from "../components/modals/AddEditSalesModal";
import AddMultiSalesModal from "../components/modals/AddMultiSalesModal";
import AddEditCustomerModal from "../components/modals/AddEditCustomerModal";

import {
  itemOptions,
  itemColors,
  typesOptions,
  typeColors,
  paymentMethodOptions,
  paymentMethodColors,
  statusOption,
  statusColors,
} from "../constants/salesConstants";

function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [containers, setContainers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddEditSalesModal, setShowAddEditSalesModal] = useState(false);
  const [showAddMultiSalesModal, setShowAddMultiSalesModal] = useState(false);
  const [showAddEditCustomerModal, setShowAddEditCustomerModal] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState(false); // set false by default, true if testing
  const [selectedSalesIds, setSelectedSalesIds] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [editedSales, setEditedSales] = useState({});
  const [editableSales, setEditableSales] = useState([]);

  const [currentSale, setCurrentSale] = useState({
    date: new Date().toISOString().split("T")[0],
    customerId: "",
    containerId: "",
    type: "Delivery",
    item: "",
    quantity: 1,
    pricePerUnit: 0,
    totalAmount: 0,
    paymentMethod: "Cash",
    status: "Paid",
    remarks: "",
  });

  const [saleToEditId, setSaleToEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);

  const [currentSaleId, setCurrentSaleId] = useState(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState({
    name: "",
    nickname: "",
    phone: "",
    address: "",
    landmark: "",
    birthday: "",
    remarks: "",
  });

  // Build unique date pages
  // ✅ Build unique date pages only when sales changes
  const datePages = useMemo(() => {
    return [...new Set(sales.map((s) => new Date(s.date).toDateString()))].sort(
      (a, b) => new Date(a) - new Date(b)
    );
  }, [sales]);

  // ✅ State for current page
  const [currentPage, setCurrentPage] = useState(0);

  // ✅ Sync currentPage whenever datePages updates
  useEffect(() => {
    if (datePages.length > 0) {
      setCurrentPage(datePages.length - 1); // jump to last page
    }
  }, [datePages]);

  // ✅ Compute visible sales
  const visibleSales = useMemo(() => {
    return sales
      .filter((s) => {
        const saleDate = new Date(s.date);

        // Range filter takes priority
        if (range.from && range.to) {
          return saleDate >= range.from && saleDate <= range.to;
        }

        // Otherwise use datePages
        if (datePages.length > 0) {
          const currentDate = datePages[currentPage];
          if (currentDate) {
            return saleDate.toDateString() === currentDate;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [sales, range, datePages, currentPage]);

  // ===============================
  // LOAD SALES & CUSTOMERS
  // ===============================

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
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/customers`
      );
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContainers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/inventory`
      );
      setContainers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveEditedSales = async () => {
    const updates = Object.values(editedSales);
    try {
      await Promise.all(
        updates.map((sale) =>
          axios.put(
            `${process.env.REACT_APP_API_URL}/api/sales/${sale._id}`,
            sale
          )
        )
      );
      alert("Changes saved!");
      setEditedSales({}); // clear after save
      fetchSales(); // fetch to update the record
      setEditMode(!editMode); // exits edit mode
    } catch (err) {
      console.error("Error saving edits:", err);
    }
  };
  // ===============================
  // FOR SALES SUMMARY TABLE
  // ===============================
  const itemOrder = [
    "Refill (Slim 5gal)",
    "Refill (Round 5gal)",
    "Bottled Water (500mL)",
    "Bottled Water (1000mL)",
  ];

  const { summaryData, freeCount, grandTotal } = useMemo(() => {
    const totals = {};
    let free = 0;

    visibleSales.forEach((s) => {
      const type = s.item || s.type || "Other";
      const qty = Number(s.quantity) || 0;
      const amount = Number(s.totalAmount ?? s.amount) || 0;

      if (s.paymentMethod === "Free") {
        free += qty; // count free quantity
        return; // skip adding to totals
      }

      if (!totals[type]) totals[type] = { type, quantity: 0, amount: 0 };
      totals[type].quantity += qty;
      totals[type].amount += amount;
    });

    const arr = Object.values(totals);

    // sort by custom order, then alphabetically for "rest"
    arr.sort((a, b) => {
      const ai = itemOrder.indexOf(a.type);
      const bi = itemOrder.indexOf(b.type);
      if (ai === -1 && bi === -1) return a.type.localeCompare(b.type);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    const totalAmount = arr.reduce((sum, r) => sum + r.amount, 0);

    return { summaryData: arr, freeCount: free, grandTotal: totalAmount };
  }, [visibleSales]);

  // ===============================
  //    useEffect
  // ===============================

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchContainers(); // load containers
  }, []);

  useEffect(() => {
    //console.log("editedSales updated:", editedSales);
  }, [editedSales]); // Runs every time editedSales changes

  // ===============================
  // HANDLERS
  // ===============================
  const handleAddEditModal = (s = null) => {
    if (s) {
      //edit mode
      setSaleToEditId(s._id);
      setCurrentSale({
        ...s,
        date: s.date
          ? new Date(s.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
      setIsEditing(true);
    } else {
      //add mode
      setCurrentSale({
        name: "",
        date: new Date().toISOString().split("T")[0],
        customerId: "",
        containerId: "",
        type: "Delivery",
        item: "Refill (Slim 5gal)",
        quantity: 0,
        pricePerUnit: 0,
        totalAmount: 0,
        paymentMethod: "Cash",
        status: "Paid",
        remarks: "",
      });
    }
    setShowAddEditSalesModal(true);
  };

  // const handleShowEditModal = (sale) => {
  //   setShowModal(true);
  // };

  // const handleSaveSale = async () => {
  //   try {
  //     const calculatedPricePerUnit =
  //       currentSale.totalAmount && currentSale.quantity
  //         ? currentSale.totalAmount / currentSale.quantity
  //         : 0;

  //     const saleToSave = {
  //       ...currentSale,
  //       pricePerUnit: calculatedPricePerUnit,
  //       customerId: currentSale.customerId || null,
  //       customerName: currentSale.customerName || "",
  //       customerContainerQty: currentSale.customerContainerQty || 0,
  //     };

  //     if (isEditing) {
  //       await axios.put(
  //         `${process.env.REACT_APP_API_URL}/api/sales/${saleToEditId}`,
  //         saleToSave
  //       );
  //     } else {
  //       await axios.post(
  //         `${process.env.REACT_APP_API_URL}/api/sales`,
  //         saleToSave
  //       );
  //     }

  //     setShowModal(false);
  //     fetchSales();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleDeleteClick = (sale) => {
    setSaleToDelete(sale);
    setShowDeleteModal(true);
  };

  const handleDeleteSale = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/sales/${saleToDelete._id}`
      );
      setShowDeleteModal(false);
      setSaleToDelete(null);
      fetchSales();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomer = (s = null) => {
    if (s) {
      // Add mode
      setIsEditing(false);
      setCurrentSaleId(s._id);
      setCurrentCustomer({
        name: s.customerName,
        nickname: "",
        phone: "",
        address: "",
        landmark: "",
        birthday: "",
        remarks: "",
      });
    }
    setShowAddEditCustomerModal(true);
    fetchSales();
  };

  const handleAddCustomerOLD = async () => {
    try {
      // 1. Create the new customer
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/customers`,
        currentCustomer
      );
      const newCustomer = res.data;

      // Add to customers list immediately
      setCustomers((prev) => [...prev, newCustomer]);

      // Link to the current sale row in editedSales
      //handleEditedSales(currentSaleId, "customerId", newCustomer._id);
      //handleEditedSales(currentSaleId, "customerName", newCustomer.name);

      // 2. Update the sale with new customerId and customerName
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/sales/${currentSaleId}`,
        {
          customerId: newCustomer._id,
          customerName: newCustomer.name,
        }
      );

      // 3. Fetch the fully populated updated sale
      const populatedSaleRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/sales/${currentSaleId}`
      );
      const populatedSale = populatedSaleRes.data;

      // 4. Update sales state locally to reflect immediately
      setSales((prevSales) =>
        prevSales.map((s) => (s._id === populatedSale._id ? populatedSale : s))
      );
      // 🔁 Re-fetch inventory to update name link
      fetchSales();

      // 5. Close modal and reset

      setShowAddEditCustomerModal(false);
      setCurrentCustomer({});
      setCurrentSaleId(null);

      setSuccessMessage("Customer added and sale updated!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert("Error adding customer.");
    }
  };

  const handleSaleDateChange = (saleId, newDate) => {
    const updatedSales = editableSales.map((sale) =>
      sale._id === saleId ? { ...sale, date: newDate } : sale
    );
    setEditableSales(updatedSales);
  };

  const handleSaveClick = async () => {
    try {
      const updatePromises = Object.entries(editedSales).map(
        ([id, editedSale]) =>
          axios.put(
            `${process.env.REACT_APP_API_URL}/api/sales/${id}`,
            editedSale
          )
      );

      const responses = await Promise.all(updatePromises);
      console.log(
        "All sales updated:",
        responses.map((r) => r.data)
      );

      setEditMode(false); // exit edit mode after all are done
      fetchSales(); // refresh sales list
    } catch (err) {
      console.error("Failed to update sales:", err);
    }
  };

  const handleEditedSales = (saleId, field, value, originalSale) => {
    //console.log(`Editing sale _id:${saleId} | Field: ${field} | New Value: ${value}`);

    setEditedSales((prev) => {
      const previous = prev[saleId] || originalSale;

      const updated = {
        ...previous,
        [field]: value,
      };

      // Recalculate pricePerUnit if relevant fields are present
      const quantity = field === "quantity" ? value : previous.quantity;
      const totalAmount =
        field === "totalAmount" ? value : previous.totalAmount;

      if (quantity && totalAmount && quantity !== 0) {
        updated.pricePerUnit = totalAmount / quantity;
      }

      return {
        ...prev,
        [saleId]: updated,
      };
    });
  };

  // ===============================
  //            RENDER
  // ===============================
  return (
    <div style={{ padding: "20px" }}>
      <h2>Sales</h2>
      {/* Top Controls Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        {/* LEFT SIDE - Action Buttons */}
        <div className="d-flex gap-2 flex-wrap">
          {/* Add Sales Button*/}
          <Button variant="primary" onClick={() => handleAddEditModal()}>
            Add Sale
          </Button>

          {/* Add Multiple Sales Button*/}
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddMultiSalesModal(true);
              // setImportProgress(0); // reset progress
              // setShowMultiAddModal(true);
            }}
          >
            Add Multiple Sales
          </Button>

          {/* Edit Mode Buttons*/}
          <Button
            variant={editMode ? "danger" : "warning"}
            className="ms-2"
            onClick={() => {
              setEditMode(!editMode);
              setSelectedSalesIds([]);
              setCheckAll(false);
              setEditedSales([]);
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
              {deleting
                ? "Deleting..."
                : `Delete Selected (${selectedSalesIds.length})`}
            </Button>
          )}

          {deleting && (
            <div className="mt-3" style={{ width: "300px" }}>
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

          {/* Save Changes Button*/}
          {editMode && (
            <button onClick={handleSaveClick} className="btn btn-warning">
              Save Changes
            </button>
          )}
        </div>

        {/* RIGHT SIDE - Page + Date Filter 
        <div className="d-flex align-items-center">
          //Date Pages Controls
          <div className="d-flex align-items-center me-3">
            <Button
              variant="secondary"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="me-2"
            >
              Previous
            </Button>

            //insert date filter date here instead of this span
            <span>
              {datePages[currentPage]
                ? new Date(datePages[currentPage]).toLocaleDateString()
                : "No Date"}
            </span>

            <Button
              variant="secondary"
              disabled={currentPage === datePages.length - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="ms-2"
            >
              Next
            </Button>
          </div>

          //Date Filter
          <div style={{ position: "relative" }}>
            <Button
              variant="outline-secondary"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              {range?.from && range?.to
                ? `Filtered: ${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                : "Filter by Date"}
            </Button>

            {showDatePicker && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 1000,
                  top: "100%",
                  right: 0,
                  marginTop: "5px",
                  background: "white",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  borderRadius: "6px",
                  padding: "8px",
                }}
              >
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={(range) => {
                    if (range) setRange(range);
                  }}
                  numberOfMonths={1}
                  defaultMonth={range?.from || undefined}
                />
              </div>
            )}

            {(range.from || range.to) && (
              <Button
                variant="outline-danger"
                className="ms-2 mt-2 mt-md-0"
                onClick={() => setRange({ from: undefined, to: undefined })}
              >
                Clear
              </Button>
            )}
          </div>
        </div>*/}

        {/* Date Navigation with Range Picker */}
        <div className="d-flex align-items-center">
          {/* Previous Button */}
          <Button
            variant="secondary"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="me-2"
          >
            Previous
          </Button>

          {/* Current Date Label (opens range picker) */}
          <div style={{ position: "relative" }}>
            <Button
              variant="outline-secondary"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              {range?.from && range?.to
                ? `Filtered: ${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                : datePages[currentPage]
                ? new Date(datePages[currentPage]).toLocaleDateString()
                : "No Date"}
            </Button>

            {showDatePicker && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 1000,
                  top: "100%",
                  right: 0,
                  marginTop: "5px",
                  background: "white",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  borderRadius: "6px",
                  padding: "8px",
                }}
              >
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={(range) => {
                    if (range) setRange(range);
                  }}
                  numberOfMonths={1}
                  defaultMonth={range?.from || undefined}
                />
              </div>
            )}
          </div>

          {/* Next Button */}
          <Button
            variant="secondary"
            disabled={currentPage === datePages.length - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="ms-2"
          >
            Next
          </Button>

          {/* Clear Filter Button */}
          {(range?.from || range?.to) && (
            <Button
              variant="outline-danger"
              className="ms-2"
              onClick={() => setRange({ from: undefined, to: undefined })}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <Button
        variant="outline-primary"
        className="ms-2 mt-2 mt-md-0"
        onClick={() => console.log(visibleSales)}
      >
        Test Visible Records
      </Button>

      {/* ////////////////////////////// */}
      {/* /////       TABLES       ///// */}
      {/* ////////////////////////////// */}

      {/* ////////////////////////////////// */}
      {/* ///    SALES SUMMARY TABLE     /// */}
      {/* ////////////////////////////////// */}
      <table className="table table-sm mb-3">
        <thead>
          <tr>
            <th>Item</th>
            <th className="text-end">Quantity</th>
            <th className="text-end">Amount</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((row) => (
            <tr key={row.type}>
              <td>{row.type}</td>
              <td className="text-end">{row.quantity}</td>
              <td className="text-end">
                ₱{row.amount.toLocaleString("en-PH")}
              </td>
            </tr>
          ))}

          {freeCount > 0 && (
            <tr>
              <td>Free</td>
              <td className="text-end">{freeCount}</td>
              <td className="text-end">—</td>
            </tr>
          )}

          <tr>
            <td colSpan={2} className="text-end fw-bold">
              Total Sales:
            </td>
            <td className="text-end fw-bold">
              ₱{grandTotal.toLocaleString("en-PH")}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ////////////////////////////////// */}
      {/* ///    SALES RECORDS TABLE     /// */}
      {/* ////////////////////////////////// */}
      <table className="table table-hover mt-3">
        <thead>
          <tr>
            {editMode && (
              <th>
                <Form.Check
                  type="checkbox"
                  checked={
                    checkAll
                    // filteredSales.length > 0 &&
                    // filteredSales.every((s) => selectedSalesIds.includes(s._id))
                  }
                  onChange={(e) => {
                    setCheckAll(e.target.checked);
                    // if (e.target.checked) {
                    //   //setSelectedSalesIds(visibleSalesIds);
                    // } else {
                    //   setSelectedSalesIds([]);
                    // }
                    if (e.target.checked) {
                      // 👇 only the visible/filtered sales
                      const visibleSalesIds = visibleSales.map((s) => s._id);
                      console.log("Visible Sales IDs:", visibleSalesIds);
                      setSelectedSalesIds(visibleSalesIds);
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
            <th>Total Amount</th>
            <th>Payment</th>
            <th>Status</th>
            {editMode && <th>Customer Container Quantity</th>}
            <th>Containers</th>
            <th>Remarks</th>
            {editMode && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {/* {sales
            .filter((s) => {
              const saleDate = new Date(s.date);

              // ✅ If range is set, only apply range filter
              if (range.from && range.to) {
                return saleDate >= range.from && saleDate <= range.to;
              }

              // ✅ Otherwise, apply datePages filter
              if (datePages && datePages.length > 0) {
                const currentDate = datePages[currentPage];
                if (currentDate) {
                  return saleDate.toDateString() === currentDate;
                }
              }

              return true; // no filters applied
            })

            .sort((a, b) => new Date(a.date) - new Date(b.date))
            //* .sort((a, b) => {
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

            .map((s) => {
              const isChecked = selectedSalesIds.includes(s._id); */}
          {visibleSales.map((s) => {
            const isChecked = selectedSalesIds.includes(s._id);

            return (
              <tr key={s._id}>
                {/* =====   CHECK BOXES   =====*/}
                {editMode && (
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={isChecked}
                      // onChange={(e) => {
                      //   if (e.target.checked) {
                      //     const newSelected = [...selectedSalesIds, s._id];
                      //     setSelectedSalesIds(newSelected);
                      //     if (newSelected.length === sales.length) {
                      //       setCheckAll(true);
                      //     }
                      //   } else {
                      //     const newSelected = selectedSalesIds.filter(
                      //       (id) => id !== s._id
                      //     );
                      //     setSelectedSalesIds(newSelected);
                      //     setCheckAll(false);
                      //   }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSalesIds([...selectedSalesIds, s._id]);
                        } else {
                          setSelectedSalesIds(
                            selectedSalesIds.filter((id) => id !== s._id)
                          );
                        }
                      }}
                    />
                  </td>
                )}
                {/* =====   DATE   =====*/}
                <td>
                  {editMode ? (
                    <input
                      type="date"
                      value={
                        new Date(editedSales[s._id]?.date || s.date)
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setEditedSales((prev) => ({
                          ...prev,
                          [s._id]: {
                            ...prev[s._id],
                            date: newDate,
                          },
                        }));
                      }}
                    />
                  ) : (
                    new Date(s.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    })
                  )}
                </td>
                {/* =====   CUSTOMER NAME   =====*/}
                <td>
                  {editMode ? (
                    <Typeahead
                      id={`customer-typeahead-${s._id}`}
                      labelKey="name"
                      options={customers}
                      placeholder="Select customer..."
                      allowNew
                      newSelectionPrefix="New: "
                      defaultInputValue={(() => {
                        const edited = editedSales[s._id];

                        // Prefer edited values if available, otherwise use original sale values
                        const customerId = edited?.customerId ?? s.customerId;
                        const customerName =
                          edited?.customerName ?? s.customerName;

                        // Try to find in customers list
                        const customer = customerId
                          ? customers.find((c) => c._id === customerId)
                          : null;

                        // Priority: customer object name → fallback to stored name → empty string
                        return customer?.name || customerName || "";
                      })()}
                      onChange={(selected) => {
                        if (selected.length > 0) {
                          const sel = selected[0];
                          if (sel._id) {
                            // console.log("1");
                            handleEditedSales(s._id, "customerId", sel._id, s);
                            handleEditedSales(
                              s._id,
                              "customerName",
                              sel.name,
                              s
                            );
                          } else if (sel.name) {
                            // New typed name
                            // console.log("2. New typed name");
                            setCurrentSaleId(s._id);
                            setCurrentCustomer((prev) => ({
                              ...prev,
                              name: sel.name,
                            })); // pre-fill name in modal
                            setShowAddCustomerModal(true);

                            // Temporarily store null ID but keep the typed name in editedSales
                            handleEditedSales(s._id, "customerId", null, s);
                            handleEditedSales(
                              s._id,
                              "customerName",
                              sel.name,
                              s
                            );
                          } else if (typeof sel === "string") {
                            // Typed raw string (edge case)
                            // console.log("3");
                            handleEditedSales(s._id, "customerId", null, s);
                            handleEditedSales(s._id, "customerName", sel, s);
                          }
                        } else {
                          // If cleared selection
                          // console.log("4");
                          handleEditedSales(s._id, "customerId", null, s);
                          handleEditedSales(s._id, "customerName", "", s);
                        }
                      }}
                    />
                  ) : (
                    (() => {
                      const customer = customers.find(
                        (c) => c._id === (s.customerId?._id || s.customerId)
                      );
                      if (customer) {
                        return (
                          <a
                            href={`/customers/${customer._id}/profile`}
                            style={{ textDecoration: "underline" }}
                          >
                            {customer.name}
                          </a>
                        );
                      } else {
                        return s.customerName || "-";
                      }
                    })()
                  )}
                </td>
                {/* =====   TYPE   =====*/}
                <td>
                  {editMode ? (
                    <ColoredSelect
                      options={typesOptions}
                      defaultValue={
                        typesOptions.find(
                          (opt) =>
                            opt.value === (editedSales[s._id]?.type || s.type)
                        ) || null
                      }
                      placeholder="Select..." // only shows if defaultValue is null
                      onChange={(selected) => {
                        // console.log(`Selected: ${selected.value}`);
                        // console.log(
                        //   `Setting selected value [${selected.value}] to _id:${s._id}, customerName:${s.customerName}, type:${s.type}`
                        // );
                        handleEditedSales(s._id, "type", selected.value, s);
                      }}
                    />
                  ) : (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: typeColors[s.type]?.bgColor || "#ccc", // default gray if not found
                        color: typeColors[s.type]?.textColor || "#000",
                        borderRadius: "15px",
                        padding: "6px 10px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {s.type}
                    </span>
                  )}
                </td>
                {/* =====   ITEM   =====*/}
                <td>
                  {editMode ? (
                    <ColoredSelect
                      options={itemOptions}
                      defaultValue={
                        itemOptions.find(
                          (opt) =>
                            opt.value === (editedSales[s._id]?.item || s.item)
                        ) || null
                      }
                      placeholder="Select..." // only shows if defaultValue is null
                      onChange={(selected) => {
                        // console.log(`Selected: ${selected.value}`);
                        // console.log(
                        //   `Setting selected value [${selected.value}] to _id:${s._id}, customerName:${s.customerName}, item:${s.item}`
                        // );
                        handleEditedSales(s._id, "item", selected.value, s);
                      }}
                    />
                  ) : (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: itemColors[s.item] || "#ccc", // your custom color
                        color: "white", // text color
                        borderRadius: "15px",
                        padding: "6px 10px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {s.item}
                    </span>
                  )}
                </td>
                {/* =====   QUANTITY   =====*/}
                <td>
                  {editMode ? (
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={editedSales[s._id]?.quantity ?? s.quantity}
                      onChange={(e) =>
                        handleEditedSales(
                          s._id,
                          "quantity",
                          Number(e.target.value),
                          s
                        )
                      }
                      style={{ width: "60px", height: "1em" }} // optional styling
                    />
                  ) : (
                    s.quantity
                  )}
                </td>
                {/* =====   PRICE PER UNIT   =====*/}
                <td className="text-muted fst-italic">
                  {" "}
                  ₱
                  {(editedSales[s._id]?.pricePerUnit ?? s.pricePerUnit).toFixed(
                    2
                  )}
                </td>
                {/* =====   TOTAL AMOUNT   =====*/}
                <td>
                  {editMode ? (
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={editedSales[s._id]?.totalAmount ?? s.totalAmount}
                      onChange={(e) =>
                        handleEditedSales(
                          s._id,
                          "totalAmount",
                          Number(e.target.value),
                          s
                        )
                      }
                      style={{ width: "60px", height: "1em" }} // optional styling
                    />
                  ) : (
                    <>
                      ₱
                      {Number(s.totalAmount).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </>
                  )}
                </td>
                {/* =====   PAYMENT METHOD   =====*/}
                <td>
                  {editMode ? (
                    <ColoredSelect
                      options={paymentMethodOptions}
                      defaultValue={
                        paymentMethodOptions.find(
                          (opt) =>
                            opt.value ===
                            (editedSales[s._id]?.paymentMethod ||
                              s.paymentMethod)
                        ) || null
                      }
                      placeholder="Select..." // only shows if defaultValue is null
                      onChange={(selected) => {
                        // console.log(`Selected: ${selected.value}`);
                        // console.log(
                        //   `Setting selected value [${selected.value}] to _id:${s._id}, customerName:${s.customerName}, paymentMethod:${s.paymentMethod}`
                        // );
                        handleEditedSales(
                          s._id,
                          "paymentMethod",
                          selected.value,
                          s
                        );
                      }}
                    />
                  ) : (
                    <span
                      className="badge"
                      style={{
                        backgroundColor:
                          paymentMethodColors[s.paymentMethod] || "#ccc", // your custom color
                        color: "black", // text color
                        borderRadius: "15px",
                        padding: "6px 10px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {s.paymentMethod}
                    </span>
                  )}
                </td>
                {/* =====   STATUS   =====*/}
                <td>
                  {editMode ? (
                    <ColoredSelect
                      options={statusOption}
                      defaultValue={
                        statusOption.find(
                          (opt) =>
                            opt.value ===
                            (editedSales[s._id]?.status || s.status)
                        ) || null
                      }
                      placeholder="Select..." // only shows if defaultValue is null
                      onChange={(selected) => {
                        // console.log(`Selected: ${selected.value}`);
                        // console.log(
                        //   `Setting selected value [${selected.value}] to _id:${s._id}, customerName:${s.customerName}, statusOption:${s.status}`
                        // );
                        handleEditedSales(s._id, "status", selected.value, s);
                      }}
                    />
                  ) : (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: statusColors[s.status] || "#ccc", // your custom color
                        color: "black", // text color
                        borderRadius: "15px",
                        padding: "6px 10px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {s.status}
                    </span>
                  )}
                </td>
                {/* =====   CUSTOMER OWNED CONTAINERS   =====*/}
                {editMode && (
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={
                        editedSales[s._id]?.customerContainerQty ??
                        s.customerContainerQty
                      }
                      onChange={(e) =>
                        handleEditedSales(
                          s._id,
                          "customerContainerQty",
                          Number(e.target.value),
                          s
                        )
                      }
                      style={{ width: "60px", height: "1em" }} // optional styling
                    />
                  </td>
                )}
                {/* =====   CONTAINERS   =====*/}
                <td>
                  {editMode ? (
                    <Typeahead
                      id={`container-typeahead-${s._id}`}
                      labelKey={(option) => `${option.id} - ${option.name}`}
                      options={containers}
                      placeholder="Select containers..."
                      multiple
                      selected={containers.filter((c) =>
                        (
                          editedSales[s._id]?.containerIds ||
                          s.containerIds ||
                          []
                        ).some((id) =>
                          typeof id === "object"
                            ? id._id === c._id
                            : id === c._id
                        )
                      )}
                      onChange={(selected) => {
                        setEditedSales((prev) => ({
                          ...prev,
                          [s._id]: {
                            ...(prev[s._id] || s),
                            containerIds: selected.map((c) => c._id),
                          },
                        }));
                      }}
                    />
                  ) : (
                    <>
                      {/* Display owned containers if qty > 0 */}
                      {s.customerContainerQty > 0 && (
                        <span>
                          z{s.customerContainerQty}
                          {s.containerIds && s.containerIds.length > 0
                            ? ", "
                            : ""}
                        </span>
                      )}

                      {/* Display borrowed containers as clickable links */}
                      {s.containerIds && s.containerIds.length > 0
                        ? s.containerIds.map((c, index) => {
                            const cid = c._id || c; // handle object or ID
                            const container = containers.find(
                              (cont) => cont._id === cid
                            );
                            return container ? (
                              <span key={cid}>
                                <a
                                  href={`/inventory/${container._id}`}
                                  style={{ textDecoration: "underline" }}
                                >
                                  {container.name}
                                </a>
                                {index < s.containerIds.length - 1 ? ", " : ""}
                              </span>
                            ) : (
                              <span key={cid}>
                                {cid}
                                {index < s.containerIds.length - 1 ? ", " : ""}
                              </span>
                            );
                          })
                        : (!s.customerContainerQty ||
                            s.customerContainerQty === 0) &&
                          "-"}
                    </>
                  )}
                </td>
                {/* =====   REMARKS   =====*/}
                <td>
                  {editMode ? (
                    <textarea
                      className="form-control form-control-sm fst-italic"
                      value={editedSales[s._id]?.remarks ?? s.remarks}
                      onChange={(e) =>
                        handleEditedSales(s._id, "remarks", e.target.value, s)
                      }
                      rows={2}
                      style={{ minWidth: "100px", fontStyle: "italic" }}
                    />
                  ) : (
                    <span className="fst-italic">{s.remarks}</span>
                  )}
                </td>
                {/* =====   ACTIONS   =====*/}
                {editMode && (
                  <>
                    <td>
                      {/* =====   ACTION - ADD NEW CUSTOMER BUTTON  =====*/}
                      {!customers.some(
                        (c) =>
                          c.name.toLowerCase() === s.customerName.toLowerCase()
                      ) && (
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
                      {/* =====   ACTION - EDIT BUTTON  =====*/}
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleAddEditModal(s)}
                      >
                        <FaEdit color="orange" />
                      </Button>
                      {/* =====   ACTION - DELETE BUTTON  =====*/}
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleDeleteClick(s)}
                      >
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

      {/* AddEditSalesModal */}
      <AddEditSalesModal
        show={showAddEditSalesModal}
        onHide={() => setShowAddEditSalesModal(false)}
        currentSale={currentSale}
        setCurrentSale={setCurrentSale}
        isEditing={isEditing}
        fetchSales={fetchSales}
        customers={customers}
        containers={containers}
        setSales={sales}
      />

      {/* Add New Customer Modal 
      
      <Modal
        show={showAddCustomerModal}
        onHide={() => setShowAddCustomerModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={currentCustomer.name || ""}
                onChange={(e) =>
                  setCurrentCustomer({
                    ...currentCustomer,
                    name: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Nickname</Form.Label>
              <Form.Control
                type="text"
                value={currentCustomer.nickname || ""}
                onChange={(e) =>
                  setCurrentCustomer({
                    ...currentCustomer,
                    nickname: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={currentCustomer.phone || ""}
                onChange={(e) =>
                  setCurrentCustomer({
                    ...currentCustomer,
                    phone: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={currentCustomer.address || ""}
                onChange={(e) =>
                  setCurrentCustomer({
                    ...currentCustomer,
                    address: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Landmark</Form.Label>
              <Form.Control
                type="text"
                value={currentCustomer.landmark || ""}
                onChange={(e) =>
                  setCurrentCustomer({
                    ...currentCustomer,
                    landmark: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Frequency</Form.Label>
              <Form.Control
                type="number"
                value={currentCustomer.frequency || ""}
                onChange={(e) =>
                  setCurrentCustomer({
                    ...currentCustomer,
                    frequency: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Birthday</Form.Label>
              <Form.Control
                type="date"
                value={currentCustomer.birthday || ""}
                onChange={(e) =>
                  setCurrentCustomer({
                    ...currentCustomer,
                    birthday: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Last Transaction Date</Form.Label>
              <Form.Control
                type="date"
                value={currentCustomer.lastTransactionDate || ""}
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
                value={currentCustomer.remarks || ""}
                onChange={(e) =>
                  setCurrentCustomer({
                    ...currentCustomer,
                    remarks: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddCustomerModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCustomerOLD}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
*/}

      <AddEditCustomerModal
        show={showAddCustomerModal}
        onHide={() => setShowAddCustomerModal(false)}
        fetchCustomers={fetchCustomers}
        fetchSales={fetchSales}
        currentCustomer={currentCustomer}
        setCurrentCustomer={setCurrentCustomer}
        isEditing={false}
        fromSale={true}
        currentSaleId={currentSaleId}
        setSales={setSales}
        setCustomers={setCustomers}
        setSuccessMessage={setSuccessMessage}
        setShowSuccessModal={setShowSuccessModal}
      />

      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{successMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setShowSuccessModal(false);
              setShowAddCustomerModal(false);
              setEditMode(false);
              fetchSales(); // refresh when modal is closed
            }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Sale</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this sale?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteSale}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* AddMultiSalesModal */}
      <AddMultiSalesModal
        show={showAddMultiSalesModal}
        onHide={() => setShowAddMultiSalesModal(false)}
        fetchSales={fetchSales}
        containers={containers}
        customers={customers}
      />

      {/* Add Delete Selected Modal */}
      <Modal
        show={showDeleteSelectedModal}
        onHide={() => setShowDeleteSelectedModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Selected</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {selectedSalesIds.length} selected
          sale{selectedSalesIds.length > 1 ? "s" : ""}?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteSelectedModal(false)}
          >
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
                  await axios.delete(
                    `${process.env.REACT_APP_API_URL}/api/sales/${id}`
                  );
                  setDeleteProgress(
                    Math.round(((i + 1) / selectedSalesIds.length) * 100)
                  );
                }

                setDeleteSuccess(true);
                setTimeout(() => setDeleteSuccess(false), 3000);

                fetchSales();
                setSelectedSalesIds([]);
                setCheckAll(false);
              } catch (err) {
                console.error(err);
                alert("Error deleting selected sales.");
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

      {/* AddEditCustomerModal */}
      <AddEditCustomerModal
        show={showAddEditCustomerModal}
        onHide={() => setShowAddEditCustomerModal(false)}
        currentCustomer={currentCustomer}
        setCurrentCustomer={setCurrentCustomer}
        fetchCustomers={fetchCustomers}
        fetchSales={fetchSales}
        currentSaleId={currentSaleId}
      />
    </div>
  );
}

export default Sales;
