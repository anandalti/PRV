import React, { useEffect, useState, useRef } from "react";
import HeaderPanel from "../components/HeaderPanel";
import AvailabilityTable from "../components/AvailabilityTable";
import { useProcessedAvailabilityData } from "../hooks/useAvailability";
import { useAvailabilityTagdata } from "../hooks/useAvailability";
import "../styles/index.css";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";
import {
  setRequestID,
  fetchTPCData,
  fetchSAPMaterials,
  setError,
  setLoading,
} from "../store/slices/checkAvailabilitySlice";
import { useDispatch, useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ParentChildTable from "../ParentChildTable";

function Home() {
  const queryParameters = new URLSearchParams(window.location.search);
  const TPCDataId = queryParameters.get("requestId");
  const token = queryParameters.get("token");
  sessionStorage.setItem("authToken", token);
  const loader = useSelector((state) => state.checkAvailability.loading);
  const error = useSelector((state) => state.checkAvailability.error);
  const ParentSapNumber = useSelector(
    (state) => state.checkAvailability.ParentSapNumber,
  );
  const dispatch = useDispatch();

  const [showLoadingNotification, setShowLoadingNotification] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const prevLoaderRef = React.useRef(loader);
  const [triggerExport, setTriggerExport] = useState(false);
  const [triggerPDFParentExport, setTriggerPDFParentExport] = useState(false);
  const [triggerPDFParentChildExport, setTriggerPDFParentChildExport] =
    useState(false);
  const exportContainerRef = useRef(null);

  useEffect(() => {
    dispatch(setRequestID(TPCDataId));
    // Chain the API calls: fetchTPCData first, then fetchSAPMaterials
    setStartTime(Date.now());
    setShowLoadingNotification(true);

    dispatch(fetchTPCData()).then((result) => {
      if (!result.payload?.error) {
        const sapNumbers = result.payload?.sapNO || [];

        const hasCustom =
          Array.isArray(sapNumbers) && sapNumbers.includes("CUSTOM");

        if (hasCustom) {
          dispatch(setLoading(false));
          return;
        }

        dispatch(fetchSAPMaterials());
      }
    });
  }, [dispatch, TPCDataId]);

  // Track when loading completes
  useEffect(() => {
    if (prevLoaderRef.current && !loader && startTime) {
      setShowLoadingNotification(false);
      setShowSuccessNotification(true);
    }
    prevLoaderRef.current = loader;
  }, [loader, startTime]);

  // Track error state and show error notification
  useEffect(() => {
    if (error) {
      setShowErrorNotification(true);
    }
  }, [error]);

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showExportMenu &&
        exportContainerRef.current &&
        !exportContainerRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportMenu]);

  const tagData = useAvailabilityTagdata();

  if (!TPCDataId) {
    return (
      <>
        <div className="av-app-container">
          <header className="av-navbar">
            <div className="av-navbar-left">
              <div className="av-navbar-left">
                <img
                  src="/Emerson logo.png"
                  alt="Emerson"
                  className="av-emerson-logo"
                />
              </div>
            </div>
            <h1 className="av-navbar-title">PRV AVAILABILITY CHECK</h1>
            <div className="av-navbar-right" />
          </header>
          <main className="av-main-content">
            <div className="av-error-container">
              <h2 className="av-error-title">Error: Missing Request ID</h2>
              <p className="av-error-message">
                The request ID is missing from the URL. Please ensure you have a
                valid request ID to check availability.
              </p>
            </div>
          </main>
        </div>
      </>
    );
  }
  return (
    <div className="av-app-container">
      {/* ── Navbar ── */}
      <header className="av-navbar">
        <div className="av-navbar-left">
          <img
            src="/Emerson logo.png"
            alt="Emerson"
            className="av-emerson-logo"
          />
        </div>
        <h1 className="av-navbar-title">PRV AVAILABILITY CHECK</h1>
        <div className="av-navbar-right" />
        <div>
          {/* <Button
            component={RouterLink}
            to="/check-availability/file-import"
            variant="contained"
            size="small"
          >
            File Validate
          </Button> */}
        </div>
      </header>

      {/* ── Body ── */}
      <main
        className={`av-main-content ${showSidebar ? "" : "av-sidebar-hidden"}`}
      >
        {/* Left sidebar */}
        <aside
          className={`av-sidebar av-no-print ${showSidebar ? "" : "av-sidebar-hidden"}`}
        >
          <HeaderPanel />

          <div className="av-warning-block">
            <p className="av-warning-text">
              <strong>NOTE:</strong> Materials will not be reserved based on
              availability check. A committed sales order is required.
            </p>
          </div>

          <div className="av-export-row">
            <div className="av-export-container" ref={exportContainerRef}>
              <button
                className="av-btn av-btn-export"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={
                  Array.isArray(ParentSapNumber) &&
                  ParentSapNumber.includes("CUSTOM")
                }
              >
                Export Results
              </button>
              {showExportMenu && (
                <div className="av-export-menu">
                  <div className="av-export-header">Export Options</div>

                  <div className="av-export-section">
                    <div className="av-export-section-header">CSV</div>
                    <button
                      onClick={() => setTriggerExport(true)}
                      disabled={
                        Array.isArray(ParentSapNumber) &&
                        ParentSapNumber.includes("CUSTOM")
                      }
                    >
                      Export as CSV
                    </button>
                  </div>

                  <hr className="av-export-divider" />

                  <div className="av-export-section">
                    <div className="av-export-section-header">PDF</div>
                    <button
                      onClick={() => {
                        setTriggerPDFParentExport(true);
                      }}
                      disabled={
                        Array.isArray(ParentSapNumber) &&
                        ParentSapNumber.includes("CUSTOM")
                      }
                    >
                      Export Parent Only
                    </button>
                    <button
                      onClick={() => {
                        setTriggerPDFParentChildExport(true);
                      }}
                      disabled={
                        Array.isArray(ParentSapNumber) &&
                        ParentSapNumber.includes("CUSTOM")
                      }
                    >
                      Export Parent & Child
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <button
          type="button"
          className="av-sidebar-toggle"
          aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
          onClick={() => setShowSidebar((visible) => !visible)}
        >
          {showSidebar ? "‹" : "›"}
        </button>

        {/* Table */}
        <section className="av-table-area">
          <ParentChildTable
            triggerExport={triggerExport}
            setTriggerExport={setTriggerExport}
            triggerPDFParentExport={triggerPDFParentExport}
            setTriggerPDFParentExport={setTriggerPDFParentExport}
            triggerPDFParentChildExport={triggerPDFParentChildExport}
            setTriggerPDFParentChildExport={setTriggerPDFParentChildExport}
          ></ParentChildTable>
          {/* <AvailabilityTable triggerExport={triggerExport} setTriggerExport={setTriggerExport} /> */}
        </section>
      </main>

      {/* Loading Notification */}
      <Snackbar
        open={showLoadingNotification}
        autoHideDuration={null}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          // icon={<CircularProgress size={20} />}
          severity="info"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          Loading data... Please wait. Data Fetching in background.
        </Alert>
      </Snackbar>

      {/* Success Notification */}
      <Snackbar
        open={showSuccessNotification}
        autoHideDuration={3000}
        onClose={() => {
          setShowSuccessNotification(false);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => {
            setShowSuccessNotification(false);
          }}
          severity="success"
        >
          ✓ Data loaded successfully
        </Alert>
      </Snackbar>

      {/* Error Notification */}
      <Snackbar
        open={showErrorNotification}
        autoHideDuration={5000}
        onClose={() => {
          setShowErrorNotification(false);
          dispatch(setError(null));
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => {
            setShowErrorNotification(false);
            dispatch(setError(null));
          }}
          severity="error"
        >
          ✗ {"An error occurred. Please try again."}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Home;
