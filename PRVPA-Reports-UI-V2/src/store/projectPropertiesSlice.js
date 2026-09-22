import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addProjectDetailsAPI } from "../api";

export const addProjectDetails = createAsyncThunk(
    "projectProperties/addProjectDetails",
    (payload) => {
        return addProjectDetailsAPI(payload);
    }
)

export const projectPropertiesSlice = createSlice({
    name: "projectProperties",
    initialState: {
        idle: true,
        error: "",
        projectPropertiesData: {
            SizingId:'',
            Id:'',
            ProjectName: '',
            ProjectReferanceNumber: '',
            QuoteNumber: '',
            Client: '',
            Location: '',
            EndUserRefNumber: '',
            CreatedBy:''
        }
    },
    reducers: {
        setProjectPropertiesData: (state, action) => {
            state.projectPropertiesData = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(addProjectDetails.pending, (state) => {
            state.idle = false;
        })
        .addCase(addProjectDetails.fulfilled, (state, action) => {
            state.projectPropertiesData = {
                ...state.projectPropertiesData,
                ...action.payload
            }
            state.idle = true;
        })
        .addCase(addProjectDetails.rejected, (state, action) => {
            state.error = action.error ?? action.payload;
            state.idle = true;
        })
    }
})
export const { setProjectPropertiesData } = projectPropertiesSlice.actions;