import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import ColoredSelect from "../ColoredSelect"; // Import your custom component if needed
import {
  categoryOptions,
  categoryColors,
  typesOptions,
  typeColors,
  unitOptions,
} from "../../constants/expensesConstants";

export default function AddEditExpenseModal({
  show,
  onHide,
  fetchExpenses,
  currentExpense,
  setCurrentExpense,
  isEditing,
}) {
  // const

  // ADD or UPDATE Expenses
  const handleSave = async () => {
    try {
      //console.log("Saving Expense:", currentExpense); // 👈 Add this
      if (currentExpense._id) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/expenses/${currentExpense._id}`,
          currentExpense
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/expenses`,
          currentExpense
        );
      }

      onHide();

      if (typeof fetchExpenses === "function") {
        fetchExpenses(); // ✅ refresh list if passed as prop
      }
    } catch (err) {
      console.error("Error saving expense:", err.response?.data || err.message); // 👈 Also log the error clearly
    }
  };

  return (
    <>
      {/* Add/Edit Modal */}
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentExpense._id ? "Edit Expense" : "Add Expense"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={currentExpense.date}
                onChange={(e) =>
                  setCurrentExpense({ ...currentExpense, date: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={currentExpense.description}
                onChange={(e) =>
                  setCurrentExpense({
                    ...currentExpense,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Category</Form.Label>
              <div className="d-flex flex-wrap">
                {[
                  {
                    label: "Assets",
                    selectedColor: "#00badbff",
                    borderColor: "#00badbff",
                    color: "#05444fff",
                  },
                  {
                    label: "Operating Cost",
                    selectedColor: "#ff4656ff",
                    borderColor: "#ff4656ff",
                    color: "#5b0f16ff",
                  },
                  {
                    label: "Overhead Cost",
                    selectedColor: "#ffd455ff",
                    borderColor: "#ffd455ff",
                    color: "#3e3210ff",
                  },
                  {
                    label: "Liability",
                    selectedColor: "#43af39ff",
                    borderColor: "#43af39ff",
                    color: "#133210ff",
                  },
                  {
                    label: "Cost of Goods Sold",
                    selectedColor: "#df90dcff",
                    borderColor: "#df90dcff",
                    color: "#4a2f49ff",
                  },
                ].map((category) => {
                  const isSelected = currentExpense.category === category.label;
                  return (
                    <Button
                      key={category.label}
                      size="sm"
                      variant={
                        isSelected ? category.bg : `outline-${category.bg}`
                      }
                      className="me-2 mb-2"
                      onClick={() =>
                        setCurrentExpense({
                          ...currentExpense,
                          category: category.label,
                        })
                      }
                      style={{
                        backgroundColor: isSelected
                          ? category.selectedColor
                          : category.defaultColor,
                        borderColor: isSelected
                          ? category.borderColor
                          : category.borderColor,
                        color: isSelected
                          ? category.color
                          : category.selectedColor,
                      }}
                    >
                      {" "}
                      {category.label}{" "}
                    </Button>
                  );
                })}
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Type</Form.Label>
              <ColoredSelect
                options={typesOptions}
                defaultValue={typesOptions.find(
                  (opt) => opt.value === currentExpense.type
                )}
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
                onChange={(e) =>
                  setCurrentExpense({
                    ...currentExpense,
                    store: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="row">
                <div className="col">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentExpense.quantity}
                    onChange={(e) =>
                      setCurrentExpense({
                        ...currentExpense,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="col">
                  <Form.Label>Unit</Form.Label>
                  <ColoredSelect
                    options={unitOptions}
                    defaultValue={unitOptions.find(
                      (opt) => opt.value === currentExpense.unit
                    )}
                    onChange={(selected) =>
                      setCurrentExpense({
                        ...currentExpense,
                        unit: selected.value,
                      })
                    }
                  />
                </div>
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="number"
                value={currentExpense.totalAmount}
                onChange={(e) =>
                  setCurrentExpense({
                    ...currentExpense,
                    totalAmount: Number(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={currentExpense.remarks}
                onChange={(e) =>
                  setCurrentExpense({
                    ...currentExpense,
                    remarks: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
