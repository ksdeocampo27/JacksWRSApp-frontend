import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

function CustomerProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/customers/${id}/profile`
        );
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [id]);

  if (!profile) return <div>Loading...</div>;

  const { customer, lastTransaction, sales } = profile;

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        {customer.name}{" "}
        <small className="text-muted" style={{ fontSize: "14px" }}>
          Created: {new Date(customer.createdAt).toLocaleDateString()}
        </small>
      </h2>

      <p>
        <strong>Last Transaction:</strong>{" "}
        {lastTransaction
          ? (() => {
              const date = new Date(lastTransaction);
              const formattedDate = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              const today = new Date();
              // Reset time to midnight for accurate day difference
              today.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);

              const diffTime = today - date;
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

              const daysAgo =
                diffDays === 0
                  ? "today"
                  : `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

              return `${formattedDate} (${daysAgo})`;
            })()
          : "-"}
      </p>
      <p>
        <strong>Nickname:</strong> {customer.nickname || "-"}
      </p>
      <p>
        <strong>Phone:</strong> {customer.phone || "-"}
      </p>
      <p>
        <strong>Address:</strong> {customer.address || "-"}
      </p>
      <p>
        <strong>Landmark:</strong> {customer.landmark || "-"}
      </p>
      <p>
        <strong>Birthday:</strong>{" "}
        {customer.birthday
          ? new Date(customer.birthday).toLocaleDateString()
          : "-"}
      </p>
      <p>
        <strong>Frequency:</strong> {customer.frequency || "-"}
      </p>
      <p>
        <strong>Remarks:</strong> {customer.remarks || "-"}
      </p>

      <h4 className="mt-4">Sales Records</h4>
      <table className="table mt-2">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Containers</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s._id}>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>{s.type}</td>
              <td>{s.item}</td>
              <td>{s.quantity}</td>
              <td>₱{s.totalAmount}</td>
              <td>{s.paymentMethod}</td>
              <td>{s.status}</td>
              <td>
                {s.containerIds && s.containerIds.length > 0
                  ? s.containerIds.map((c, idx) => (
                      <span key={c._id || c.id}>
                        <Link to={`/inventory/${c._id || c.id}`}>
                          {c.name || c.id || c._id}
                        </Link>
                        {idx !== s.containerIds.length - 1 && ", "}
                      </span>
                    ))
                  : "-"}
              </td>
              <td>{s.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/customers" className="btn btn-secondary mt-3">
        Back to Customers
      </Link>
    </div>
  );
}

export default CustomerProfile;
