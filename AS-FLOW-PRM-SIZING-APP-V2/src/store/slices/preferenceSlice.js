import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { updateUserPreferenceAPI } from "../api/workflows";
import { login} from "./authSlice";
import preferenceSectionData from "../../data/preferenceSection.json";
import { GetGenericData } from '../api/genericApi';
import { WF_BACKEND_CONFIGURATION_FLAG } from '../../utils/constants';
import { USE_GRAPHQL } from '../api/apiConfig';
import { graphqlClient } from '../../utils/graphqlClient';
import { GET_PREFERENCES_LAYOUT_QUERY } from '../api/graphql/queries';

export const fetchPreferenceSections = createAsyncThunk(
    'preference/preferenceSections',
    async (userId) => {
        let preferenceSection = [];
        if(WF_BACKEND_CONFIGURATION_FLAG){
            try {
                if (USE_GRAPHQL) {
                    const gqlResponse = await graphqlClient.query({
                        query: GET_PREFERENCES_LAYOUT_QUERY,
                        fetchPolicy: 'network-only',
                    });
                    if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
                    preferenceSection = gqlResponse.data.preferencesLayout.data;
                } else {
                    preferenceSection = await GetGenericData(`/layoutData/preferences?userId=${userId}`);
                }
            } catch (error) {
                console.error('Error fetching preference sections:', error);
                preferenceSection = [...preferenceSectionData];
            }
        }else{
            preferenceSection = [...preferenceSectionData];
        }
        return preferenceSection;
    }
);

export const updateUserPreference = createAsyncThunk(
    'preference/updateUserPreferenceData',
    async (data) => {
        const response = await updateUserPreferenceAPI(data.id, data.payload);
        return response;
    }
);

const preferenceSlice=createSlice({
    name:"preference",
    initialState:{
        snakebar: {status:false, message:"", severity:""},
        resetModel: false,
        preferenceMenus: [],
        activePreferenceMenu: 1,
        preferences: [],
        selectedPreferences: [],
        preferenceSections:[],
        status: 'idle',
        error: [],
        preferencePayloadData: {}
    },
    reducers:{
        onSelectPreferenceMenu:(state,action)=>{
            state.activePreferenceMenu = action.payload
        },
        onUpdatePreferenceField: (state, action) => {
            const newSelectedPreference = state.selectedPreferences.filter(item => item.name !== action.payload.name);
            newSelectedPreference.push(action.payload);
            state.selectedPreferences = newSelectedPreference;
            state.preferencePayloadData = {
                ...state.preferencePayloadData,
                [action.payload.name]: action.payload.value
            }
        },
        bulkUpdateSelectedPreferences: (state, action) => {
            //state.selectedPreferences = [...state.selectedPreferences, ...action.payload];
            // state.selectedPreferences = state.selectedPreferences.map((item, index) => ({
            //     ...item,
            //     ...action.payload[index]
            //   }));
              // Create a map from beforeValue
                const beforeValueMap = state.selectedPreferences.reduce((map, item) => {
                    map[item.name] = item;
                    return map;
                }, {});

                // Update map with currentValue entries
                action.payload.forEach(item => {
                    beforeValueMap[item.name] = item;
                });

                // Convert map back to array
                state.selectedPreferences = Object.values(beforeValueMap);
        },
        updatePreferencePayloadData: (state, action) => {
            state.preferencePayloadData = {...state.preferencePayloadData, ...action.payload};
        },
        updatePreferenceSections: (state, action) => {
            state.preferenceSections = action.payload;
        },
        updateResetModel: (state, action) => {
            state.resetModel = action.payload;
        },
        updateSnakebar: (state, action) => {
            state.snakebar = action.payload;
        },
        updatePreferenceError: (state, action) => {
            state.error = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchPreferenceSections.fulfilled, (state, action) => {
            state.preferenceSections = action.payload;
            state.preferenceMenus = action.payload.map((item, index) => {
                return {
                    id: index,
                    name: item.sectionLabel,
                    isCompleted: true,
                    errorType:""
                }
            });

        })
        .addCase(updateUserPreference.fulfilled, (state, action) => {
            state.snakebar = {status:true, message:"Preferences Saved Successfully", severity:"success"};
        })
        .addCase(login.fulfilled, (state, action) => {
           // state.preferences = action.payload.preference;
            const preferences = action.payload.data?.preferences || {};
            state.selectedPreferences = Object.keys(preferences).map(key => {
                return {
                    name: key,
                    value: preferences[key]
                }
            }),
            state.preferencePayloadData = preferences;         
            
        })
    }
});

export const { onSelectPreferenceMenu, 
    onUpdatePreferenceField, 
    updatePreferenceSections, 
    updatePreferencePayloadData, 
    updateResetModel,
    updateSnakebar, 
    bulkUpdateSelectedPreferences,
    updatePreferenceError
} = preferenceSlice.actions;
export default preferenceSlice.reducer