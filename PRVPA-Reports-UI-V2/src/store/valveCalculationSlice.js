import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchConfigDetailsAPI, fetchDimensionDetailsAPI, fetchSizingDetailsAPI, performCalculationsAPI } from "../api";
import { act } from "react";

export const fetchSizingDetails = createAsyncThunk(
    'getSizingDetails',
    async ({sizingId}) => {
        const response = await fetchSizingDetailsAPI(sizingId);
        return response;
    }
);

export const fetchConfigDetails = createAsyncThunk(
    'getConfigDetails',
    async (data) => {
        const response = await fetchConfigDetailsAPI(data);
        return response;
    }
);

export const fetchDimensionDetails = createAsyncThunk(
    'getDimensionDetails',
    async (data) => {
        const response = await fetchDimensionDetailsAPI(data);
        return response;
    }
);

export const performCalculations = createAsyncThunk(
    'performCalculations',
    async (payload) => {
        const response = await performCalculationsAPI(payload);
        return response;
    }
);

export const valveCalculationSlice = createSlice({
    name: "valveCalculation",
    initialState: {
        idle: true,
        error: null,
        sizingDetails: {},
        sizingError: "",
        configError: "",
        calcError: "",
        refreshReport: false,
        valveCalculationFields: {},
        valveCalculationInputs: [],
        valveCalculationPayload: {}
    },
    reducers: {
        // onValveCalculationUpdated(state, action) {
        //     state.valveCalculationPayload = {...action.payload.valveCalculationPayload};
        // },
        resetRefreshReport(state) {
            state.refreshReport = false;
        },
        resetValveCalculatedFields(state) {
            const newData = Object.keys(state.valveCalculationFields).reduce((acc, key) => {
                acc.push({
                    name: key,
                    ...state.valveCalculationFields[key]
                });
                return acc;
            }, []);
            state.valveCalculationInputs = newData;
            state.valveCalculationPayload = {};
        },
        updateValveCalculation(state, action) {
            const { name, value, uom } = action.payload;
            state.valveCalculationInputs = state.valveCalculationInputs.map((item) => {
                if(item.name === name) {
                    return { ...item, value, uom };
                }
                return item;
            });
            state.valveCalculationPayload = { ...state.valveCalculationPayload, [name]: {value, uom}, updated: true };
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSizingDetails.fulfilled, (state, action) => {
            state.idle = true;
            state.sizingDetails = { ...state.sizingDetails, ...action.payload};
            state.sizingError = '';
            state.error = '';
        })
        .addCase(fetchSizingDetails.rejected, (state, action) => {
            state.idle = true;
            if(action.error.message === 'Network Error') {
                state.error = 'The reporting service may be experiencing an unexpected disruption. Please try again later.';
            } else {
                state.sizingError = action.error ? action.error.message : action.payload;
            }
        })
        .addCase(fetchSizingDetails.pending, (state) => {
            state.idle = false;
        })
        .addCase(fetchConfigDetails.fulfilled, (state, action) => {
            state.idle = true;
            const {sapData, erpPositionMapping, getPriceing} = action.payload;
            state.sizingDetails = {...state.sizingDetails, sapData, erpPositionMapping, getPriceing};
            state.configError = '';
            state.error = '';
        })
        .addCase(fetchConfigDetails.rejected, (state, action) => {
            state.idle = true;
            if(action.error.message === 'Network Error') {
                state.error = 'The reporting service may be experiencing an unexpected disruption. Please try again later.';
            } else {
                state.configError = action.error ? action.error.message : action.payload;
            }
        })
        .addCase(fetchConfigDetails.pending, (state) => {
            state.idle = false;
        })
        .addCase(fetchDimensionDetails.fulfilled, (state, action) => {
            state.idle = true;
            const { dimensionData, valveCalculation } = action.payload;
            const selectedValve = state.sizingDetails.sizingData.SelectedValve[0];
            selectedValve.NoiseForceCalculations = valveCalculation;
            state.sizingDetails.sizingData = {...state.sizingDetails.sizingData, SelectedValve: [selectedValve]};
            state.sizingDetails = {...state.sizingDetails, dimensionData, valveCalculation};
            state.configError = '';
            state.error = '';
        })
        .addCase(fetchDimensionDetails.rejected, (state, action) => {
            state.idle = true;
            if(action.error.message === 'Network Error') {
                state.error = 'The reporting service may be experiencing an unexpected disruption. Please try again later.';
            } else {
                state.configError = action.error ? action.error.message : action.payload;
            }
        })
        .addCase(fetchDimensionDetails.pending, (state) => {
            state.idle = false;
        })
        .addCase(performCalculations.fulfilled, (state, action) => {
            state.idle = true;
            state.sizingDetails.valveCalculation = action.payload;
            state.calcError = '';
        })
        .addCase(performCalculations.rejected, (state, action) => {
            state.idle = true;
            state.sizingDetails.valveCalculation = {};
            if(action.error.message === 'Network Error') {
                state.error = 'The reporting service may be experiencing an unexpected disruption. Please try again later.';
            } else {
                state.calcError = action.error ? action.error.message : action.payload;
            }
        })
        .addCase(performCalculations.pending, (state) => {
            state.idle = false;
        })
    }
});

export const valveCalculationActions = valveCalculationSlice.actions; 