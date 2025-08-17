import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ModalHeader, ModalBody } from "react-bootstrap";
import axios from "axios";

export default function AddEditExpenseModal({ show, onHide, fetchExpenses }) {
  // constants
  const [importProgress, setImportProgress] = useState(0);
  const [multiExpensesInput, setMultiExpensesInput] = useState("");
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const [importResult, setImportResult] = useState({
    successCount: 0,
    failedLine: null,
    errorMessage: "",
  });
  // handlers
  const handleMultiExpensesImport = async () => {
    if (!multiExpensesInput) {
      alert("Please enter expenses records first.");
      return;
    }

    let importing = true; // 🔑 local synchronous flag to avoid React async delays

    const lines = multiExpensesInput.trim().split("\n");
    let successCount = 0;

    try {
      console.log("Starting import...");
      for (let i = 0; i < lines.length; i++) {
        if (!importing) {
          console.log("Import stopped by user.");
          break;
        }

        const line = lines[i];
        const [
          date,
          description,
          category,
          type,
          store,
          quantity,
          unit,
          totalAmount,
          remarks,
        ] = line.split(";").map((f) => f.trim());

        // Calculate
        const qty = parseInt(quantity);
        const total = parseFloat(totalAmount);
        const pricePerUnit = qty !== 0 ? total / qty : 0;

        const expense = {
          date: date || new Date().toISOString().split("T")[0],
          description: description || "",
          category: category || "",
          type: type || "",
          store: store || "",
          quantity: qty || 1,
          unit: unit || "",
          totalAmount: total || 0,
          remarks: remarks || "",
        };

        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/expenses`,
          expense
        );

        successCount++;

        // Update progress bar
        setImportProgress(Math.round(((i + 1) / lines.length) * 100));
      }

      // Show success modal if all completed
      if (successCount === lines.length) {
        setImportResult((prev) => ({
          ...prev,
          successCount,
        }));

        onHide();
        //TODO: clear text field again
        setShowImportResultModal(true);
      }

      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("Error importing expenses. Check console for details.");
    }
  };

  return (
    <>
      {/* Multi Add Result Modal */}
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Add Multiple Sales</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>
                <strong>Enter multiple sales.</strong>
                <br />- one per line
                <br />- semicolon-separated fields
                <br />
                <strong>Format:</strong>
                <br />
                date;description;category;type;store;quantity;
                unit;totalAmount;remarks
                <br />
                <strong>Example:</strong>
                <br />
                2025-07-01;Bottle 500ml;Cost of Goods Sold;Sellables -
                Bottles;loulex;200;pcs;250;bottles yum yum
                <br />
                2025-07-02;Electric Bill July;Operating Cost;Electric
                Bill;tindahan ni aling nena;5;kWh;1500;paid july secret
              </Form.Label>

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

              <Form.Control
                as="textarea"
                rows={10}
                value={multiExpensesInput}
                onChange={(e) => setMultiExpensesInput(e.target.value)}
              />
            </Form.Group>

            <Button
              variant="primary"
              className="mt-2"
              onClick={handleMultiExpensesImport}
            >
              Import Sales
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Multi Add Result Modal */}
      <Modal
        show={showImportResultModal}
        onHide={() => setShowImportResultModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Import Result</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {importResult.failedLine ? (
            <>
              <p>✅ Successfully added: {importResult.successCount}</p>
              <p>❌ Failed at line: {importResult.failedLine}</p>
              <p>Error: {importResult.errorMessage}</p>
            </>
          ) : (
            <p>
              ✅ All records successfully imported! Total added:{" "}
              {importResult.successCount}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setShowImportResultModal(false);
              onHide();
              setImportProgress(0);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/** 
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

export default function AddEditExpenseModal({

}) {
    // constants

    // handlers
return (
<>
    // modals
</>
)

} 
*/

/*
2025-07-01;Bottle 500ml;Cost of Goods Sold;Sellables - Bottles;loulex;200;pcs;250;bottles yum yum
2025-07-02;Electric Bill July;Operating Cost;Electric Bill;tindahan ni aling nena;5;kWh;1500;paid july secret

*/
