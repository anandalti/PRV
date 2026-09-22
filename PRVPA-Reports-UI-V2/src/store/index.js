import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./authSlice.js";
import { layoutSlice } from "./layoutSlice.js";
import { reportTypesSlice } from "./reportTypesSlice.js";
import { valveCalculationSlice } from "./valveCalculationSlice.js";
import {valveSlice} from "./valveSlice.js";
import {configSlice} from "./configSlice.js";
import { projectPropertiesSlice } from "./projectPropertiesSlice.js";
import { tagPropertiesSlice } from './tagPropertiesSlice.js';
import logger from 'redux-logger';
import { valveNoiseCalculationSlice } from "./valveNoiseCalculationSlice.js";
import { revisionsSlice } from "./revisionsSlice.js";

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        layout: layoutSlice.reducer,
        reportTypes: reportTypesSlice.reducer,
        valveCalculation: valveCalculationSlice.reducer,
        valveData:valveSlice.reducer,
        configData: configSlice.reducer,
        revisions: revisionsSlice.reducer,
        tagProperties: tagPropertiesSlice.reducer,
        projectProperties: projectPropertiesSlice.reducer,
        fieldProperties: valveNoiseCalculationSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger)
});

export default store;


//------------------------------------------------------1st------------------------------
// import { legacy_createStore as createStore } from 'redux';

// const initialState = { counter: 10 }

// const reducerFn = (state = initialState, action) => {
//     if (action.type === "INC") {
//         return { counter: state.counter + 1 };
//     }
//     else if (action.type === "DEC") {
//         return { counter: state.counter - 1 };
//     }
//     else if (action.type === "ADDBY") {
//         return { counter: state.counter + action.payload };
//     }
//     return state;

// }

// const store = createStore(reducerFn);

// export default store;
//------------------------------------------2nd -----------------------------------
// import { configureStore, createSlice } from "@reduxjs/toolkit";
// const counterSlice = createSlice({
//     name: "counter",
//     initialState: { counter: 0 },
//     reducers: {
//         increment(state, action) {
//             state.counter++
//         },
//         decrement(state, action) {
//             state.counter--
//         },
//         addby(state, action) {
//             state.counter += action.payload
//         }
//     }
// });
// export const actions = counterSlice.actions;
// const store = configureStore({
//     reducer: counterSlice.reducer
// });
// export default store;
//--------------------------------------------------------