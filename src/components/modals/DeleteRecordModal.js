import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

export default function DeleteRecordModal({
    show,
    onHide,
    entityName,
    deleteEndpoint,
    recordToDelete,
    fetchExpenses

}) {
    // constants

    // handlers
    //TODO: set record to delete to null again
      const handleDeleteSale = async () => {
        try {
          await axios.delete(
            `${process.env.REACT_APP_API_URL}${deleteEndpoint}${recordToDelete._id}`
          );
          onHide
          //setRecordToDelete(null);
          fetchExpenses();
          onHide();
        } catch (err) {
          console.error(err);
        }
      };

return (
<>
      {/* Delete Confirmation Modal */}
          <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
              <Modal.Title>Delete Record</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this {entityName?.toLowerCase()} record?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={onHide}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteSale}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
</>
)

} 