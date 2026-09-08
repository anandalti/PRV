import { createSlice } from "@reduxjs/toolkit";
import { fetchWorkflowSections, onSelectFluidType, onSelectSizingMethodology, onSelectValveCategory } from "../slices/workflowSlice";

const navigationSlice=createSlice({
    name:"navigation",
    initialState:{
        menus: [
            {
                id: 1,
                name: "Valve Category"
            },
            {
                id: 2,
                name: "Fluid Types"
            },
            {
                id: 3,
                name: "Sizing Methodology"
            }
        ],
        workflowMenus: [],
        activateResults: false,
        activeMenu: 0
    },
    reducers:{
        onSelectMenu:(state,action)=>{
            // console.log('onSelectMenu :: >>>>>>>>>>>>>>> ',action.payload)
            state.activeMenu = action.payload
        },
        updateSelectedValues:(state,action)=>{
            const selectedMenuIndex = action.payload;
            const selectedValue = state.menus.id;
            state.menus[selectedMenuIndex].isCompleted=true
            state.menus[selectedMenuIndex].isSelected=true
            state.menus[selectedMenuIndex].selectedValues = [...state.menus[selectedMenuIndex].selectedValues, selectedValue]
        },
        addNavigationValue:(state,action)=>{
            // const localMenus=[...state.menus,...action.payload]
            
            state.menus=[...state.menus,...action.payload]
        },
        updateNavigationValue:(state,action)=>{
            // console.log('In nav update>>> ',state.menus,action.payload)
            state.menus=action.payload
        },
        setActivateResults:(state,action)=>{
            state.activateResults = action.payload
        },
        updateNavigationMenu:(state,action)=>{
            const updatedNavMenu = [
                ...state.menus?.filter(item => item.id <= 3),
                ...action.payload?.map(item => ({
                    ...item,
                    selectedValues: []
                }))
            ];

            // console.log('inside navigation slide >>>>>',action.payload, state.menus, updatedNavMenu)
            state.menus = updatedNavMenu
            //state.menus = action.payload
        },
        resetNavigationMenu:(state)=>{
            state.menus = [
                {
                    id: 1,
                    name: "Valve Category",
                    isCompleted: false,
                    errorType:""
                },
                {
                    id: 2,
                    name: "Fluid Types",
                    isCompleted: false,
                    errorType:""
                },
                {
                    id: 3,
                    name: "Sizing Methodology",
                    isCompleted: false,
                    errorType:""
                }
            ];
            state.activateResults = false;
            state.workflowMenus = [];
        }

    },
    extraReducers: (builder) => {
        builder
        .addCase(onSelectValveCategory, (state) => {
            state.menus = state.menus.reduce((acc, item) => {
                if (item.id === 1) {
                   acc.push({
                        ...item,
                        isCompleted: true,
                        errorType:""
                    });
                }
                else if (item.id <= 3) {
                    acc.push({
                        ...item,
                        isCompleted: false,
                        errorType:""
                    });
                }
                return acc;
            }, []);
        })
        .addCase(onSelectFluidType, (state) => {
            state.menus = state.menus.reduce((acc, item) => {
                if (item.id === 2) {
                    acc.push({
                        ...item,
                        isCompleted: true,
                        errorType:""
                    });
                }
                else if (item.id <= 3) {
                    acc.push({
                        ...item,
                        isCompleted: item.id === 1,
                        errorType:""
                    });
                }
                return acc;
            }, []);
        })
        .addCase(onSelectSizingMethodology, (state) => {
            state.menus = state.menus.reduce((acc, item) => {
                if (item.id === 3) {
                    acc.push({
                        ...item,
                        isCompleted: true,
                        errorType:""
                    });
                }
                else {
                    acc.push({
                        ...item
                    });
                }
                return acc;
            }, []);
        })
        .addCase(fetchWorkflowSections.fulfilled, (state, action) => {
            state.menus = state.menus.filter((item) => item.id <= 3);
            state.workflowMenus = action?.payload===undefined?[]:action?.payload?.map((item, index) => {
                return {
                    id: state.menus.length + index + 1,
                    name: item.sectionLabel,
                    selectedValues: [],
                    isCompleted: false,
                    errorType:""
                }
            });
            state.menus = [...state.menus, ...state.workflowMenus];
        })
       
        ;
    }
});

export const { onSelectMenu,addNavigationValue,updateNavigationValue,setActivateResults, updateNavigationMenu, resetNavigationMenu } = navigationSlice.actions;
export default navigationSlice.reducer