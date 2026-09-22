import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateTagPropertyAPI } from "../api";

export const updateTagProperty = createAsyncThunk(
    "tagProperties/updateTagProperty",
    (payload) => {
        return updateTagPropertyAPI(payload)
    }
)

export const fetchTagPropertiesBySizingId = createAsyncThunk(
    "tagProperties/fetchTagePropertiesBySizingId",
    (sizingId) => {
        return fetchTagPropertiesBySizingId(sizingId);
    }
)

export const tagPropertiesSlice = createSlice({
    name: 'tagProperties',
    initialState: {
        idle: true,
        error: "",
        tagPropertiesData: {
            SizingId: '',
            TagNumber: '',
            PID: '',
            Service: '',
            LineNumber: '',
            Quantity: '',
            Info1: '',
            Info2: '',
            DataSheetNotes: "",
            IsAutoNumberDSN: false,
            CalculationSheetNotes: "",
            IsAutoNumberDSN: false,
            DrawingSheetNotes: "",
            IsAutoNumberDSN: false
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(updateTagProperty.pending, (state, action) => {
            state.idle = false;
        })
        .addCase(updateTagProperty.fulfilled, (state, action) => {
            state.tagPropertiesData = {
                ...state.tagPropertiesData,
                ...action.payload
            }
            state.idle = true;
        })
        .addCase(updateTagProperty.rejected, (state, action) => {
            state.idle = true;
            state.error = action.error ?? action.payload;
        })
        .addCase(fetchTagPropertiesBySizingId.pending, (state, action) => {
            state.idle = false;
        })
        .addCase(fetchTagPropertiesBySizingId.fulfilled, (state, action) => {
            state.tagPropertiesData = { ...action.payload };
            state.idle = true;
        })
        .addCase(fetchTagPropertiesBySizingId.rejected, (state, action) => {
            state.idle = true;
            state.error = action.error ?? action.payload;
        })
    }
})
