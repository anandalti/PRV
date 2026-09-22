import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchUOMAPI } from "../api";

const REPORT_EXPORT_OPTIONS = [
  {
    id: 1,
    name: "pdf",
    icon: "icon-pdf",
    contentType: "application/pdf",
    iconSvg:
      "M12,10.5H13V13.5H12V10.5M7,11.5H8V10.5H7V11.5M20,6V18A2,2 0 0,1 18,20H6A2,2 0 0,1 4,18V6A2,2 0 0,1 6,4H18A2,2 0 0,1 20,6M9.5,10.5A1.5,1.5 0 0,0 8,9H5.5V15H7V13H8A1.5,1.5 0 0,0 9.5,11.5V10.5M14.5,10.5A1.5,1.5 0 0,0 13,9H10.5V15H13A1.5,1.5 0 0,0 14.5,13.5V10.5M18.5,9H15.5V15H17V13H18.5V11.5H17V10.5H18.5V9Z",
    iconColor: "red",
  },
  {
    id: 2,
    name: "xlsx",
    icon: "icon-xlsx",
    contentType: "application/ms-excel",
    iconSvg:
      "M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7 13.06L8.18 15.28H9.97L8 12.06L9.93 8.89H8.22L7.13 10.9L7.09 10.96L7.06 11.03Q6.8 10.5 6.5 9.96 6.25 9.43 5.97 8.89H4.16L6.05 12.08L4 15.28H5.78M13.88 19.5V17H8.25V19.5M13.88 15.75V12.63H12V15.75M13.88 11.38V8.25H12V11.38M13.88 7V4.5H8.25V7M20.75 19.5V17H15.13V19.5M20.75 15.75V12.63H15.13V15.75M20.75 11.38V8.25H15.13V11.38M20.75 7V4.5H15.13V7Z",
    iconColor: "green",
  },
];

export const fetchUOM = createAsyncThunk(
  'layout/fetchUOM',
  (payload) => {
    return fetchUOMAPI(payload);
  }
)

export const layoutSlice = createSlice({
  name: "layout",
  initialState: {
    idle: true,
    isAdvanced: false,
    sizingId: null,
    configId: null,
    menus: [
      {
        id: 1,
        isCompleted: false,
        errorType: '',
        name: "Project Details"
      },
      {
        id: 2,
        isCompleted: false,
        errorType: '',
        name: "Tag Details"
      },
      {
        id: 3,
        isCompleted: false,
        errorType: '',
        name: "Tag Notes"
      },
      {
        id: 4,
        isCompleted: false,
        errorType: '',
        name: "Tag Revisions"
      },
      {
        id: 5,
        isCompleted: false,
        errorType: '',
        name: "Noise/Force Calculations"
      },
      {
        id: 6,
        isCompleted: false,
        errorType: '',
        name: "Reports"
      }
    ],
    selectedMenu: {
      id: 1,
      isCompleted: false,
      errorType: '',
      name: "Project Details"
    },
    uoms: null,
    error: null,
    reportExportOptions: REPORT_EXPORT_OPTIONS
  },
  reducers: {
    changeLayoutView(state) {
      state.isAdvanced = !state.isAdvanced;
    },
    disableMenus(state) {
      state.menus = state.menus.map(menu => {
        return {
          ...menu,
          disabled: true
        }
      });
    },
    saveUrlParams(state, action) {
      state.sizingId = action.payload.sizingId;
      state.configId = action.payload.configId;
    },
    onSelectMenu(state, action) {
      state.selectedMenu = action.payload;
    },
    markComplete(state, action) {
      if(action.payload.id) {
        state.menus = state.menus.map(menu => {
          if (menu.id === action.payload.id) {
            return {
              ...menu,
              isCompleted: true
            }
          }
          return menu;
        });
      } else if(action.payload.ids) {
        state.menus = state.menus.map(menu => {
          if (action.payload.ids.includes(menu.id)) {
            return {
              ...menu,
              isCompleted: true
            }
          }
          return menu;
        }); 
      }
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchUOM.pending, (state) => {
      state.idle = false;
    })
    .addCase(fetchUOM.rejected, (state, action) => {
      state.idle = true;
      state.error = action?.error?.message ?? action.payload;
    })
    .addCase(fetchUOM.fulfilled, (state, action) => {
      state.idle = true;
      state.uoms = action.payload;
    })
  }
})

export const layoutActions = layoutSlice.actions;