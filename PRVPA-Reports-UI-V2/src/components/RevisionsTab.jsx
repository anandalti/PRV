import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Button } from "@mui/material";
import { layoutActions } from "../store/layoutSlice";
import styles from "../styles/Home.module.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateRevisions } from "../store/actions/revisonsActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import CurrentRevisonData from "../workflowSelection/CurrentRevision.json";
import { updateTagRevision } from "../store/revisionsSlice";
import { fetchSizingDetails } from "../store/valveCalculationSlice";

const RevisionsTab = () => {
  const dispatch = useDispatch();
  const {
    menus,
    sizingId: SizingId,
    configId,
  } = useSelector((state) => state.layout);
  const { initialRow, revisionsData } = useSelector((state) => state.revisions);
  const {
    sizingDetails: {
      sizingData: {
        SizingDetails: [{ Id: sizingId }],
      },
    },
  } = useSelector((state) => state.valveCalculation);

  const prevMenu = menus.find((menu) => menu.id === 3);
  const nextMenu = menus.find((menu) => menu.id === 5);
  const { onSelectMenu, markComplete } = layoutActions;

  const [selectedRow, setSelectedRow] = useState(null);
  const [editableRow, setEditableRow] = useState(null);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newRows = [...revisionsData];
    const newRow = { ...revisionsData[index] };
    newRow[name] = value;
    newRows[index] = newRow;
    dispatch(updateRevisions(newRows));
  };

  const handleAddRow = () => {
    dispatch(updateRevisions([initialRow, ...revisionsData]));
  };

  const handleRemoveRow = (index) => {
    const newRows = revisionsData.filter((_, i) => i !== index);
    dispatch(updateRevisions(newRows));
    if (selectedRow === index) setSelectedRow(null);
    if (editableRow === index) setEditableRow(null);
  };

  const handleRowClick = (index) => {
    if (editableRow === index) return;
    setSelectedRow(index);
  };

  const handleInputDoubleClick = (index, event) => {
    event.stopPropagation();
    setEditableRow(index);
  };

  return (
    <>
      <Modal.Header>
        <Modal.Title> Tag Revisions </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="overflow-auto mb-3">
          <table
            cellSpacing="0"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              border: "1px solid black",
              fontSize: "9pt",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "darkgray" }}>
                <th style={{ width: "5%" }}>
                  <Button variant="secondary" onClick={handleAddRow}>
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </th>
                <th style={{ width: "5%" }}>No</th>
                <th style={{ width: "7%" }}>Prpd</th>
                <th style={{ width: "7%" }}>Chk</th>
                <th style={{ width: "7%" }}>Appr</th>
                <th style={{ width: "15%" }}>Date</th>
                <th style={{ width: "54%" }}>Revision</th>
              </tr>
            </thead>

            <tbody>
              {revisionsData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(index)}
                  style={{
                    backgroundColor:
                      selectedRow === index ? "lightgray" : "transparent",
                    cursor: "pointer",
                    borderTop: "1px solid black",
                  }}
                >
                  <td>
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRow(index);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        style={{ color: "red" }}
                      />
                    </Button>
                  </td>

                  {CurrentRevisonData[0].fields.map((field, i) => (
                    <td key={i}>
                      <input
                        className="border-0 w-100"
                        style={{
                          backgroundColor:
                            editableRow === index ? "white" : "transparent",
                        }}
                        type={field.fieldType}
                        name={field.fieldName}
                        value={row[field?.fieldName]}
                        onDoubleClick={(e) => handleInputDoubleClick(index, e)}
                        readOnly={editableRow !== index}
                        onChange={(event) => handleChange(index, event)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <footer>
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <Button
            className={styles.footerButton}
            variant="secondary"
            onClick={() => {
              dispatch(onSelectMenu(prevMenu));
            }}
            style={{ marginRight: "10px" }}
          >
            Previous
          </Button>

          <Button
            className={styles.footerButton}
            variant="primary"
            onClick={() => {
              dispatch(
                updateTagRevision({
                  revisionsData: [...revisionsData],
                  sizingId,
                })
              ).then(() => {
                dispatch(markComplete({ id: 4 }));
                dispatch(onSelectMenu(nextMenu));
                dispatch(fetchSizingDetails({ sizingId: SizingId }));
                toast.success("Updated Revisions");
              });
            }}
          >
            Next
          </Button>
        </div>
      </footer>
    </>
  );
};

export default RevisionsTab;
