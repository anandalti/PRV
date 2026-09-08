import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import genericValveSizing from "../../data/genericValveSizing.json";
import { GVS_WORKFLOW_RULES } from "../../utils/constants";
import { fetchGenericValves } from "../api/workflows";
import { onSelectSizingMethodology } from "./workflowSlice";
import { updateOrificeData } from "../../utils/utility";

export const fetchGVSSections = createAsyncThunk(
  "genericValveSizing/fetchGVSSections",
  async () => {
    const gvsSections = genericValveSizing;
    return gvsSections;
  }
);
export const fetchGVSWorkflowRules = createAsyncThunk(
  "genericValveSizing/fetchGVSWorkflowRules",
  async () => {
    const workflowData = {};
    for (const file of GVS_WORKFLOW_RULES) {
      const module = await import(
        `./../../data/gvs-workflow-rules/${file}.json`
      );
      const workflowName = file.replace(".json", "");
      workflowData[workflowName] = module.default;
    }
    return workflowData;
  }
);

export const getGenericValves = createAsyncThunk(
  "genericValveSizing/fetchGenericValves",
  async (payload) => {
    const response = await fetchGenericValves(payload);
    return response;
  }
);

const genericValveSizingSlice = createSlice({
  name: "genericValveSizing",
  initialState: {
    gvsPayloadData: {},
    gvsSections: [],
    genericSizingEnabled: false,
    gvsBrands: [],
    selectedBrand: null,
    gvsModels: [],
    selectedModel: null,
    gvsOrifice: [],
    selectedOrifice: null,
    gvsWorkflowRules: {},
    gvsSelectedFields: [],
    gvsSectionBlocks: [],
    genericResult: [],
    genericValves: [],
    gvsModal: false,
    fieldChangeFlag: true,
    error: null,
    focusedFieldName: "",
  },
  reducers: {
    onClear: (state) => {
      state.gvsPayloadData = {};
      state.gvsSelectedFields = [];
      state.gvsSectionBlocks = [];
    },
    toggleGenericSizing: (state, action) => {
      state.genericSizingEnabled = action.payload;
      if (action.payload) {
        if (!state.gvsModal) state.gvsModal = true;
      } else {
        state.gvsModal = false;
      }
    },
    onUpdateGenericValveSizingModal: (state, action) => {
      state.gvsModal = action.payload;
    },
    setFieldChangeFlag: (state, action) => {
      state.fieldChangeFlag = action.payload;
    },
    onUpdateFields: (state, action) => {
      let uomData = action.payload.uomData;
      delete action.payload.uomData;
      const newSelectedFields = state.gvsSelectedFields.filter(
        (item) => item.name !== action.payload.name
      );
      newSelectedFields.push(action.payload);
      state.fieldChangeFlag = true;
      state.gvsSelectedFields = newSelectedFields;
      const { name, value } = action.payload;
      // console.log('In use PopupPanel:::onUpdateFields::  111111>>>>>>>> ',name, value)
      if (name !== "%") {
        state.gvsPayloadData = {
          ...state.gvsPayloadData,
          [name]: value,
        };
        if (
          action.payload?.mirrorId !== undefined &&
          action.payload?.mirrorId !== null &&
          action.payload?.mirrorId !== ""
        ) {
          // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>> onUpdateFields::: WorkflowPayloadSlice >>>> ', action.payload);
          state.gvsPayloadData = {
            ...state.gvsPayloadData,
            [action.payload?.mirrorId]: value,
          };
        }
      }
      if (action.payload?.name === "KandAdataset") {
        if (!state.selectedOrifice) return;
        updateOrificeData(state, action.payload.value, uomData);
      }
    },
    onUpdateSelectedFields(state, action) {
      state.gvsSelectedFields = action.payload;
    },
    setPayloadData: (state, action) => {
      state.gvsPayloadData = action.payload;
    },
    setGVSSectionBlocks: (state, action) => {
      state.gvsSectionBlocks = action.payload;
    },
    setFocusedFieldName(state, action) {
      state.focusedFieldName = action.payload;
    },
    setSelectedBrand: (state, action) => {
      state.selectedBrand = action.payload;
      if (action.payload) {
        const uniqueModelsMap = new Map(
          state.genericValves
            .filter((item) => item.BrandId == action.payload.value)
            .map((item) => [item.ModelId, item])
        );
        const uniqueModels = Array.from(uniqueModelsMap.values()).map(
          (item) => ({
            label: String(item.ModelNumber),
            value: String(item.ModelId),
          })
        );
        state.gvsModels = uniqueModels;
        state.selectedModel = null;
        state.selectedOrifice = null;
        state.gvsOrifice = [];
      }
    },
    setSelectedModel: (state, action) => {
      state.selectedModel = action.payload;
      if (action.payload) {
        const uniqueOrificeMap = new Map(
          state.genericValves
            .filter(
              (item) =>
                item.ModelId == action.payload.value &&
                item.BrandId == state.selectedBrand.value
            )
            .map((item) => [item.ValveId, item])
        );
        const uniqueOrifice = Array.from(uniqueOrificeMap.values()).map(
          (item) => {
            if (item.Orifice) {
              return {
                label: String(item.Orifice),
                value: String(item.ValveId),
              };
            } else {
              return {
                label: `${String(item.InletSize)}"x${String(item.OutletSize)}"`,
                value: String(item.ValveId),
              };
            }
          }
        );
        state.gvsOrifice = uniqueOrifice;
        state.selectedOrifice = null;
      }
    },
    setSelectedOrifice: (state, action) => {
      const uomData = action.payload?.uomData;
      delete action.payload?.uomData;
      state.selectedOrifice = action.payload;
      if (
        state?.gvsPayloadData?.KandAdataset === "ASME" ||
        state?.gvsPayloadData?.KandAdataset === "API"
      )
        updateOrificeData(state, state?.gvsPayloadData?.KandAdataset, uomData);
    },
  },
  extraReducers: (builder) => {
    // fetchGVSSections
    builder
      .addCase(fetchGVSSections.fulfilled, (state, action) => {
        state.gvsSections = action.payload;
        // state.error = null;
        state.status = "success";
      })
      .addCase(fetchGVSSections.pending, (state) => {
        state.gvsSections = [];
        state.status = "loading";
      })
      .addCase(fetchGVSSections.rejected, (state, action) => {
        state.gvsSections = [];
        state.status = "failed";
        state.error = action.error.message;
      });

    // update on sizing method change
    builder.addCase(onSelectSizingMethodology, (state) => {
      state.gvsPayloadData = {};
      state.gvsSelectedFields = [];
      state.gvsSectionBlocks = [];
      state.genericValves = [];
      state.gvsBrands = [];
      state.gvsModels = [];
      state.gvsOrifice = [];
      state.selectedBrand = null;
      state.selectedModel = null;
      state.selectedOrifice = null;
    });
    builder
      .addCase(fetchGVSWorkflowRules.fulfilled, (state, action) => {
        state.gvsWorkflowRules = action.payload;
        // state.error = null;
        state.status = "success";
      })
      .addCase(fetchGVSWorkflowRules.pending, (state) => {
        state.gvsWorkflowRules = {};
        state.status = "loading";
      })
      .addCase(fetchGVSWorkflowRules.rejected, (state, action) => {
        state.gvsWorkflowRules = {};
        state.status = "failed";
        state.error = action.error.message;
      });

    // getGenericValves
    builder
      .addCase(getGenericValves.fulfilled, (state, action) => {
        state.genericValves = action.payload;
        const uniqueBrandsMap = new Map(
          action.payload.map((item) => [item.BrandId, item])
        );
        const uniqueBrands = Array.from(uniqueBrandsMap.values()).map(
          (item) => ({
            label: String(item.Brand),
            value: String(item.BrandId),
          })
        );
        state.gvsBrands = uniqueBrands;
        // state.error = null;
        state.status = "success";
      })
      .addCase(getGenericValves.pending, (state) => {
        state.genericValves = [];
        state.status = "loading";
      })
      .addCase(getGenericValves.rejected, (state, action) => {
        state.genericValves = [];
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const {
  onUpdateGenericValveSizingModal,
  onUpdateFields,
  onClear,
  onUpdateSelectedFields,
  setPayloadData,
  setGVSSectionBlocks,
  setFocusedFieldName,
  toggleGenericSizing,
  setSelectedBrand,
  setSelectedModel,
  setSelectedOrifice,
} = genericValveSizingSlice.actions;

export default genericValveSizingSlice.reducer;
