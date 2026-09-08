import { createSlice } from "@reduxjs/toolkit";
import sampleData from "../../Data/Sample.json";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/interceptor.js";

export const factoryCodes = {
  "Stafford, Texas": "1101",
  "Qingpu, Shanghai": "3011",
  "Manchester, UK": "5GB1",
  "Singapore, Singapore": "5SG1",
};

export const fetchTPCData = createAsyncThunk(
  "tpc/fetchTPCDat",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const TPCDataId = state.checkAvailability.TPCDataId;

      if (!TPCDataId) {
        throw new Error("TPCDataId not found in state");
      }

      const response = await axios.post(`/get-tpc-data/`, { TPCDataId });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchSAPMaterials = createAsyncThunk(
  "tpc/fetchSAPMaterials",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const sapNo = state.checkAvailability.ParentSapNumber;
      const Location = state.checkAvailability.factorySelected;

      if (!sapNo) {
        throw new Error("SAP Number not found in state");
      }

      const response = await axios.post(`/get-boms/`, {
        sapNos: Array.from(sapNo),
        plant: factoryCodes[Location] || "1101",
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

const DEFAULT_FACTORY = sampleData.TagData.Location;
const DEFAULT_LEAD_TIME = sampleData.TagData.requestedLeadTime;

const checkAvailabilitySlice = createSlice({
  name: "checkAvailability",
  initialState: {
    TPCDataId: null,
    TagData: null,
    ProcessData: null,
    ConfigData: null,
    ParentSapNumber: null,
    items: null,
    parentBOMS: null,
    childBOMS: null,
    factorySelected: null,
    revisionData: null,
    valveQty: 1,
    leadTimeData: [],
    // // Track editable fields separately so we know if they differ from defaults
    // factorySelected: DEFAULT_FACTORY,
    leadTime: 4,
    // Flag: controls whether the app should fetch lead-times from the API
    shouldFetchLeadTimes: true,
    leadTimeData: [],
    // defaultFactory: DEFAULT_FACTORY,
    // defaultLeadTime: DEFAULT_LEAD_TIME,
    loading: true,
    error: null,
  },
  reducers: {
    setRequestID: (state, action) => {
      state.TPCDataId = action.payload;
    },
    updateTagdata: (state, action) => {
      state.TagData = { ...state.TagData, ...action.payload };
    },
    updateParentSapNumber: (state, action) => {
      state.ParentSapNumber = action.payload;
    },
    updateItems: (state, action) => {
      state.items = action.payload;
    },
    setFactory: (state, action) => {
      state.factorySelected = action.payload;
    },
    setLeadTime: (state, action) => {
      state.leadTime = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setShouldFetchLeadTimes: (state, action) => {
      state.shouldFetchLeadTimes = action.payload;
    },
    setLeadTimeData: (state, action) => {
      state.leadTimeData = action.payload;
      state.shouldFetchLeadTimes = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTPCData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTPCData.fulfilled, (state, action) => {
        const {
          ProcessData,
          ConfigData,
          sapNO,
          latestRevision,
          leadTimeData,
          ...TagData
        } = action.payload;
        const { Location, valveQty } = TagData;
        state.TagData = { ...TagData };
        state.ProcessData = ProcessData;
        state.ConfigData = ConfigData;
        state.ParentSapNumber = sapNO;
        state.factorySelected = Location;
        state.revisionData = latestRevision;
        state.valveQty = valveQty || 1;
        state.leadTimeData = leadTimeData || [];
        if (Array.isArray(sapNO) && sapNO.includes("CUSTOM")) {
          state.loading = false;
        }
      })
      .addCase(fetchTPCData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSAPMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSAPMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.parentBOMS = action.payload.parent;
        state.childBOMS = action.payload.child;
      })
      .addCase(fetchSAPMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setRequestID,
  updateTagdata,
  updateItems,
  setFactory,
  setLeadTime,
  setLoading,
  setError,
  setShouldFetchLeadTimes,
  setLeadTimeData,
} = checkAvailabilitySlice.actions;

export default checkAvailabilitySlice.reducer;
