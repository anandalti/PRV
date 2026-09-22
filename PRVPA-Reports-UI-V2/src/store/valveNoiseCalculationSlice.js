import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const defaultUnits = {
    "OutletDiameter": 'in',
    "ReactionForce": "daN",
    "NoiseLevel": "db",
    "DistanceFromValve": "ft",
    "Velocity": "ft/s",
    "SoundPowerLevel": "db",
    "SoundPressureLevelatDistancefromValve": "db"
}

export const valveNoiseCalculationSlice = createSlice({
    name: "valveNoiseCalculation",
    initialState: {
        idle: true,
        error: null,
        fields: {},
        uomUnits: {}
    },
    reducers: {
        initFields(state, action) {
            state.fields = action.payload.fields.reduce((acc, field) => ({
                ...acc,
                [field.fieldName]: field.defaultValue || ""
            }), {});
            state.uomUnits = action.payload.fields.reduce((acc, field) => {
                return({
                ...acc,
                [field.fieldName]: defaultUnits[field.fieldName]
            })}, {});
        },
        updateFieldValue(state, action) {
            const { fieldName, value } = action.payload;
            state.fields[fieldName] = value;
        },
        updateUom(state, action) {
            console.log({action});
            const { fieldName, newUom } = action.payload;
            state.uomUnits[fieldName] = newUom;
        }
    }
});

export const { initFields, updateFieldValue, updateUom } = valveNoiseCalculationSlice.actions;