import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { Typeahead } from "react-bootstrap-typeahead";

export default function AddEditSalesModal({
  show,
  onHide,
  currentSale,
  setCurrentSale,
  isEditing,
  fetchSales,
  customers,
  containers,
}) {
  // constants

  // ================================
  //            HANDLERS
  // ================================
  const handleSave = async () => {
    try {
      const calculatedPricePerUnit =
        currentSale.totalAmount && currentSale.quantity
          ? currentSale.totalAmount / currentSale.quantity
          : 0;

      const saleToSave = {
        ...currentSale,
        pricePerUnit: calculatedPricePerUnit,
        customerId: currentSale.customerId || null,
        customerName: currentSale.customerName || "",
        customerContainerQty: currentSale.customerContainerQty || 0,
      };

      if (isEditing) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/sales/${currentSale._id}`,
          saleToSave
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/sales`,
          saleToSave
        );
      }

      onHide();
      fetchSales();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      {/* Add/Edit Modal */}
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentSale._id ? "Edit Sale" : "Add Sale"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={currentSale.date}
                onChange={(e) =>
                  setCurrentSale({ ...currentSale, date: e.target.value })
                }
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
                selected={(() => {
                  const found = customers.find(
                    (c) => c._id === currentSale.customerId
                  );
                  if (found) {
                    return [found]; // show existing customer as selected
                  } else if (currentSale.customerName) {
                    return [{ name: currentSale.customerName }]; // show typed name as selected
                  } else {
                    return []; // no selection
                  }
                })()}
                onChange={(selected) => {
                  if (selected.length > 0) {
                    const sel = selected[0];
                    if (sel._id) {
                      setCurrentSale({
                        ...currentSale,
                        customerId: sel._id,
                        customerName: sel.name,
                      });
                    } else if (sel.name) {
                      // New typed name
                      setCurrentSale({
                        ...currentSale,
                        customerId: null,
                        customerName: sel.name,
                      });
                    } else if (typeof sel === "string") {
                      // Typed raw string (edge case)
                      setCurrentSale({
                        ...currentSale,
                        customerId: null,
                        customerName: sel,
                      });
                    }
                  } else {
                    // If cleared selection
                    setCurrentSale({
                      ...currentSale,
                      customerId: null,
                      customerName: "",
                    });
                  }
                }}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Type</Form.Label>
              <br />
              <Button
                value={currentSale.type}
                variant={
                  currentSale.type === "Walk-In" ? "success" : "outline-success"
                }
                onClick={() =>
                  setCurrentSale({ ...currentSale, type: "Walk-In" })
                }
                className="me-2"
              >
                Walk-In
              </Button>
              <Button
                variant={
                  currentSale.type === "Delivery"
                    ? "primary"
                    : "outline-primary"
                }
                onClick={() =>
                  setCurrentSale({ ...currentSale, type: "Delivery" })
                }
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
                ].map((item) => {
                  const isSelected = currentSale.item === item.label;
                  return (
                    <Button
                      key={item.label}
                      size="sm"
                      variant={isSelected ? item.bg : `outline-${item.bg}`}
                      className="me-2 mb-2"
                      onClick={() =>
                        setCurrentSale({ ...currentSale, item: item.label })
                      }
                      style={{
                        backgroundColor:
                          item.bg === "purple" && isSelected
                            ? "#d6b3ff"
                            : item.bg === "purple"
                            ? "transparent"
                            : undefined,
                        borderColor:
                          item.bg === "purple" ? "#d6b3ff" : undefined,
                        color:
                          item.bg === "purple" && isSelected
                            ? "#5c2d91"
                            : item.bg === "purple"
                            ? "#5c2d91"
                            : undefined,
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={currentSale.quantity}
                onChange={(e) =>
                  setCurrentSale({
                    ...currentSale,
                    quantity: Number(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="number"
                value={currentSale.totalAmount}
                onChange={(e) =>
                  setCurrentSale({
                    ...currentSale,
                    totalAmount: Number(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                value={currentSale.paymentMethod}
                onChange={(e) =>
                  setCurrentSale({
                    ...currentSale,
                    paymentMethod: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setCurrentSale({ ...currentSale, status: e.target.value })
                }
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
                        customerContainerQty: Number(e.target.value),
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
                    selected={containers.filter((c) =>
                      currentSale.containerIds?.includes(c._id)
                    )}
                    onChange={(selected) => {
                      setCurrentSale({
                        ...currentSale,
                        containerIds: selected.map((s) => s._id),
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
                onChange={(e) =>
                  setCurrentSale({ ...currentSale, remarks: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleSave();
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
