import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

export default function AddEditCustomerModal({
  show,
  onHide,
  fetchCustomers,
  fetchSales,
  currentCustomer,
  setCurrentCustomer,
  isEditing,
  fromSale = false, // NEW: flag if opened from Sales page
  currentSaleId = null, // NEW: sale id to link
  setSales, // NEW: update sales list immediately
  setCustomers, // NEW: update customers list
  setSuccessMessage, // optional feedback modal
  setShowSuccessModal,
}) {
  // constants

  // ================================
  //            HANDLERS
  // ================================

  const handleSave = async () => {
    try {
      let newCustomer;
      if (isEditing) {
        // Regular update
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/customers/${currentCustomer._id}`,
          currentCustomer
        );
      } else {
        // Add new
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/customers`,
          currentCustomer
        );
        newCustomer = res.data;

        // Update local customers state if passed
        if (setCustomers) {
          setCustomers((prev) => [...prev, newCustomer]);
        }
      }

      // 🟢 If opened from Sales, also update the sale
      if (fromSale && newCustomer && currentSaleId) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/sales/${currentSaleId}`,
          {
            customerId: newCustomer._id,
            customerName: newCustomer.name,
          }
        );

        // Re-fetch populated sale
        const populatedSaleRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/sales/${currentSaleId}`
        );
        const populatedSale = populatedSaleRes.data;

        if (setSales) {
          setSales((prevSales) =>
            prevSales.map((s) =>
              s._id === populatedSale._id ? populatedSale : s
            )
          );
        }

        if (fetchSales) fetchSales();

        if (setSuccessMessage && setShowSuccessModal) {
          setSuccessMessage("Customer added and sale updated!");
          setShowSuccessModal(true);
        }
      }

      if (fetchCustomers) fetchCustomers();

      // reset + close
      setCurrentCustomer({});
      onHide();
    } catch (err) {
      console.error(err);
      alert("Error saving customer.");
    }
  };

  return (
    <>
      {/* Add/Edit Modal */}
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentCustomer._id ? "Edit Customer" : "Add Customer"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={currentCustomer.name  ?? ""}
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
                value={currentCustomer.nickname}
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
                value={currentCustomer.phone}
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
                value={currentCustomer.address}
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
                value={currentCustomer.landmark}
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
                value={currentCustomer.frequency}
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
                value={currentCustomer.birthday}
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
                value={currentCustomer.lastTransactionDate}
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
                value={currentCustomer.remarks}
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
