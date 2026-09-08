import React, { useEffect } from "react";
import {
  useAvailabilityTagdata,
  useAvailabilityForm,
  useCheckAvailabilityAction,
} from "../hooks/useAvailability";
import { useProcessedAvailabilityData } from "../hooks/useAvailability";
import { exportToCSV, exportToPDF } from "../helpers/exportUtils";
import { useSelector, useDispatch } from "react-redux";
import Skeleton from "@mui/material/Skeleton";
import {
  setFactory,
  setLeadTime,
  fetchSAPMaterials,
} from "../store/slices/checkAvailabilitySlice";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ErrorIcon from "@mui/icons-material/Error";
import { IconButton, Tooltip } from "@mui/material";

const HeaderPanel = (prop) => {
  const dispatch = useDispatch();

  const TagData = useAvailabilityTagdata();
  const loader = useSelector((state) => state.checkAvailability.loading);
  const factorySelected = useSelector(
    (state) => state.checkAvailability.factorySelected,
  );
  const leadTime = useSelector((state) => state.checkAvailability.leadTime);
  const rev = useSelector((state) => state.checkAvailability.revisionData);
  const TPCDataId = useSelector((state) => state.checkAvailability.TPCDataId);
  const ParentSapNumber = useSelector(
    (state) => state.checkAvailability.ParentSapNumber,
  );
  const getRemainingWeeks = (dateString) => {
    const currentDate = new Date();
    const targetDate = new Date(dateString);
    const diffMs = targetDate - currentDate;
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
  };

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
  };

  // const handleCheck = useCheckAvailabilityAction();
  // const { factory, leadTime, isDirty, setFactory, setLeadTime } = useAvailabilityForm();
  // const { tableData } = useProcessedAvailabilityData();

  return (
    <div className="av-header-panel">
      {/* ── Metadata fields (read-only summary) ── */}
      <div className="av-metadata-grid">
        <div className="av-field">
          <label>Customer</label>
          {loader ? (
            <Skeleton variant="rectangular" width="100%" height={20} />
          ) : (
            TagData?.Customer_Name
          )}
        </div>
        <div className="av-field">
          <label>Project</label>
          {loader ? (
            <Skeleton variant="rectangular" width="100%" height={20} />
          ) : (
            TagData?.Project_Name
          )}
        </div>
        <div className="av-field">
          <label>Tag</label>
          {loader ? (
            <Skeleton variant="rectangular" width="100%" height={20} />
          ) : (
            TagData?.Tag_No
          )}
        </div>
        <div className="av-field">
          <label>Catalog Code</label>
          {loader ? (
            <Skeleton variant="rectangular" width="100%" height={20} />
          ) : (
            TagData?.Catalog_Code
          )}
        </div>
        <div className="av-field">
          <label>ERP Code</label>
          {loader ? (
            <Skeleton variant="rectangular" width="100%" height={20} />
          ) : (
            TagData?.Erp_Code
          )}
        </div>
      </div>

      {/* ── Editable: Factory ── */}
      <div className="av-field av-field-mt">
        <label>Factory</label>
        {loader ? (
          <Skeleton variant="rectangular" width="100%" height={38} />
        ) : (
          <select
            className="av-input-factory"
            value={factorySelected}
            onChange={(e) => dispatch(setFactory(e.target.value))}
          >
            {/* <option value={TagData?.factory}>{TagData?.factory}</option> */}
            <option disabled={true} value="Dalmine (SAP, 1102)">
              Dalmine (SAP, 1102)
            </option>
            <option disabled={true} value="Cluj (SAP, 1103)">
              Cluj (SAP, 1103)
            </option>
            <option value="Stafford, Texas">Stafford (SAP, 1101)</option>
            <option value="Qingpu, Shanghai">Qingpu (SAP, 3011)</option>
            <option value="Manchester, UK">Manchester (SAP, 5GB1)</option>
            <option value="Singapore, Singapore">Singapore (SAP, 5SG1)</option>
          </select>
        )}
      </div>

      {/* ── Editable: Requested Lead Time ── */}
      <div className="av-field">
        <label>Requested Lead Time</label>
        {loader ? (
          <Skeleton variant="rectangular" width="100%" height={38} />
        ) : (
          <div className="av-lead-time">
            <input
              type="number"
              className="av-input-small"
              value={leadTime}
              min={1}
              onChange={(e) => dispatch(setLeadTime(e.target.value))}
            />
            <span className="av-unit">week</span>
          </div>
        )}
      </div>

      {/* ── Check Availability button ── */}
      <div className="av-action-row">
        {loader ? (
          <Skeleton variant="rectangular" width="100%" height={44} />
        ) : (
          <button
            className={`av-btn av-btn-primary${true ? " av-btn-dirty" : ""}`}
            onClick={() => {
              if (
                Array.isArray(ParentSapNumber) &&
                ParentSapNumber.includes("CUSTOM")
              ) {
                return;
              }

              dispatch(fetchSAPMaterials());
            }}
            title={"Factory or Lead Time changed from default"}
          >
            Check Availability
          </button>
        )}
      </div>

      {/* ── Divider ── */}
      <hr className="av-divider" />

      {/* ── Summary card ── */}
      <div className="av-commitment-card">
        <span className="av-card-label">Overall Commitment Date</span>
        <div className="av-card-value">
          {loader ? (
            <Skeleton variant="rectangular" width="100%" height={20} />
          ) : Array.isArray(ParentSapNumber) &&
            ParentSapNumber.includes("CUSTOM") ? (
            <span
              style={{
                color: "#d32f2f",
                fontWeight: 600,
                fontSize: "20px",
              }}
            >
              Consult Factory
            </span>
          ) : TagData?.overallCommitmentDate ? (
            `${TagData.overallCommitmentDate} (${getRemainingWeeks(
              TagData.overallCommitmentDate,
            )} Weeks)`
          ) : (
            "-"
          )}
        </div>
      </div>

      {/* ── BOM / Ref info ── */}
      <div className="av-ref-block">
        <div className="av-ref-item">
          <label>BOM Version</label>
          <div>
            {loader ? (
              <Skeleton variant="rectangular" width="100%" height={20} />
            ) : (
              rev.RevisionRev
            )}
          </div>
        </div>
        <div className="av-ref-item">
          <label>Availability Ref. No.</label>
          <div>
            {loader ? (
              <Skeleton variant="rectangular" width="100%" height={20} />
            ) : (
              <span>
                {TPCDataId}
                <Tooltip title="Copy">
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(TPCDataId)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderPanel;
