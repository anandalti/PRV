import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTemplateData } from "../api";


export const fetchTemplateDataAPI = createAsyncThunk(
    'reportTypes/fetchTemplateData',
    async ({sizingId, reportType, configId}) => {
    const response = await fetchTemplateData(sizingId, reportType, configId);
    return response;
});

const apiReportTypes = [
    { id: 0, key: "divider0", name: "---", isDefault: true, disabled: true },
    { id: 7, key: "TagSummary", name: "Tag Summary Report", isDefault: false },
    { id: 0, key: "divider1", name: "---", isDefault: true, disabled: true },
    { id: 2, key: "DataSheet", name: "Data Sheet", isDefault: false },
    { id: 1, key: "CalcSheet", name: "Calc Sheet", isDefault: false },
    { id: 3, key: "DrawingSheet", name: "Drawing Sheet", isDefault: false },
    { id: 5, key: "ConfigSheet", name: "Configuration Report", isDefault: false },
    { id: 0, key: "divider2", name: "---", isDefault: true, disabled: true },
    { id: 4, key: "TankCalcSheet", name: "Tank Calc Sheet", isDefault: false },
    { id: 6, key: "FlowCurveSheet", name: "Flow Curve Report", isDefault: false },
    { id: 0, key: "divider3", name: "---", isDefault: true, disabled: true },
    { id: 9, key: "ProjectSummary", name: "Project Summary Report", isDefault: false },
    { id: 8, key: "ModelSummary", name: "Model Summary Report", isDefault: false },
    { id: 11, key: "InternalPricingSummary", name: "Internal Pricing Summary Report", isDefault: false },
    { id: 10, key: "PricingSummary", name: "Pricing Summary Report", isDefault: false }
];

const apiReportTemplateHtml = [`<html><head></head><body><table><tr><td>No report Selected</td></tr></table></body></html>`];

export const reportTypesSlice = createSlice({
    name: "reportTypes",
    initialState: {
        idle: true,
        error: null,
        selectedReportType: {id: ""},
        reportTypes: apiReportTypes,
        reportTemplateHtml: apiReportTemplateHtml
    },
    reducers: {
        onReportTypeSelected(state, action) {
            const id = action.payload;
            state.selectedReportType = apiReportTypes.find(item => item.id === id.id);
            state.reportTemplateHtml = [`<html><head></head><body><table><tr><td>${state.selectedReportType.name}</td></tr></table></body></html>`];
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchTemplateDataAPI.fulfilled, (state, action) => {
            state.idle = true;
            state.reportTemplateHtml = action.payload;
        })
        .addCase(fetchTemplateDataAPI.rejected, (state, action) => {
            state.idle = true;
            state.error = action.payload;
            state.reportTemplateHtml = [`<html><head></head><body><table><tr><td>Error loading report template</td></tr></table></body></html>`];
        })
        .addCase(fetchTemplateDataAPI.pending, (state) => {
            state.idle = false;
            state.reportTemplateHtml = [`<html><head></head><body><table><tr><td>Loading report template...</td></tr></table></body></html>`];
        })
    }
});
export const reportTypesActions = reportTypesSlice.actions; 