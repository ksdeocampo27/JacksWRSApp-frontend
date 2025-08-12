import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import Select from "react-select";
import ColoredSelect from "../components/ColoredSelect";

import AddEditExpenseModal from "../components/modals/AddEditExpensesModal";
import DeleteSelectedModal from "../components/modals/DeleteSelectedModal";
import AddMultiExpensesModal from "../components/modals/AddMultiExpensesModal";

import {
  categoryOptions,
  categoryColors,
  typesOptions,
  typeColors,
  unitOptions,
} from "../constants/expensesConstants";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [expenseToEditId, setExpenseToEditId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [checkAll, setCheckAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
  const [showAddEditExpensesModal, setShowAddEditExpensesModal] =
    useState(false);
  const [showAddMultiExpensesModal, setShowAddMultiExpensesModal] =
    useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [currentExpense, setCurrentExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "Operating Cost",
    type: "",
    store: "",
    quantity: "",
    unit: "",
    totalAmount: "",
    remarks: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/expenses`
      );
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================================
  //            HANDLERS
  // ================================
  const handleAddEditModal = (e = null) => {
    if (e) {
      // Edit mode
      setIsEditing(true);
      setExpenseToEditId(e._id);
      console.log(e);
      setCurrentExpense({
        ...e,
        date: e.date
          ? new Date(e.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      // Add mode
      setIsEditing(false);
      setCurrentExpense({
        date: new Date().toISOString().split("T")[0],
        description: "",
        category: "default",
        type: "default",
        store: "",
        quantity: 0,
        totalAmount: 0,
        remarks: "",
      });
    }

    setShowAddEditExpensesModal(true);
  };
  // ================================
  // RENDER JSX
  // ================================
  return (
    <div style={{ padding: "20px" }}>
      <h2>Expenses</h2>

      {/* ////////////////////////////// */}
      {/* /////      Buttons       ///// */}
      {/* ////////////////////////////// */}

      {/* Button - Add Expense Button*/}
      <Button variant="primary" onClick={() => handleAddEditModal()}>
        Add Expense
      </Button>

      {/* Button - Add Multiple Expenses Button */}
      <Button
        variant="secondary"
        className="ms-2"
        onClick={() => {
          setShowAddMultiExpensesModal(true);
        }}
      >
        Add Multiple Expenses
      </Button>

      {/* Button - Edit Mode Button*/}
      <Button
        variant={editMode ? "danger" : "warning"}
        className="ms-2"
        onClick={() => {
          setEditMode(!editMode);
          setSelectedIds([]);
          setCheckAll(false);
          //setEditedSales([]);
        }}
      >
        {editMode ? "Exit Edit Mode" : "Edit Mode"}
      </Button>

      {editMode && (
        <Button
          variant="secondary"
          className="ms-2"
          disabled={selectedIds.length === 0 || deleting}
          onClick={() => setShowDeleteSelectedModal(true)}
        >
          {deleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
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

      {/* ////////////////////////////// */}
      {/* /////       TABLE        ///// */}
      {/* ////////////////////////////// */}
      <table className="table table-hover mt-3">
        <thead>
          <tr>
            {editMode && (
              <th>
                <Form.Check
                  type="checkbox"
                  checked={checkAll}
                  onChange={(e) => {
                    const allIds = expenses.map((s) => s._id);
                    setCheckAll(e.target.checked);
                    if (e.target.checked) {
                      setSelectedIds(allIds);
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </th>
            )}
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>Store</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total Amount</th>
            <th>Remarks</th>
            {editMode && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {expenses
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((e) => {
              const isChecked = selectedIds.includes(e._id);
              return (
                <tr key={e._id}>
                  {/*======   CHECKBOXES   ======*/}
                  {editMode && (
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={isChecked}
                        onChange={(c) => {
                          if (c.target.checked) {
                            const newSelected = [...selectedIds, e._id];
                            setSelectedIds(newSelected);
                            if (newSelected.length === expenses.length) {
                              setCheckAll(true);
                            }
                          } else {
                            const newSelected = selectedIds.filter(
                              (id) => id !== e._id
                            );
                            setSelectedIds(newSelected);
                            setCheckAll(false);
                          }
                        }}
                      />
                    </td>
                  )}
                  {/*======   DATE   ======*/}
                  <td>
                    {" "}
                    {new Date(e.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  {/*======   DESCRIPTION   ======*/}
                  <td>{e.description}</td>
                  {/*======   CATEGORY   ======*/}
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor:
                          categoryColors[e.category]?.bgColor || "#ccc", // default gray if not found
                        color: categoryColors[e.category]?.textColor || "#000",
                        borderRadius: "15px",
                        padding: "6px 10px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {e.category}
                    </span>
                  </td>
                  {/*======   TYPE   ======*/}
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: typeColors[e.type]?.bgColor || "#ccc", //default gray if not found
                        color: typeColors[e.type]?.textColor || "#000", //default black
                        borderRadius: "15px",
                        padding: "6px 10px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {e.type}
                    </span>
                  </td>
                  {/*======   STORE   ======*/}
                  <td>{e.store}</td>
                  {/*======   QUANTITY   ======*/}
                   {e.quantity != null ? `${e.quantity} ${e?.unit || ""}` : "—"}
                  {/*======   UNIT PRICE   ======*/}
                  <td className="text-muted fst-italic">
                    ₱
                    {e.quantity ? (e.totalAmount / e.quantity).toFixed(2) : "—"}
                  </td>
                  {/*======   TOTAL AMOUNT   ======*/}
                  <td>
                    {e.totalAmount != null
                      ? `₱${Number(e.totalAmount).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "—"}
                  </td>
                  {/*======   REMARKS   ======*/}
                  <td className="fst-italic">{e.remarks}</td>
                  {/* =====   ACTION   =====*/}
                  {editMode && (
                    <>
                      <td>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            handleAddEditModal(e);
                          }}
                        >
                          <FaEdit color="orange" />
                        </Button>

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
      {/* /////       Modals       ///// */}
      {/* ////////////////////////////// */}

      {/* AddEditExpenseModal */}
      <AddEditExpenseModal
        show={showAddEditExpensesModal}
        onHide={() => setShowAddEditExpensesModal(false)}
        currentExpense={currentExpense}
        setCurrentExpense={setCurrentExpense}
        isEditing={isEditing}
        fetchExpenses={fetchExpenses}
      />

      {/* DeleteSelectedModal */}
      <DeleteSelectedModal
        show={showDeleteSelectedModal}
        onHide={() => setShowDeleteSelectedModal(false)}
        selectedIds={selectedIds}
        entityName="expense"
        deleteEndpoint="/api/expenses/"
        onDeleted={() => {
          fetchExpenses();
          setSelectedIds([]);
        }}
      />

      {/* AddMultiExpensesModal */}
      <AddMultiExpensesModal
        show={showAddMultiExpensesModal}
        onHide={() => setShowAddMultiExpensesModal(false)}
        fetchExpenses={fetchExpenses}
      />
    </div>
  );
}

export default Expenses;
