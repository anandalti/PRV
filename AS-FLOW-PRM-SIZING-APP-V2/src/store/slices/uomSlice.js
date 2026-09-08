import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import uomData from "../../data/uomData.json";
import { fetchUomAPI } from "../api/workflows";
import { WF_BACKEND_CONFIGURATION_FLAG } from "../../utils/constants";
import { USE_GRAPHQL } from "../api/apiConfig";
import { graphqlClient } from "../../utils/graphqlClient";
import { GET_UOM_DETAILS_QUERY } from "../api/graphql/queries";

export const fetchUom = createAsyncThunk("uom/fetchUom", async (userId) => {
  if (USE_GRAPHQL) {
    try {
      const gqlResponse = await graphqlClient.query({
        query: GET_UOM_DETAILS_QUERY,
        fetchPolicy: 'network-only',
      });
      if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
      // Return in same shape as REST: { status, data: { uoms, defaultUoms } }
      // so the uomSlice reducer's action.payload?.data?.uoms path still works
      return { status: 'Success', data: gqlResponse.data.uomDetails.data };
    } catch (error) {
      console.error('[GraphQL] fetchUom failed, falling back to REST:', error.message);
    }
  }
  const response = await fetchUomAPI(userId);
  return response;
});

export const uomSlice = createSlice({
  name: "uom",
  initialState: {
    units: {},
    displayUnitList: [
      { value: "All", label: "All" },
      { value: "English", label: "English" },
      { value: "Metric", label: "Metric" },
    ],
    defaultUnits: {
      English: {
        abspressure: "abspressure.psia",
        pressure: "pressure.psig",
        temperature: "temp.degF",
        massflow: "massflow.lbhr",
        gasvolflow: "gasvolflow.SCFM",
        liquidvolflow: "liquidvolflow.GPMUS",
        length: "length.ft",
        lengthforvalve: "lengthforvalve.in",
        specificvolume: "specificvolume.ft3lb",
        viscosity: "viscosity.cp",
        density: "density.lbft3",
        massflux: "massflux.lbhrft2",
        specificheat: "specificheat.BTUlbF",
        latentheat: "latentheat.BTUlb",
        volume: "volume.ft3",
        area: "area.ft2",
        thermalconductivity: "thermalconductivity.BTUsftR",
        heattransfer: "heattransfer.BTUsft2R",
      },
      Metric: {
        abspressure: "abspressure.bara",
        pressure: "pressure.barg",
        temperature: "temp.degC",
        massflow: "massflow.kghr",
        gasvolflow: "gasvolflow.Nm3min",
        liquidvolflow: "liquidvolflow.Lmin",
        length: "length.m",
        lengthforvalve: "lengthforvalve.cm",
        specificvolume: "specificvolume.Lkg",
        viscosity: "viscosity.cp",
        density: "density.kgL",
        massflux: "massflux.kghrcm2",
        specificheat: "specificheat.KJkgC",
        latentheat: "latentheat.calg",
        volume: "volume.m3",
        area: "area.m2",
        thermalconductivity: "thermalconductivity.WmK",
        heattransfer: "heattransfer.Wm2K",
      },
    },
    displayUnit: "",
    status: "idle",
    uomChangeFlag: false,
  },
  reducers: {
    onUnitTypeChange(state, action) {
      const { id, value } = action.payload;
      state[id] = value;
    },
    onUpdateDefaultUnits(state, action) {
      state.defaultUnits = action.payload;
    },
    setUomChangeFlag(state, action) {
      state.uomChangeFlag = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUom.pending, (state) => {
        // // console.log('fetched uom data>>>>>>>>>>>> loading')
        state.status = "loading";
      })
      .addCase(fetchUom.fulfilled, (state, action) => {
        state.status = "idle";
        // // console.log('fetched uom data>>>>>>>>>>>> idle')
        let units = action.payload;
        let defaultUnits = { ...state.defaultUnits };

        if(WF_BACKEND_CONFIGURATION_FLAG){
          units = action.payload?.data?.uoms;
          defaultUnits = action.payload?.data?.defaultUoms;
        }
        // // console.log('fetched uom data>>>>>>>>>>>> ',units)
        state.units = { ...state.units, ...units };
        state.defaultUnits = {...defaultUnits };
        // state.defaultUnits = defaultUnits;
        state.displayUnit = "English";
      })
      .addCase(fetchUom.rejected, (state) => {
        // // console.log('fetched uom data>>>>>>>>>>>> failed')
        state.status = "failed";
      });
  },
});
export const { onUpdateDefaultUnits, setUomChangeFlag } = uomSlice.actions;
export default uomSlice.reducer;
