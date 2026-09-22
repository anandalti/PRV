import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchSizingDetails } from "./valveCalculationSlice";
import { updateTagRevisionsAPI } from "../api";

export const updateTagRevision = createAsyncThunk('revisions/updateTagRevisions', (payload) => {
  return updateTagRevisionsAPI(payload);
})

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialRow = {
  id: "",
  number: "",
  preparedBy: "",
  checkedBy: "",
  approvedBy: "",
  date: formatDate(new Date()),
  revision: "",
};

export const revisionsSlice = createSlice({
  name: "revisions",
  initialState: {
    idle: true,
    initialRow,
    revisionsData: [
      {
        id: "",
        number: "",
        preparedBy: "",
        checkedBy: "",
        approvedBy: "",
        date: "",
        revision: "",
      },
    ],
    error: {}
  },
  reducers: {
    updateRevisions (state, action) {
      state.revisionsData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(updateTagRevision.fulfilled, (state, action) => {
      state.idle = true;
    })
    .addCase(updateTagRevision.rejected, (state, action) => {
      state.idle = true;
      state.error = action.payload;
    })
    .addCase(updateTagRevision.pending, (state) => {
      state.idle = false
    })
    .addCase(fetchSizingDetails.fulfilled, (state, action) => {
      if(action.payload?.sizingData?.TagRevisions) {
        state.revisionsData = [...action.payload?.sizingData?.TagRevisions].map((rev) => {
          return {
            id: rev.Id,
            number: rev.Number,
            preparedBy: rev.PreparedBy,
            checkedBy: rev.CheckedBy,
            approvedBy: rev.ApprovedBy,
            date: formatDate(rev.Date),
            revision: rev.Revision
          }
        });
      } else {
        state.revisionsData = [initialRow];
      }
    })
  }
});

const {updateRevisions} = revisionsSlice.actions;
export {
  updateRevisions
}
