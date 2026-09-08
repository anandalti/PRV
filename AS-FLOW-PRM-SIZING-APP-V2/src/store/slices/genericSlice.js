import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fluidData from "../../data/fluidTypes.json";
import genericError from "../../data/genericErrors.json";
import { GetGenericData } from "../api/genericApi";
import { WF_BACKEND_CONFIGURATION_FLAG } from "../../utils/constants";
import { USE_GRAPHQL } from "../api/apiConfig";
import { graphqlClient } from "../../utils/graphqlClient";
import { GET_FLUIDS_QUERY, GET_GENERIC_ERRORS_GRID_QUERY } from "../api/graphql/queries";

export const fetchFluids = createAsyncThunk(
    'generic/fetchFluids',
    async (userId) => {
        let response = {};
        if(WF_BACKEND_CONFIGURATION_FLAG){
          try {
            if (USE_GRAPHQL) {
                const gqlResponse = await graphqlClient.query({
                    query: GET_FLUIDS_QUERY,
                    fetchPolicy: 'network-only',
                });
                if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                response = gqlResponse.data.fluids.data;
            } else {
                response = await GetGenericData(`/genericdata/fluids?userId=${userId}`);
            }
          } catch (error) {
            response = fluidData;
            console.error('Error fetching fluids:', error);
          }
        }else{
          response = fluidData;
        }
        return response;
    }
);
export const fetchErrors = createAsyncThunk(
    'generic/fetchErrors',
    async (userId) => {
        let response = [];
        if(WF_BACKEND_CONFIGURATION_FLAG){
          try {
            if (USE_GRAPHQL) {
                const gqlResponse = await graphqlClient.query({
                    query: GET_GENERIC_ERRORS_GRID_QUERY,
                    fetchPolicy: 'network-only',
                });
                if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                response = gqlResponse.data.genericErrorsGrid.data;
            } else {
                response = await GetGenericData(`/genericdata/errorsgrid?userId=${userId}`);
            }
          } catch (error) {
            response = genericError;
            console.error('Error fetching genericErrors:', error);
          }
        }else{
          response = genericError;
        }
        return response;
    }
);

export const genericSlice = createSlice({
    name: "generic",
    initialState: {
        fluids:{},
        genericErrors:null,
        focusedFieldName: "",
        status: 'idle'
    },
    reducers: {
        onFluidTypeChange(state, action) {
            const {id, value} = action.payload;
            state[id] = value;
        },
        setFocusedFieldName(state, action) {
            state.focusedFieldName = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchFluids.pending, (state) => {
            state.status = 'loading';
          })
          .addCase(fetchFluids.fulfilled, (state, action) => {
            state.status = 'idle';
            const fluids = action.payload;
            state.fluids = {...state.fluids, ...fluids};
            state.displayUnit = 'English';
          })
          .addCase(fetchFluids.rejected, (state) => {
            state.status = 'failed';
          })
          .addCase(fetchErrors.pending, (state) => {
            state.status = 'loading';
          })
          .addCase(fetchErrors.fulfilled, (state, action) => {
            state.status = 'success';
            state.genericErrors = action.payload;
          })
          .addCase(fetchErrors.rejected, (state) => {
            state.status = 'failed';
          })
    },
});

export const {onFluidTypeChange,setFocusedFieldName}=genericSlice.actions

export default genericSlice.reducer;