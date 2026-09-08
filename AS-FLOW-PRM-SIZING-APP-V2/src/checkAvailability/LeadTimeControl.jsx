import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
} from "@mui/material";
import axios from "./utils/interceptor";
import {
  setLeadTimeData,
  setShouldFetchLeadTimes,
} from "./store/slices/checkAvailabilitySlice";

export default function LeadTimeControl() {
  const [data, setData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const shouldFetchLeadTimes = useSelector(
    (state) => state.checkAvailability?.shouldFetchLeadTimes,
  );
  const leadTimeData = useSelector(
    (state) => state.checkAvailability?.leadTimeData || [],
  );

  const dispatch = useDispatch();

  useEffect(() => {
    setData(leadTimeData);
  }, [leadTimeData]);

  useEffect(() => {
    if (!shouldFetchLeadTimes || leadTimeData.length > 0) {
      return;
    }

    void fetchData();
  }, [shouldFetchLeadTimes, leadTimeData.length]);

  const getDataInForm = (input = []) =>
    input.map((item, idx) => {
      const adder = item?.LeadTimeAdder || {};
      const value = (plant, key) => adder?.[plant]?.[key] ?? "";

      return {
        id: item?.Product,
        product: item?.Product ?? "",
        p1101_min: value("1101", "Minimum"),
        p1101_max: value("1101", "Maximum"),
        p1101_add: value("1101", "Adder"),
        p5gb1_min: value("5GB1", "Minimum"),
        p5gb1_max: value("5GB1", "Maximum"),
        p5gb1_add: value("5GB1", "Adder"),
        p3011_min: value("3011", "Minimum"),
        p3011_max: value("3011", "Maximum"),
        p3011_add: value("3011", "Adder"),
      };
    });

  const fetchData = async () => {
    try {
      const response = await axios.get(`/get-lead-times`);
      const responseData = response?.data || [];
      const preparedData = getDataInForm(responseData);
      setData(preparedData);
      dispatch(setLeadTimeData(preparedData));
      dispatch(setShouldFetchLeadTimes(false));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`/import-lead-times`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...data];
    updated[index][field] = value;
    setData(updated);
    dispatch(setLeadTimeData(updated));
  };

  // const handleSave = async () => {
  //   try {
  //     dispatch(setLeadTimeData(data));
  //     setEditRow(null);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        minHeight: 500,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h5">Lead Time / Adder Control</Typography>

      {/* ✅ CSV Upload Button */}
      <Button sx={{ width: "25%" }} variant="contained" component="label">
        Import CSV
        <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
      </Button>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ maxHeight: 560 }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{ backgroundColor: "background.paper", zIndex: 1 }}
              >
                Plant
              </TableCell>
              <TableCell
                align="center"
                colSpan={3}
                sx={{ backgroundColor: "background.paper", zIndex: 1 }}
              >
                1101
              </TableCell>
              <TableCell
                align="center"
                colSpan={3}
                sx={{ backgroundColor: "background.paper", zIndex: 1 }}
              >
                5GB1
              </TableCell>
              <TableCell
                align="center"
                colSpan={3}
                sx={{ backgroundColor: "background.paper", zIndex: 1 }}
              >
                3011
              </TableCell>
              {/* <TableCell
                align="center"
                sx={{ backgroundColor: "background.paper", zIndex: 1 }}
              >
                Action
              </TableCell> */}
            </TableRow>

            <TableRow>
              <TableCell
                align="center"
                sx={{ backgroundColor: "background.paper", zIndex: 1 }}
              >
                Product
              </TableCell>

              {[...Array(3)].map((_, i) => (
                <React.Fragment key={i}>
                  <TableCell
                    align="center"
                    sx={{ backgroundColor: "background.paper", zIndex: 1 }}
                  >
                    Minimum
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ backgroundColor: "background.paper", zIndex: 1 }}
                  >
                    Maximum
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ backgroundColor: "background.paper", zIndex: 1 }}
                  >
                    Adder
                  </TableCell>
                </React.Fragment>
              ))}

              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, index) => {
              const isEditing = editRow === index;

              return (
                <TableRow key={row.id}>
                  <TableCell align="center">{row.product}</TableCell>

                  {[
                    "p1101_min",
                    "p1101_max",
                    "p1101_add",
                    "p5gb1_min",
                    "p5gb1_max",
                    "p5gb1_add",
                    "p3011_min",
                    "p3011_max",
                    "p3011_add",
                  ].map((field) => (
                    <TableCell key={field} align="center">
                      {
                        row[field]
                        // isEditing ? (
                        //   <TextField
                        //     value={row[field]}
                        //     size="small"
                        //     onChange={(e) =>
                        //       handleChange(index, field, e.target.value)
                        //     }
                        //   />
                        // ) : (

                        // )
                      }
                    </TableCell>
                  ))}

                  {/* <TableCell align="center">
                    {isEditing ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSave()}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setEditRow(index)}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell> */}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
