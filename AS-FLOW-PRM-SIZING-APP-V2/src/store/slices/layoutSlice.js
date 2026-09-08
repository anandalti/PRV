import { createSlice } from "@reduxjs/toolkit";

const layoutSlice=createSlice({
    name:"layout",
    initialState:{
        isAdvanced:false,
        userPreference:false,
        isMysizing:false
    },
    reducers:{
        changeLayout:(state,action)=>{
            state.isAdvanced=action.payload
        },
        changeUserPreference:(state,action)=>{
            state.userPreference=action.payload
        },
        changeMysizing:(state,action)=>{
            state.isMysizing=action.payload
        }
    }
});

export const {changeLayout, changeUserPreference, changeMysizing}=layoutSlice.actions

export default layoutSlice.reducer