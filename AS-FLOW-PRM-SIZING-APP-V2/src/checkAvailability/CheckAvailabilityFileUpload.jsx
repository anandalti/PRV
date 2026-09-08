import React, { useState, useRef } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Stack,
  Divider,
  Backdrop,
  CircularProgress,
  ListItemIcon,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import IconButton from "@mui/material/IconButton";
import { Link as RouterLink } from "react-router-dom";
import axios from "./utils/interceptor.js";
import LeadTimeControl from "./LeadTimeControl.jsx";

const EXCEL_MIME_TYPES = new Set([
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const isExcelFile = (file) =>
  EXCEL_MIME_TYPES.has(file.type) || /\.(xls|xlsx)$/i.test(file.name);

const Demo = styled("div")(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.background.paper,
}));

export default function CheckAvailabilityFileUpload() {
  const [files, setFiles] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef(null);

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  const validateFiles = async (selectedFiles = files) => {
    const filesToValidate = Array.isArray(selectedFiles)
      ? selectedFiles.filter((file) => file instanceof File)
      : [];

    if (!filesToValidate.length) {
      setValidationResults([
        {
          fileName: "Validation request",
          errors: ["No valid files available to validate."],
        },
      ]);
      return;
    }

    setIsValidating(true);
    setImportMessage(null);
    setValidationResults([]);

    try {
      const formData = new FormData();
      filesToValidate.forEach((file) => {
        formData.append("file", file);
      });

      const response = await axios.post(`/validate-files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response?.data || {};
      const responseResults = Array.isArray(data) ? data : [];
      const results = responseResults.length
        ? responseResults.map((result) => ({
            fileName: result?.fileName || result?.filename || "Unknown file",
            errors: Array.isArray(result?.errors) ? result.errors : [],
          }))
        : filesToValidate.map((file) => ({
            fileName: file.name,
            errors: Array.isArray(data?.errors) ? data.errors : [],
          }));

      setValidationResults(results);
    } catch (error) {
      console.error("Error validating files:", error);
      setValidationResults([
        {
          fileName: "Validation request",
          errors: ["Unexpected error occurred during validation."],
        },
      ]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const invalid = selectedFiles.filter((file) => !isExcelFile(file));
    if (invalid.length) {
      setFiles([]);
      setValidationResults([
        {
          fileName: "File type validation",
          errors: [
            `Invalid file type(s): ${invalid.map((f) => f.name).join(", ")}.`,
            "Please upload only .xls or .xlsx files.",
          ],
        },
      ]);
      return;
    }

    setFiles(selectedFiles);
    await validateFiles(selectedFiles);
    event.target.value = "";
  };

  const importFiles = () => {
    const importValidFiles = async () => {
      const filesToImport = Array.isArray(files)
        ? files.filter((file) => file instanceof File)
        : [];

      if (!filesToImport.length || !canImport) {
        setImportMessage({
          type: "error",
          text: "Import is blocked. Upload valid Excel files first.",
        });
        return;
      }

      setIsImporting(true);
      setImportMessage(null);
      setIsValidating(true);

      try {
        const formData = new FormData();
        filesToImport.forEach((file) => {
          formData.append("file", file);
        });

        const { data } = await axios.post(`/import-files`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setImportMessage({
          type: "success",
          text: data?.message || "Files imported successfully.",
        });
      } catch (error) {
        const results = error?.response?.data?.results;
        if (Array.isArray(results)) {
          const normalizedResults = results.map((result) => ({
            fileName: result?.fileName || result?.filename || "Unknown file",
            errors: Array.isArray(result?.errors) ? result.errors : [],
          }));
          setValidationResults(normalizedResults);
        }

        setImportMessage({
          type: "error",
          text:
            error?.response?.data?.message ||
            "Failed to import files. Please try again.",
        });
      } finally {
        setIsImporting(false);
        setIsValidating(false);
      }
    };

    importValidFiles();
  };

  const resetUploadState = () => {
    setFiles([]);
    setValidationResults([]);
    setImportMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validationByFileName = new Map(
    validationResults.map((result) => [result.fileName, result]),
  );
  const canImport =
    files.length > 0 &&
    files.every((file) => {
      const matchedResult = validationByFileName.get(file.name);
      const fileErrors = Array.isArray(matchedResult?.errors)
        ? matchedResult.errors
        : null;
      return fileErrors && fileErrors.length === 0;
    });

  return (
    <div
      className="av-app-container"
      style={{ minHeight: "100vh", overflowY: "auto" }}
    >
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
      </header>

      <Box
        sx={{
          width: "100vw",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          p: 3,
          boxSizing: "border-box",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 3, width: "100%" }}
        >
          <Tab
            label="SuperBOM File Uploads"
            sx={{ flex: 1, maxWidth: "50%", minWidth: 0 }}
          />
          <Tab
            label="Lead Time Control"
            sx={{ flex: 1, maxWidth: "50%", minWidth: 0 }}
          />
        </Tabs>

        {activeTab === 0 ? (
          <Box>
            <Typography variant="h5" gutterBottom>
              Upload Super BOM Schema Files:
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button variant="contained" component="label">
                <b>Browse Files</b>
                <input
                  type="file"
                  hidden
                  multiple
                  ref={fileInputRef}
                  accept=".xls,.xlsx"
                  onChange={handleFileUpload}
                />
              </Button>

              <Button
                variant="contained"
                color="warning"
                disabled={!files.length}
                onClick={resetUploadState}
              >
                Reset
              </Button>

              <Button
                variant="contained"
                color="success"
                disabled={!canImport || isImporting || isValidating}
                onClick={importFiles}
              >
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </Stack>

            {importMessage && (
              <Typography
                sx={{
                  mb: 2,
                  color: importMessage.type === "error" ? "#b71c1c" : "#1b5e20",
                  fontWeight: 600,
                }}
              >
                {importMessage.text}
              </Typography>
            )}

            <Box sx={{ flex: 1, display: "flex", gap: 2 }}>
              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 500,
                  height: "100%",
                  minWidth: 0,
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Uploaded Files
                </Typography>

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    border: "1px solid #eee",
                    p: 1,
                    backgroundColor: "#fafafa",
                  }}
                >
                  {validationResults.length > 0 && (
                    <List>
                      {validationResults.map((result) => {
                        const fileErrors = Array.isArray(result.errors)
                          ? result.errors
                          : [];
                        const hasErrors = fileErrors.length > 0;
                        return (
                          <React.Fragment key={result.fileName}>
                            <ListItem
                              sx={{
                                alignItems: "flex-start",
                                borderRadius: 1,
                                mb: 1,
                                backgroundColor: hasErrors
                                  ? "#ffebee"
                                  : "#e8f5e9",
                                border: `1px solid ${hasErrors ? "#ef9a9a" : "#a5d6a7"}`,
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36, mt: 0.4 }}>
                                {hasErrors ? (
                                  <ErrorOutlineIcon sx={{ color: "#c62828" }} />
                                ) : (
                                  <CheckCircleOutlineIcon
                                    sx={{ color: "#2e7d32" }}
                                  />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    <Typography fontWeight={600}>
                                      {result.fileName}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={
                                        hasErrors ? "Has Errors" : "No Errors"
                                      }
                                      color={hasErrors ? "error" : "success"}
                                      variant={
                                        hasErrors ? "filled" : "outlined"
                                      }
                                    />
                                  </Stack>
                                }
                                secondary={
                                  hasErrors ? (
                                    <List dense sx={{ pt: 0.5 }}>
                                      {fileErrors.map((error, index) => (
                                        <ListItem
                                          key={`${result.fileName}-err-${index}`}
                                          sx={{ py: 0 }}
                                        >
                                          <ListItemIcon sx={{ minWidth: 30 }}>
                                            <InfoOutlinedIcon
                                              sx={{
                                                fontSize: 18,
                                                color: "#d32f2f",
                                              }}
                                            />
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={error}
                                            primaryTypographyProps={{
                                              color: "#b71c1c",
                                              fontSize: 13,
                                            }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  ) : (
                                    <Typography
                                      sx={{
                                        color: "#1b5e20",
                                        fontSize: 13,
                                        mt: 0.5,
                                      }}
                                    >
                                      No validation errors found.
                                    </Typography>
                                  )
                                }
                              />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        );
                      })}
                    </List>
                  )}
                  {validationResults.length == 0 && (
                    <Typography variant="h6">
                      No Super BOM Files Found
                    </Typography>
                  )}
                </Box>
                {(isValidating || isImporting) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(255,255,255,0.7)",
                      zIndex: 10,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body1"
                        style={{ marginLeft: "5rem", marginBottom: "1.5rem" }}
                      >
                        {isImporting
                          ? "Importing files..."
                          : "Validating files..."}
                      </Typography>
                      <CircularProgress />
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        ) : (
          <LeadTimeControl></LeadTimeControl>
        )}
      </Box>
    </div>
  );
}
