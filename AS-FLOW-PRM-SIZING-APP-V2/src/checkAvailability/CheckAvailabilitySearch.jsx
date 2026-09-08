import React, { useState } from "react";

export default function CheckAvailabilitySearch() {
  const [uuid, setUuid] = useState("");

  return (
    <div
      className="av-app-container"
      style={{ minHeight: "100vh", overflowY: "auto", background: "#f4f6f8" }}
    >
      <header className="av-navbar">
        <div className="av-navbar-left">
          <div className="av-logo-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="av-logo-dot" />
            ))}
          </div>
          <span className="av-brand">EMERSON</span>
        </div>
        <h1 className="av-navbar-title">PRV AVAILABILITY CHECK</h1>
        <div className="av-navbar-right" />
      </header>

      <main className="av-search-panel">
        <div className="av-search-row">
          <label htmlFor="uuid-input" className="av-search-label">
            UUID
          </label>
          <input
            id="uuid-input"
            type="text"
            value={uuid}
            onChange={(event) => setUuid(event.target.value)}
            placeholder="Enter UUID"
            className="av-input-text"
          />
          <button className="av-btn av-btn-primary" type="button">
            Search
          </button>
        </div>

        <div className="av-search-grid">
          <section className="av-metadata-column">
            <h2 className="av-section-heading">Metadata</h2>
            <div className="av-metadata-grid">
              <div className="av-field av-field-mt">
                <label>Request ID:</label>
                <span className="av-value">
                  6c251307-a4db-463e-87ca-4c89abefbd37
                </span>
              </div>
              <div className="av-field av-field-mt">
                <label>Customer:</label>
                <span className="av-value">My Company</span>
              </div>
              <div className="av-field av-field-mt">
                <label>Project:</label>
                <span className="av-value">My Project</span>
              </div>
              <div className="av-field av-field-mt">
                <label>Tag:</label>
                <span className="av-value">—</span>
              </div>
              <div className="av-field av-field-mt">
                <label>Catalogue Code:</label>
                <span className="av-value">99112721D</span>
              </div>
              <div className="av-field av-field-mt">
                <label>ERP Code:</label>
                <span className="av-value">9918127L21D1N3STDBLNPR4TR21A</span>
              </div>
              <div className="av-field av-field-mt">
                <label>Factory:</label>
                <span className="av-value">Stafford</span>
              </div>
              <div className="av-field av-field-mt">
                <label>Overall Commitment Date:</label>
                <span className="av-value">—</span>
              </div>
            </div>
          </section>

          <section className="av-table-column">
            <h2 className="av-section-heading">SAP ATP RESULTS</h2>
            <div className="av-table-container">
              <table className="av-table">
                <thead>
                  <tr>
                    <th>Material Number</th>
                    <th>Legacy Material Numbe</th>
                    <th>Description</th>
                    <th> Basic Material</th>
                    <th>Qty</th>
                    <th>UOM</th>
                    <th>ATP Qty</th>
                    <th>Availability</th>
                    <th>Weeks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="9" className="av-table-empty">
                      No data available. Enter a UUID and click Search.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
