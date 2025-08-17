import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

export default function AddMultiSalesModal({ show, onHide, fetchSales, containers, customers }) {
  // constants
  const [importProgress, setImportProgress] = useState(0);
  const [multiSalesInput, setMultiSalesInput] = useState("");
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const [importResult, setImportResult] = useState({
    successCount: 0,
    failedLine: null,
    errorMessage: "",
  });

  // handlers
  const handleMultiSalesImport = async () => {
    if (!multiSalesInput) {
      alert("Please enter sales records first.");
      return;
    }

    let importing = true; // 🔑 local synchronous flag to avoid React async delays

    const lines = multiSalesInput.trim().split("\n");
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
          customerName,
          type,
          item,
          quantity,
          totalAmount,
          paymentMethod,
          status,
          containersField,
          remarks,
        ] = line.split(";").map((f) => f.trim());

        // Process containers field
        let customerContainerQty = 0;
        let containerIds = [];
        if (containersField) {
          const containersArray = containersField
            .split(",")
            .map((c) => c.trim());
          containersArray.forEach((c) => {
            if (c.toLowerCase().startsWith("z")) {
              customerContainerQty = parseInt(c.substring(1)) || 0;
            } else {
              const containerObj = containers.find(
                (cont) => cont.id === c || cont.name === c || cont._id === c
              );
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

        const customer = customers.find(
          (c) => c.name.toLowerCase() === customerName.toLowerCase()
        );

        const sale = {
          date: date || new Date().toISOString().split("T")[0],
          customerId: customer ? customer._id : null,
          customerName: customer ? customer.name : customerName,
          type: type || "Delivery",
          item: item || "",
          quantity: qty || 1,
          totalAmount: total || 0,
          pricePerUnit: pricePerUnit || 0,
          paymentMethod: paymentMethod || "Cash",
          status: status || "Paid",
          customerContainerQty,
          containerIds,
          remarks: remarks || "",
        };

        await axios.post(`${process.env.REACT_APP_API_URL}/api/sales`, sale);

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
        setShowImportResultModal(true);
      }

      fetchSales();
    } catch (err) {
      console.error(err);
      alert("Error importing sales. Check console for details.");
    }
  };

  return (
    <>
      {/* Add Multi Sales Modal */}
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
                date;customer name;type;item;quantity;total amount;payment
                method;status;containers;remarks
                <br />
                <strong>Example:</strong>
                <br />
                2025-07-18;John Cruz;Delivery;Refill (Slim
                5gal);3;75;Cash;Paid;z2,S001;Morning delivery
                <br />
                2025-07-18;Maria Santos;Walk-in;Refill (Round
                5gal);2;50;GCash;Paid;z1,S002;Regular customer
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
                value={multiSalesInput}
                onChange={(e) => setMultiSalesInput(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              className="mt-2"
              onClick={handleMultiSalesImport}
            >
              Import Sales
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => onHide()}
          >
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

/*
2025-07-18;John Cruz;Delivery;Refill (Slim 5gal);3;75;Cash;Paid;z2,S001;Morning delivery
2025-07-18;Maria Santos;Walk-In;Refill (Round 5gal);2;50;GCash;Paid;z1,S002;Regular customer
2025-07-18;Alex Dela Cruz;Delivery;New (Slim 5gal);1;200;Cash;Paid;S003;First time order
2025-07-18;Jenny Lopez;Walk-In;New (Round 5gal);1;220;Cash;Paid;z1;Bought new round container
2025-07-18;Mark Reyes;Delivery;Refill (Slim 5gal);5;125;GCash;Paid;z3,S004,S005;Monthly refill
2025-07-18;Louie Mendoza;Walk-In;Refill (Round 5gal);4;100;Cash;Paid;z2,S006,S007;Walk-In refill
2025-07-18;Cathy Villanueva;Delivery;Plan A - Standard Plan;1;350;GCash;Paid;;Subscribed to Plan A
2025-07-18;Ryan Tan;Walk-In;Plan B - Family Plan;1;500;Cash;Paid;;Subscribed to Plan B
2025-07-18;Mikaela Lim;Delivery;Big Cap;2;40;Cash;Paid;;Bought extra caps
2025-07-18;Chris Uy;Walk-In;Small Cap;3;30;GCash;Paid;;Bought small caps
2025-07-18;Daryl Ong;Delivery;Faucet;1;50;Cash;Paid;;Bought faucet
2025-07-18;Shiela Gomez;Walk-In;Bottled Water (500mL);10;150;GCash;Paid;;Bought bottled water
2025-07-18;Aaron Perez;Delivery;Bottled Water (1000mL);5;125;Cash;Paid;;Ordered bottled water
2025-07-18;Regine Velasquez;Walk-In;Dispenser;1;1200;GCash;Paid;;Bought dispenser
2025-07-18;Janine Gutierrez;Delivery;Refill (Slim 5gal);2;50;Cash;Paid;z1,S008;Regular delivery
2025-07-18;Enrique Gil;Walk-In;New (Slim 5gal);1;200;Cash;Paid;S009;Bought new slim container
2025-07-18;Liza Soberano;Delivery;Plan C - Business Plan;1;800;GCash;Paid;;Subscribed to Plan C
2025-07-18;Daniel Padilla;Walk-In;Plan D - Enterprise Plan;1;1500;Cash;Paid;;Subscribed to Plan D
2025-07-18;Kathryn Bernardo;Delivery;Plan E - Custom Plan;1;2000;GCash;Paid;;Subscribed to Plan E
2025-07-18;Piolo Pascual;Walk-In;Refill (Round 5gal);3;75;Cash;Paid;z2,S010;Walk-In refill
2025-07-19;NoRecord;Delivery;Refill (Slim 5gal);3;75;Cash;Paid;z2,S001,S002;First delivery this week
2025-07-18;Maria Santos;Walk-In;Refill (Round 5gal);2;50;GCash;Paid;z1,S003;Bought bottled water
2025-07-17;Pedro Reyes;Delivery;Dispenser;1;25;Cash;Unpaid;S004;Pending payment

*/