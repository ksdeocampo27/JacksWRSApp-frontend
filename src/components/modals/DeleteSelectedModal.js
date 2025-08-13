import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";

export default function DeleteSelectedModal({
  show,
  onHide,
  selectedIds = [],
  entityName,
  deleteEndpoint,
  onDeleted,
}) {
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const handleDelete = async () => {
    if (selectedIds.length === 0) return; // Safety check

    try {
      setDeleting(true);
      setDeleteProgress(0);
      setDeletedCount(selectedIds.length);

      for (let i = 0; i < selectedIds.length; i++) {
        const id = selectedIds[i];
        await axios.delete(
          `${process.env.REACT_APP_API_URL}${deleteEndpoint}${deleteEndpoint.endsWith("/") ? "" : "/"}${id}`
        );
        setDeleteProgress(Math.round(((i + 1) / selectedIds.length) * 100));
      }

      onDeleted?.();
      onHide();
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert(`Error deleting selected ${entityName}${selectedIds.length > 1 ? "s" : ""}.`);
    } finally {
      setDeleting(false);
      setDeleteProgress(0);
    }
  };

  return (
    <>
      {/* Confirm Delete Modal */}
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Selected</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {selectedIds.length} selected{" "}
          {entityName}
          {selectedIds.length > 1 ? "s" : ""}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? `Deleting... ${deleteProgress}%` : "Confirm Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Successfully deleted {deletedCount} {entityName}
          {deletedCount > 1 ? "s" : ""}!
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setShowSuccessModal(false);
              setDeletedCount(0);
            }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
