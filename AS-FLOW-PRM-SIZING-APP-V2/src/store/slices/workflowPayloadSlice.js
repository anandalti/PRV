import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { makeApiCall } from "../api/commonApiCall";
import {fetchSizingDetails, onUpdateFields, searchSizingBySizingId, saveWorkflowData, fieldCalculationAPI, fieldCalculation_ExecFunction, fetchWorkFlowPopupData, onUpdateListOfFields, onUpdateMultipleFields, fieldCalculation_ExecAPI, fieldValidationAPI, fieldConvertUomAPI, displayUnitConvertUomAPI, fetchRestrictedLiftPopupDetails, isGraphQLAuthError, refreshTokenViaGraphQL} from "./workflowSlice"
import { dropdownOptions, OrificeDropdownOptions, Pressure_Popupo_Fields, Vacuum_Popup_Fields, ValveTypeOptions, VPValveTypeFilterOptions, SIZIND_RESULT_API } from "../../utils/constants";
import { USE_GRAPHQL } from "../api/apiConfig";
import { graphqlClient } from "../../utils/graphqlClient";
import {
  RUN_RESULTS_CALCULATIONS_MUTATION,
  ADD_MULTI_VALVE_ROW_MUTATION,
  REMOVE_MULTI_VALVE_ROW_MUTATION,
  VALIDATE_MULTI_VALVE_ROW_MUTATION,
} from "../api/graphql/queries";

// import { checkCriticalCondition } from "../../utils/validation";
// import uomData from "../../data/uomData.json";

export const getMultiValveSelectionDetail = createAsyncThunk(
  'generic/getMultiValveSelectionDetail',
  async (config, { dispatch }) => {
    if (USE_GRAPHQL) {
      const url = config.url ?? '';

      const executeGQL = async () => {
        if (url.includes('/addRow')) {
          // REST sends the valveData array as the body directly;
          // GQL input wraps it: AddMultiValveRowInput { valveData: [JSON!]! }
          const gqlResponse = await graphqlClient.mutate({
            mutation: ADD_MULTI_VALVE_ROW_MUTATION,
            variables: { input: config.data },
          });
          if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
          return gqlResponse.data.addMultiValveRow.data;

        } else if (url.includes('/validateRow')) {
          // REST body shape matches ValidateMultiValveRowInput exactly
          // { rowIdToValidate, fieldName, valveData, error }
          const gqlResponse = await graphqlClient.mutate({
            mutation: VALIDATE_MULTI_VALVE_ROW_MUTATION,
            variables: { input: config.data },
          });
          if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
          return gqlResponse.data.validateMultiValveRow.data;

        } else if (url.includes('/removeRow')) {
          // Strip 'error' — not a declared field of RemoveMultiValveRowInput
          const { error: _unused, ...removeInput } = config.data;
          const gqlResponse = await graphqlClient.mutate({
            mutation: REMOVE_MULTI_VALVE_ROW_MUTATION,
            variables: { input: removeInput },
          });
          if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
          return gqlResponse.data.removeMultiValveRow.data;
        }
        // Unrecognised URL in GraphQL mode — return null to fall through to REST
        return null;
      };

      try {
        const result = await executeGQL();
        if (result !== null) return result;
      } catch (error) {
        if (isGraphQLAuthError(error)) {
          // Token expired → refresh via GraphQL → retry once
          await refreshTokenViaGraphQL(dispatch);
          return await executeGQL();
        }
        throw error;
      }
    }

    // REST mode
    const response = makeApiCall(config.url, config.method, config.data);
    return response;
  }
);

// export const removeValveFromSelectedMultiValve = createAsyncThunk(
//   'generic/removeValveFromSelectedMultiValve',
//   async (config) => {
//     console.log(config)
//     const response = makeApiCall(config.url, config.method, config.data);
//     return response;
//   }
// );

export const fetchResults = createAsyncThunk(
  'generic/fetchResults',
  async (config, { dispatch }) => {
    if (USE_GRAPHQL) {
      const executeGQL = async () => {
        const gqlResponse = await graphqlClient.mutate({
          mutation: RUN_RESULTS_CALCULATIONS_MUTATION,
          variables: { input: config.data },
        });
        if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
        // GraphQL returns { results, sizingResponse } inside .data — same shape as REST body
        return gqlResponse.data.runResultsCalculations.data;
      };
      try {
        return await executeGQL();
      } catch (error) {
        if (isGraphQLAuthError(error)) {
          // Token expired → refresh via GraphQL → retry once
          await refreshTokenViaGraphQL(dispatch);
          return await executeGQL();
        }
        throw error;
      }
    }
    // REST mode
    const response = makeApiCall(config.url, config.method, config.data);
    return response;
  }
);

export const fetchFilteredResults = createAsyncThunk(
  'generic/fetchFilteredResults',
  async (config) => {
    const response = makeApiCall(config.url, config.method, config.data);
    return response;
  }
);

export const fetchResultsPage = createAsyncThunk(
  'generic/fetchResultsPage',
  async ({ pageNumber, pageSize, extraParams = {} }, { getState }) => {
    const state = getState();
    const payloadData = state.workflowPayload.payloadData;
    // Always include the current displayAllOrifices so page/size changes preserve the orifice filter.
    // extraParams (e.g. from handleCheckboxChange) is spread last and wins over this default,
    // which handles the case where state hasn't updated yet at dispatch time.
    const displayAllOrifices = state.workflowPayload.displayAllOrifices;
    const activeFilters = state.workflowPayload.activeFilters;
    const input = {
      ...payloadData,
      pageNumber,
      pageSize,
      DisplayAllOrifices: displayAllOrifices,
      saveSizingFlag: false,   // page navigation must never trigger a save operation
      ...(Object.keys(activeFilters).length > 0 ? { activeFilters } : {}),
      ...extraParams
    };
    if (USE_GRAPHQL) {
      const gqlResponse = await graphqlClient.mutate({
        mutation: RUN_RESULTS_CALCULATIONS_MUTATION,
        variables: { input },
      });
      if (gqlResponse.errors?.length > 0) throw new Error(gqlResponse.errors[0].message);
      return gqlResponse.data.runResultsCalculations.data;
    }
    // REST mode
    const response = await makeApiCall(SIZIND_RESULT_API, 'post', input);
    return response;
  }
);


const workflowPayloadSlice = createSlice({
  name: "workflowPayload",
  initialState: {
    payloadData: {},
    onBlurPayloadData: {},
    finalData: [],
    resultData: {},
    resultColumns: [],
    displayColumns: [],
    displayColumnsAPI: [],
    resultErrors: [],
    MultiValveFieldSection:null,
    MultiValveSelectionData:null,
    selectedValvesHeader:[],
    status: 'idle',
    error: null,
    sizingData: null,
    displayAllOrifices: false,
    selectedDataset: { label: 'ASME', value: 'ASME' },
    selectedOrificeArea:{ label: 'in²', value: 'area.in2' },
    selectedMetricOrificeArea:{ label: 'cm²', value: 'area.cm2' },
    selectedValveType:{ label: 'All Valve Type', value: 'All' },
    selectedResultRows: [],
    IsMultiValves: false,
    IsGeneric: false,
    uomList: [],
    vpValveTypeOptions: ValveTypeOptions,
    kaDatasetOptions: dropdownOptions,
    advViewResultDisplayFlag:false,
    flowCalcPopupSaved:false,
    IsPopupDataSaved:false,
    FlowRatePopupFlag:false,
    FlowRateVacuumPopupFlag:false,
    proceedButtonDisabledFlag: false,
    ProceedButtonEnableFlag:false,
    totalCounts: {},
    currentPage: 0,
    pageSize: 10,
    filterOptions: {},
    activeFilters: {},
    valveDataChangeFlag:false
  },
  reducers: {
    setValveDataChangeFlag: (state, action) => {
      state.valveDataChangeFlag = action.payload;
    },
    setMultiValveFieldSection: (state, action) => {
      state.MultiValveFieldSection = action.payload;
    },
    setMultiValveSelectionData: (state, action) => {
      state.MultiValveSelectionData = action.payload;
    },
    setSelectedValvesHeader: (state, action) => {
      state.selectedValvesHeader = action.payload;
    },
    setPayloadData: (state, action) => {
      state.payloadData = action.payload;
    },
    setOnBlurPayloadData: (state, action) => {
      state.onBlurPayloadData = action.payload;
    },
    setUomList: (state, action) => {
      state.uomList = action.payload;
    },
    onUpdatePayloadData: (state, action) => {
      // const { name, value } = action.payload;
      // if (name !== '%') {
      //   state.payloadData = {
      //     ...state.payloadData,
      //     [name]: value
      //   };
      // }
    },
    clearPayloadData: (state) => {
      state.payloadData = null;
    },
    setFinalData: (state, action) => {
      state.finalData = action.payload;
    },
    resetResults: (state) => {
      state.resultData = {};
      state.resultColumns = [];
      state.displayColumns = [];
      state.displayColumnsAPI = [];
      state.resultErrors = [];
      state.status = 'idle';
      // state.error = null;
    },
    setResultErrors: (state, action) => {
      state.resultErrors = action.payload;
    },
    setDisplayColumns: (state, action) => {
      state.displayColumns = action.payload;
    },
    setDisplayColumnsAPI: (state, action) => {
      state.displayColumnsAPI = action.payload;
    },
    toggleDisplayAllOrifices: (state) => {
      state.displayAllOrifices = !state.displayAllOrifices;
    },
    setDisplayAllOrifices: (state,action) => {
      state.displayAllOrifices = action.payload;
    },
    setSelectedDataset: (state, action) => {
      state.selectedDataset = action.payload;
      state.currentPage = 0;  // reset to page 1 on dataset change
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.currentPage = 0;
    },
    setSelectedOrificeArea: (state, action) => {
      state.selectedOrificeArea = action.payload;
      
    },

    setSelectedValveType: (state, action) => {
      state.selectedValveType = action.payload;
      
    },
    setProceedButtonDisabledFlag: (state, action) => {
      // console.log('In setSelectedResultRows >>>>>>>> ',action.payload);
      state.proceedButtonDisabledFlag = action.payload;
    },
    setSelectedResultRows: (state, action) => {
      // console.log('In setSelectedResultRows >>>>>>>> ',action.payload);
      state.selectedResultRows = action.payload;
    },
    setMultiValves: (state, action) => {
      state.IsMultiValves = action.payload;
    },
    setGeneric: (state, action) => {
      state.IsGeneric = action.payload;
    },
    updateWorkflowPayload:(state, action)=>{
      state.payloadData = action.payload;
    },
    setVpValveTypeOptions:(state, action)=> {
      state.vpValveTypeOptions = action.payload;
    },
    resetVpValveTypeOptions:(state)=> {
      state.vpValveTypeOptions = ValveTypeOptions;
    },
    setKADataSetOptions:(state, action)=> {
      state.kaDatasetOptions = action.payload;
    },
    resetKADataSetOptions:(state)=> {
      state.kaDatasetOptions = dropdownOptions;
    },
    setAdvViewResultDisplay: (state, action) => {
      state.advViewResultDisplayFlag = action.payload;
    },
    setFlowCalcPopupSaved: (state, action) => {
      state.flowCalcPopupSaved = action.payload;
    },
    setIsPopupDataSaved: (state, action) => {
      state.IsPopupDataSaved = action.payload;
    },
    setFlowRatePopupFlag: (state, action) => {
      state.FlowRatePopupFlag = action.payload;
    },
    setFlowRateVacuumPopupFlag: (state, action) => {
      state.FlowRateVacuumPopupFlag = action.payload;
    },
    setProceedButtonEnableFlag: (state, action) => {
      state.ProceedButtonEnableFlag = action.payload;
    },
    setActiveFilters: (state, action) => {
      state.activeFilters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        if (action.payload?.error !== undefined) {
          state.error = action.payload;
          state.status = 'failed';
          return;
        } else {
          state.status = 'idle';
          const { results,sizingResponse } = action.payload;
          const { columns,displayColumns,displayColumnsAPI, errors, rows, totalCounts, pageNumber: resPage, pageSize: resPageSize, 
            MultiValveFieldSection,SelectedValves, selectedValvesHeader,ProceedButtonEnableFlag,MultiValveSelectionData, filterOptions } = results;
          if(columns!==false){
            const {message,sizingData} = sizingResponse;
            // console.log('In fetchResults.fulfilled >>>>>>>>>>>>>>>> ',rows);
            let localKaDataSet=[];
            let localValveType=[{ label: "All Valve Types", value: 'All' }];
            Object.keys(rows).forEach((key) => {
              const keydata = rows[key];
              if(keydata.length>0){
                localKaDataSet.push({ label: key, value: key });
                keydata.forEach((item) => {
                  if(item['VPValveType']!==null && item['VPValveType']!==''){
                    VPValveTypeFilterOptions.forEach((valveType) => {
                      if(valveType.VPValveType.indexOf(item['VPValveType'])!==-1){
                        if(localValveType.find(it => it.value === valveType.Key)===undefined){
                          localValveType.push({ label: valveType.Value, value: valveType.Key });
                        }
                        
                      }
                    });
                    
                  }
                });
              }
            });
            // console.log('In fetchResults.fulfilled >>>>>>>>>>>>>>>> ',localKaDataSet,localValveType);
            state.kaDatasetOptions = localKaDataSet;
            state.vpValveTypeOptions = localValveType;
            state.resultData = rows;
            state.totalCounts = totalCounts ?? {};
            state.currentPage = resPage   ?? 0;
            state.pageSize    = resPageSize ?? 10;
            state.ProceedButtonEnableFlag = ProceedButtonEnableFlag;
            state.resultColumns = columns;
            state.displayColumns= displayColumns;
            state.displayColumnsAPI= displayColumnsAPI ?? displayColumns;
            state.MultiValveFieldSection = MultiValveFieldSection ?? null;
            state.MultiValveSelectionData = MultiValveSelectionData !== undefined ? {...MultiValveSelectionData} : null;
            state.selectedResultRows = SelectedValves ?? [];
            state.selectedValvesHeader = selectedValvesHeader ?? [];
            if(sizingData!==undefined && sizingData!==null){
              state.sizingData = sizingData[0];
            }
            
          }else{
            state.resultData = rows;
            state.totalCounts = totalCounts ?? {};
            state.currentPage = resPage   ?? 0;
            state.pageSize    = resPageSize ?? 10;
            state.ProceedButtonEnableFlag = false;
            // state.resultColumns = columns;
            state.displayColumns= displayColumns;
            state.status = 'failed';
          }
          state.advViewResultDisplayFlag=true;
          state.resultErrors = errors;
          state.filterOptions = filterOptions ?? {};
          state.activeFilters = {};
          state.flowCalcPopupSaved=false;
        }
      })
      .addCase(fetchResults.rejected, (state) => {
        state.status = 'failed';
        state.flowCalcPopupSaved=false;
      })
      .addCase(fetchResultsPage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchResultsPage.fulfilled, (state, action) => {
        if (action.payload?.error !== undefined) {
          state.status = 'failed';
          return;
        }
        state.status = 'idle';
        const { results } = action.payload;
        const { rows, totalCounts, pageNumber: resPage, pageSize: resPageSize, errors, filterOptions, MultiValveSelectionData } = results;
        console.log('In fetchResultsPage.fulfilled >>>>>>>>>>>>>>>> ',rows);
        state.resultData  = rows;
        state.totalCounts = totalCounts  ?? {};
        state.currentPage = resPage      ?? 0;
        state.pageSize    = resPageSize  ?? 10;
        state.MultiValveSelectionData = MultiValveSelectionData ?? null;
        if (filterOptions) state.filterOptions = { ...state.filterOptions, ...filterOptions };
        if (errors) state.resultErrors = errors;
      })
      .addCase(fetchResultsPage.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(fetchFilteredResults.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFilteredResults.fulfilled, (state, action) => {
        // console.log(' >>>>>>>>> In fetchFilteredResults.fulfilled >>>> ',action.payload);
        // if (action.payload?.error !== undefined) {
        //   state.error = action.payload;
        //   state.status = 'failed';
        //   return;
        // } else {
        //   state.status = 'idle';
        //   const { results,sizingResponse } = action.payload;
        //   const { columns,displayColumns,displayColumnsAPI, errors, rows } = results;
        //   if(columns!==false){
        //     const {message,sizingData} = sizingResponse;
        //     // console.log('In fetchResults.fulfilled >>>>>>>>>>>>>>>> ',rows);
        //     let localKaDataSet=[];
        //     let localValveType=[{ label: "All Valve Types", value: 'All' }];
        //     Object.keys(rows).forEach((key) => {
        //       const keydata = rows[key];
        //       if(keydata.length>0){
        //         localKaDataSet.push({ label: key, value: key });
        //         keydata.forEach((item) => {
        //           if(item['VPValveType']!==null && item['VPValveType']!==''){
        //             VPValveTypeFilterOptions.forEach((valveType) => {
        //               if(valveType.VPValveType.indexOf(item['VPValveType'])!==-1){
        //                 if(localValveType.find(it => it.value === valveType.Key)===undefined){
        //                   localValveType.push({ label: valveType.Value, value: valveType.Key });
        //                 }
                        
        //               }
        //             });
                    
        //           }
        //         });
        //       }
        //     });
        //     // console.log('In fetchResults.fulfilled >>>>>>>>>>>>>>>> ',localKaDataSet,localValveType);
        //     state.kaDatasetOptions = localKaDataSet;
        //     state.vpValveTypeOptions = localValveType;
        //     state.resultData = rows;
        //     state.resultColumns = columns;
        //     state.displayColumns= displayColumns;
        //     state.displayColumnsAPI= displayColumnsAPI ?? displayColumns;
        //     if(sizingData!==undefined && sizingData!==null){
        //       state.sizingData = sizingData[0];
        //     }
            
        //   }else{
        //     state.status = 'failed';
        //   }
        //   state.advViewResultDisplayFlag=true;
        //   state.resultErrors = errors;
        //   state.flowCalcPopupSaved=false;
        // }
      })
      .addCase(fetchFilteredResults.rejected, (state) => {
        state.status = 'failed';
        state.flowCalcPopupSaved=false;
      })
      .addCase(getMultiValveSelectionDetail.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getMultiValveSelectionDetail.fulfilled, (state, action) => {
        const { MultiValveSelectionData,selectedValves, selectedValvesHeader,ProceedButtonEnableFlag } = action.payload;
        state.MultiValveSelectionData = {...MultiValveSelectionData};
        state.selectedValvesHeader = [...selectedValvesHeader];
        state.selectedResultRows = [...selectedValves];
        state.ProceedButtonEnableFlag = ProceedButtonEnableFlag ?? false;
        // console.log({selectedValves});
        let localMultiValveFieldSection = {...state.MultiValveFieldSection};
        let totalRequiredArea = {...localMultiValveFieldSection['totalRequiredArea']};
        totalRequiredArea['value'] = MultiValveSelectionData?.totalRequiredArea ?? '';
        totalRequiredArea['uomValue'] = MultiValveSelectionData?.OrificeAreaUOM ?? '';
        totalRequiredArea['defaultUOMValue'] = MultiValveSelectionData?.OrificeAreaUOM ?? '';
        let totalSelectedArea = {...localMultiValveFieldSection['totalSelectedArea']};
        totalSelectedArea['value'] = MultiValveSelectionData?.totalSelectedArea ?? '';
        totalSelectedArea['uomValue'] = MultiValveSelectionData?.OrificeAreaUOM ?? '';
        totalSelectedArea['defaultUOMValue'] = MultiValveSelectionData?.OrificeAreaUOM ?? '';
        let RequiredPressFlow = {...localMultiValveFieldSection['RequiredPressFlow']};
        RequiredPressFlow['value'] = MultiValveSelectionData?.RequiredPressFlow ?? '';
        RequiredPressFlow['uomValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';
        RequiredPressFlow['defaultUOMValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';
        let RatedPressFlow = {...localMultiValveFieldSection['RatedPressFlow']};
        RatedPressFlow['value'] = MultiValveSelectionData?.RatedPressFlow ?? '';
        RatedPressFlow['uomValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';
        RatedPressFlow['defaultUOMValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';
        let TotalActualPressFlow = {...localMultiValveFieldSection['TotalActualPressFlow']};
        TotalActualPressFlow['value'] = MultiValveSelectionData?.TotalActualPressFlow ?? '';
        TotalActualPressFlow['uomValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';
        TotalActualPressFlow['defaultUOMValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';

        let TotalSelectedPercentage = {...localMultiValveFieldSection['TotalSelectedPercentage']};
        TotalSelectedPercentage['value'] = MultiValveSelectionData?.TotalSelectedPercentage ?? '';
        TotalSelectedPercentage['defaultValue'] = MultiValveSelectionData?.TotalSelectedPercentage ?? '';
          localMultiValveFieldSection = {
            ...localMultiValveFieldSection,
            'totalRequiredArea': totalRequiredArea,
            'totalSelectedArea': totalSelectedArea,
            'RequiredPressFlow': RequiredPressFlow,
            'RatedPressFlow': RatedPressFlow,
            'TotalActualPressFlow': TotalActualPressFlow,
            'TotalSelectedPercentage': TotalSelectedPercentage
          }
        state.MultiValveFieldSection = localMultiValveFieldSection;
          // console.log({MultiValveFieldSection: localMultiValveFieldSection,MultiValveSelectionData});
        state.status = 'idle';

      })
      .addCase(getMultiValveSelectionDetail.rejected, (state) => {
        state.status = 'failed';
        state.flowCalcPopupSaved=false;
        state.ProceedButtonEnableFlag = false;
      })
      // .addCase(removeValveFromSelectedMultiValve.pending, (state) => {
      //   state.status = 'loading';
      // })
      // .addCase(removeValveFromSelectedMultiValve.fulfilled, (state, action) => {
      //   const { MultiValveSelectionData,selectedValves, selectedValvesHeader } = action.payload;
      //   state.MultiValveSelectionData = MultiValveSelectionData;
      //   state.selectedValvesHeader = selectedValvesHeader;
      //   // state.selectedResultRows = selectedValves;
      //   // console.log(MultiValveSelectionData);
      //   let localMultiValveFieldSection = {...state.MultiValveFieldSection};
      //   let totalRequiredArea = {...localMultiValveFieldSection['totalRequiredArea']};
      //   totalRequiredArea['value'] = MultiValveSelectionData?.totalRequiredArea ?? '';
      //   totalRequiredArea['uomValue'] = MultiValveSelectionData?.OrificeAreaUOM ?? '';
      //   totalRequiredArea['defaultUOMValue'] = MultiValveSelectionData?.OrificeAreaUOM ?? '';
      //   let totalSelectedArea = {...localMultiValveFieldSection['totalSelectedArea']};
      //   totalSelectedArea['value'] = MultiValveSelectionData?.totalSelectedArea ?? '';
      //   totalSelectedArea['uomValue'] = MultiValveSelectionData?.OrificeAreaUOM ?? '';
      //   totalSelectedArea['defaultUOMValue'] = MultiValveSelectionData?.OrificeAreaUOM ?? '';
      //   let RequiredPressFlow = {...localMultiValveFieldSection['RequiredPressFlow']};
      //   RequiredPressFlow['value'] = MultiValveSelectionData?.RequiredPressFlow ?? '';
      //   RequiredPressFlow['uomValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';
      //   RequiredPressFlow['defaultUOMValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';
      //   let RatedPressFlow = {...localMultiValveFieldSection['RatedPressFlow']};
      //   RatedPressFlow['value'] = MultiValveSelectionData?.RatedPressFlow ?? '';
      //   RatedPressFlow['uomValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';
      //   RatedPressFlow['defaultUOMValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';
      //   let TotalActualPressFlow = {...localMultiValveFieldSection['TotalActualPressFlow']};
      //   TotalActualPressFlow['value'] = MultiValveSelectionData?.TotalActualPressFlow ?? '';
      //   TotalActualPressFlow['uomValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';
      //   TotalActualPressFlow['defaultUOMValue'] = MultiValveSelectionData?.FlowCapacityUOM ?? '';

      //   let TotalSelectedPercentage = {...localMultiValveFieldSection['TotalSelectedPercentage']};
      //   TotalSelectedPercentage['value'] = MultiValveSelectionData?.TotalSelectedPercentage ?? '';
      //   TotalSelectedPercentage['defaultValue'] = MultiValveSelectionData?.TotalSelectedPercentage ?? '';
      //     localMultiValveFieldSection = {
      //       ...localMultiValveFieldSection,
      //       'totalRequiredArea': totalRequiredArea,
      //       'totalSelectedArea': totalSelectedArea,
      //       'RequiredPressFlow': RequiredPressFlow,
      //       'RatedPressFlow': RatedPressFlow,
      //       'TotalActualPressFlow': TotalActualPressFlow,
      //       'TotalSelectedPercentage': TotalSelectedPercentage
      //     }
      //   state.MultiValveFieldSection = localMultiValveFieldSection;
  
      //   state.status = 'idle';

      // })
      // .addCase(removeValveFromSelectedMultiValve.rejected, (state) => {
      //   state.status = 'failed';
      //   state.flowCalcPopupSaved=false;
      // })
      .addCase(fetchWorkFlowPopupData.fulfilled, (state, action) => {
                
        const popupDataFlag=action.payload===undefined?false:true;
        
        state.workflowPopup = popupDataFlag?action.payload?.workflowPopup:null;
        const {workflowId,searchFlag}=action.payload!==undefined?action.payload:{workflowId:null,searchFlag:false};
        const localEnterTankData=workflowId===12?popupDataFlag:false;
        
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >> 2222 >>>> ',searchFlag,action.payload,popupDataFlag);
        if(!searchFlag){
          if(popupDataFlag){
              let localPayloadData = {
                ...state.payloadData,
                'EnterTankData': localEnterTankData 
              }
              const popupFields=action.payload?.workflowPopup?.fields;
              if(popupFields!==undefined && popupFields!==null){
                // const {localfields,localpayload}=funcSetDefaultValues(popupFields,[],localPayloadData);
                // localPayloadData={...localpayload};
                // let VacuumChangedFlag=localPayloadData['IsVacuumOnly']===true && localPayloadData['API2000WreqVChanged']===true ?false:true;
                // let PressureChangedFlag=localPayloadData['IsPressuremOnly']===true && localPayloadData['API2000WreqChanged']===true ?false:true;

                popupFields?.forEach((item) => {
                  // VacuumChangedFlag=!VacuumChangedFlag && Vacuum_Popup_Fields.includes(item.fieldName)?false:true;
                  // PressureChangedFlag=!PressureChangedFlag && Pressure_Popupo_Fields.includes(item.fieldName)?false:true;

                  // if(VacuumChangedFlag || PressureChangedFlag){
                    let defaultValue = item.fieldName==='Relieving' || item.fieldName==='Operating' || item.fieldName==='SystemMAWP' || item.fieldName==='OperatingPressure' ?localPayloadData[item.fieldName]:item.type==='radio'?item?.fieldList!==undefined?item?.fieldList[0]?.fieldName:item?.defaultValue:item.type==='checkbox'?item.defaultValue===''?false:item.defaultValue:typeof item.defaultValue==='object'?Array.isArray(item.defaultValue)?'':item.defaultValue.value:typeof item.defaultValue==='string'?item.defaultValue:typeof item.defaultValue==='boolean'? item.defaultValue===''?false:item.defaultValue:item.defaultValue;
                    
                      localPayloadData = {
                        ...localPayloadData,
                        [item.fieldName]: defaultValue 
                      };
                  // }
                 
                });
              }
              state.payloadData = {...localPayloadData};
            
          }
        }
        // state.error = null
        state.status = 'success';
      })
      .addCase(fetchSizingDetails.fulfilled, (state, action) => {
        // console.log("in workflowPayloadSlice >>>>>>", action.payload)
        let resdata = action.payload?.data[0];

        if (resdata) {
            // Replace null values with an empty string
            // Object.keys(resdata).forEach(key => {
            //     if (resdata[key] === null) {
            //         resdata[key] = '';
            //     }
            // });
            Object.keys(resdata).forEach(item => {
                if (item !== '%') {
                  state.payloadData = {
                    ...state.payloadData,
                    [item]: resdata[item] !== null?resdata[item]:'' 
                  };
                }
            });
    
           // state.payloadData = resdata;
            state.sizingData = resdata;
        }
      })
      .addCase(displayUnitConvertUomAPI.fulfilled, (state, action) => {
          let newPayloadData = {...state.payloadData}
          const payload = action.payload.response;
          const updatedFields=payload?.convertedValue;
          // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>>>>>>>>>>> 2222 ',updatedFields)
          Object.keys(newPayloadData).forEach((item) => {
                if (updatedFields[item] !== undefined && updatedFields[item] !== null && updatedFields[item] !== "") {
                    newPayloadData[item] = updatedFields[item];
                }
                // console.log(item,updatedFields[item])
          });
          Object.keys(updatedFields).forEach((key)=>{
                const field = Object.keys(newPayloadData).find(f => f === key);
                if (field === undefined) {
                      newPayloadData[key] = updatedFields[key];
                }
            });
          state.payloadData = {...newPayloadData};
          state.status = 'success';
      })
      .addCase(fieldConvertUomAPI.fulfilled, (state, action) => {
          let newPayloadData = {...state.payloadData}
          const payload = action.payload.response;
          const updatedFields=payload?.convertedValue;
          // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>>>>>>>>>>> 2222 ',updatedFields)
          Object.keys(newPayloadData).forEach((item) => {
                if (updatedFields[item] !== undefined && updatedFields[item] !== null && updatedFields[item] !== "") {
                    newPayloadData[item] = updatedFields[item];
                }
            });
            state.payloadData = {...newPayloadData};
            state.status = 'success';
      })
      .addCase(fieldValidationAPI.fulfilled, (state, action) => {
            let newPayloadData = {...state.payloadData}
            const config = action.payload.config;
            const payload = action.payload.response;
            // const localFieldName = Object.keys(payload.data);
            const updatedFields=payload?.results?.inputs;
            // console.log(payload,config)
            let changed = false;
            Object.keys(newPayloadData).forEach((item) => {
              const multiFields=item?.split('|');
              if(multiFields.length>1){
                multiFields.forEach((localFieldName)=>{
                  if (updatedFields[localFieldName] !== undefined && newPayloadData[localFieldName] !== updatedFields[localFieldName]) {
                      newPayloadData[localFieldName] = updatedFields[localFieldName];
                      changed = true;
                  }
                });
              }else if (updatedFields[item] !== undefined && updatedFields[item] !== null && newPayloadData[item] !== updatedFields[item]) {
                  newPayloadData[item] = updatedFields[item];
                  changed = true;
              }
            });
            Object.keys(updatedFields).forEach((key)=>{
                const field = Object.keys(newPayloadData).find(f => f === key);
                if (field === undefined) {
                      newPayloadData[key] = updatedFields[key];
                      changed = true;
                }
            });
            // Only assign new references when something actually changed.
            // Previously this always created new payloadData/onBlurPayloadData objects
            // on every validation response, causing unnecessary usePopupPanel re-renders.
            if (changed) {
                state.payloadData = {...newPayloadData};
                state.onBlurPayloadData = {...newPayloadData};
            }
            state.status = 'success';
        })
      .addCase(fieldCalculationAPI.fulfilled, (state, action) => {
        let newPayloadData = {...state.payloadData}
        const payload=action.payload.response;
        const config = action.payload.config;
        const localFieldName = Object.keys(payload.data);
        let value='';
        let relievingValue = newPayloadData['Relieving'];
        let SizingBasis = state.payloadData['SizingBasis'];
        // let tempUom = newPayloadData['TemperatureUOM'];
        // console.log('In field CalculationAPI::fulfilled :: workflowPayloadSlice>>>>>>>>>>>>>>> ',config,localFieldName)

        localFieldName.forEach((fieldName) => {
            let localPayloadData = state.payloadData[fieldName];
            // value = payload.data[fieldName] === null ? '' : payload.data[fieldName];
            if (localPayloadData === undefined) {
              value = payload.data[fieldName] === null ? '' : payload.data[fieldName];
              newPayloadData[fieldName] = value;
            } else {
                value = payload.data[fieldName] === null ? '' : payload.data[fieldName];
                newPayloadData[fieldName] = value;
            }
            let selectedWorkFlowId = config.selectedWorkFlowId;
            if(selectedWorkFlowId===13 && fieldName==='SaturatedSteam'){
              // console.log('In field CalculationAPI: 22222 :: workflowPayloadSlice>>>>>>>>>>>>>>>>>>>>>>>. ',fieldName,value,state.payloadData['Relieving'])
              newPayloadData['Relieving'] = value;
            }else if((fieldName==='SaturatedSteam' && value!=='')){
              // console.log('In field CalculationAPI: 33333 :: workflowPayloadSlice>>>>>>>>>>>>>>>>>>>>>>>. ',fieldName,value,state.payloadData['Relieving'])
              
              if(SizingBasis!=='Economizer' && SizingBasis!=='Preheater'){
                let isSaturatedSteam = state.payloadData['IsSaturatedSteam'];
                if(state.payloadData['Relieving']===undefined || selectedWorkFlowId===13){
                  newPayloadData['Relieving'] = value;
                }else if(state.payloadData['Relieving']==='' || state.payloadData['Relieving']===null || isSaturatedSteam===true ||  parseFloat(value) > parseFloat(state.payloadData['Relieving'])){
                    newPayloadData['Relieving'] = value;
                }
              }
            }
        })
        
        // if(!!config?.data?.TemperatureUOM){
            const tempUOM = state.payloadData['TemperatureUOM'];
            // console.log('In field CalculationAPI>>>>>>>>>> WorkflowPayload >>>>>>>>>>>>>',tempUOM,config?.TemperatureUOM)
            if(tempUOM===undefined || tempUOM==='' || tempUOM===null){
              newPayloadData['TemperatureUOM'] = config?.TemperatureUOM;
            // }else if(tempUOM?.value==='' || tempUOM?.value===null || tempUOM?.value===undefined){
            //   newPayloadData['TemperatureUOM'] = config?.TemperatureUOM;
            }
            // console.log('In field CalculationAPI>>>>>>>>>> WorkflowPayload 22222 >>>>>>>>>>>>>',tempUOM,newPayloadData['TemperatureUOM'])
        // }
        // newSelectedFields.push(action.payload);
        state.status = 'success';
        // console.log('In field CalculationAPI::fulfilled:: newPayloadData >>>>>>>>>>>>>>> ',SizingBasis,newPayloadData)
        state.payloadData = {...newPayloadData};
        // state.fieldChangeFlag = true;
      })
      .addCase(fetchRestrictedLiftPopupDetails.fulfilled, (state, action) => {
            const RLPopupDetails = action.payload.data;
            let newPayloadData = {...state.payloadData}
            const popupFields=RLPopupDetails?.fields;
            popupFields?.forEach((item) => {
              newPayloadData[item.fieldName]=item?.defaultValue;
              // console.log('WorkflowPayload >>>>>>> ',item?.fieldName,item?.defaultValue,item?.LROptions);
              if(item?.fieldName==='LiftRestriction'){
                newPayloadData['LROptions']=item?.LROptions?[...item?.LROptions]:[];
              }
            });
            state.payloadData = {...newPayloadData};
            state.status = 'success';
            // state.apiLoadingSpinner = false;
        })
      .addCase(fieldCalculation_ExecFunction.fulfilled, (state, action) => {
        let newPayloadData = {...state.payloadData}
        const result=action.payload;
        
        Object.keys(result).forEach((fieldName) => {
          if(fieldName!=='Error'){
            newPayloadData[fieldName] = action.payload[fieldName];
          }
        });
        state.status = 'success';
        // console.log('In field field Calculation_ExecFunction::fulfilled:: payloadData:: action >>>>>>>>>>>>>>> ',action.payload)
        
        state.payloadData = {...newPayloadData};
     })
     .addCase(fieldCalculation_ExecAPI.fulfilled, (state, action) => {
        let newPayloadData = {...state.payloadData}
        const result=action.payload;
        
        Object.keys(result).forEach((fieldName) => {
          if(fieldName!=='Error'){
            newPayloadData[fieldName] = action.payload[fieldName];
          }
        });
        state.status = 'success';
        // console.log('In field field Calculation_ExecFunction::fulfilled:: payloadData:: action >>>>>>>>>>>>>>> ',action.payload)
        
        state.payloadData = {...newPayloadData};
     })
      .addCase(saveWorkflowData.fulfilled, (state, action) => {
        if (action.payload?.data === null) {
          state.error = "Error in saving Sizing data";
          state.status = 'failed';
          state.sizingData = null;
          return;
        } else {
          state.status = 'idle';
          const { sizingData,ProceedButtonEnableFlag } = action.payload;
          state.sizingData = sizingData[0];
          state.ProceedButtonEnableFlag = ProceedButtonEnableFlag ?? false;
        }
      })
      .addCase(onUpdateMultipleFields, (state,action) => {
        let localpayload={...state.payloadData};
        // console.log('search SizingBySizingId in workflowPaloadSlice >>>> ',action.payload)
        let resdata = action.payload;
        if (resdata && resdata !== null) {
          const WorkFlowId=resdata['WorkFlowId']
            Object.keys(resdata).forEach(item => {
                
                if(item==='OrificeAreaUOM'){
                  if(resdata[item]!==null && resdata[item]!==''){
                    let orificeArea = OrificeDropdownOptions.find(it => it.value == resdata[item]);
                    state.selectedOrificeArea= {...orificeArea};
                  }
                }else if(item==='KADataSet'){
                  state.selectedDataset = { label: resdata[item], value: resdata[item] };
                }else if(item==='IsMultivalve'){
                  state.IsMultiValves = resdata[item];
                }else if(item==='IsGeneric'){
                  state.IsGeneric = resdata[item];
                }else if(item==='IsDisplayAllOrifices'){
                  state.displayAllOrifices = resdata[item];
                }else if (item !== '%') {
                  if(WorkFlowId==12 && item==='IsHorizontalOrientation'){
                    const fieldValue=resdata[item]?'IsHorizontalOrientation':'Vertical'
                    
                    localpayload = {
                      ...localpayload,
                      [item]: resdata[item] !== null ? resdata[item] : '',
                      'horizontalvertical':resdata[item] !== null ? fieldValue : 'IsHorizontalOrientation'
                    };
                  }else if(WorkFlowId==12 && item==='Ends'){
                    
                    localpayload = {
                      ...localpayload,
                      [item]: resdata[item] !== null?resdata[item]:'',
                      'EndsGroup':resdata[item] !== null ? resdata[item] : 'FlatEnds',
                      'FlatEnds':resdata[item] !== null ? resdata[item]==='FlatEnds'?true:false:false,
                      'EllipticalEnds':resdata[item] !== null ? resdata[item]==='EllipticalEnds'?true:false:false,
                      'HemisphericalEnds':resdata[item] !== null ? resdata[item]==='HemisphericalEnds'?true:false:false
                    };
                  }else if(item==='Diameter_d_UOM'){
                    localpayload = {
                      ...localpayload,
                      [item]: resdata[item] !== null?resdata[item]:'',
                      'LengthUOM':resdata[item]
                    }; 
                  }else{
                    localpayload = {
                      ...localpayload,
                      [item]: resdata[item] !== null?resdata[item]:'' 
                    };
                  }
                  // console.log('In workflowPayloadSlice % >> ', localpayload)
                }else{
                  console.log('inside workflowPayloadSlice % >>', item)
                }
            });
            
        };
        state.payloadData = {...localpayload};
      })
      .addCase(onUpdateFields, (state, action) => {
        const { name, value } = action.payload;
        // console.log('Popup Change 11111 >>>>>>>>>>> :::onUpdateFields::payload  111111>>>>>>>> ',name, value)
        if (name !== '%') {
          state.payloadData = {
            ...state.payloadData,
            [name]: value
          };
          if(action.payload?.mirrorId!==undefined && action.payload?.mirrorId!==null && action.payload?.mirrorId!==''){
            // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>> onUpdateFields::: WorkflowPayloadSlice >>>> ', action.payload);
            state.payloadData = {
              ...state.payloadData,
              [action.payload?.mirrorId]: value
            }
          }
          
        
        }
      })
      .addCase(onUpdateListOfFields, (state,action) => {
        let resdata = action.payload;
        // console.log('In use PopupPanel:::onUpdateListOfFields::  111111>>>>>>>> ',resdata.payloadData)
        state.payloadData ={...resdata.payloadData};
      })
      .addCase(searchSizingBySizingId.fulfilled, (state, action) => {
        let localpayload={...state.payloadData};
        // console.log('search SizingBySizingId in workflowPaloadSlice >>>> ',action.payload)
        let resdata = action.payload?.data !== null?action.payload?.data[0]:null;
        if (resdata && resdata !== null) {
          const WorkFlowId=resdata['WorkFlowId']
            Object.keys(resdata).forEach(item => {
                
                if(item==='OrificeAreaUOM'){
                  if(resdata[item]!==null && resdata[item]!==''){
                    let orificeArea = OrificeDropdownOptions.find(it => it.value == resdata[item]);
                    state.selectedOrificeArea= {...orificeArea};
                  }
                }else if(item==='MultiValveSelectionData'){
                  state.MultiValveSelectionData = {...resdata[item]};
                }else if(item==='SelectedValves'){
                  state.selectedResultRows = [...resdata[item]];
                }else if(item==='KADataSet'){
                  state.selectedDataset = { label: resdata[item], value: resdata[item] };
                }else if(item==='IsMultivalve'){
                  state.IsMultiValves = resdata[item];
                }else if(item==='IsGeneric'){
                  state.IsGeneric = resdata[item];
                }else if(item==='IsDisplayAllOrifices'){
                  state.displayAllOrifices = resdata[item];
                }else if (item !== '%') {
                  if(item==='IsHorizontalOrientation'){
                    const fieldValue=resdata[item]?'IsHorizontalOrientation':'Vertical'
                    
                    localpayload = {
                      ...localpayload,
                      [item]: resdata[item] !== null ? resdata[item] : '',
                      'horizontalvertical':resdata[item] !== null ? fieldValue : 'IsHorizontalOrientation'
                    };
                  }else if(item==='Ends'){
                    
                    localpayload = {
                      ...localpayload,
                      [item]: resdata[item] !== null?resdata[item]:'',
                      'EndsGroup':resdata[item] !== null ? resdata[item] : 'FlatEnds',
                      'FlatEnds':resdata[item] !== null ? resdata[item]==='FlatEnds'?true:false:false,
                      'EllipticalEnds':resdata[item] !== null ? resdata[item]==='EllipticalEnds'?true:false:false,
                      'HemisphericalEnds':resdata[item] !== null ? resdata[item]==='HemisphericalEnds'?true:false:false
                    };
                    
                  }else{
                    localpayload = {
                      ...localpayload,
                      [item]: resdata[item] !== null?resdata[item]:'' 
                    };
                  }
                  // console.log('In workflowPayloadSlice % >> ', localpayload)
                }else{
                  console.log('inside workflowPayloadSlice % >>', item)
                }
            });
            state.payloadData = {...localpayload};
        }else{
            state.SizingIdError = true;
        }
        state.sizingData = resdata;
      });
  },
});

export const {
  setPayloadData,
  setUomList,
  onUpdatePayloadData,
  clearPayloadData,
  setFinalData,
  resetResults,
  setDisplayColumns,
  setDisplayColumnsAPI,
  toggleDisplayAllOrifices,
  setDisplayAllOrifices,
  setSelectedDataset,
  setSelectedOrificeArea,
  setSelectedValveType,
  setSelectedResultRows,
  setMultiValves,
  setGeneric,
  updateWorkflowPayload,
  setVpValveTypeOptions,
  resetVpValveTypeOptions,
  setKADataSetOptions,
  resetKADataSetOptions,
  setAdvViewResultDisplay,
  setFlowCalcPopupSaved,
  setIsPopupDataSaved,
  setFlowRatePopupFlag,
  setFlowRateVacuumPopupFlag,
  setOnBlurPayloadData,
  setMultiValveFieldSection,
  setSelectedValvesHeader,
  setMultiValveSelectionData,
  setResultErrors,
  setProceedButtonDisabledFlag,
  setProceedButtonEnableFlag,
  setCurrentPage,
  setPageSize,
  setActiveFilters,
  setValveDataChangeFlag,
} = workflowPayloadSlice.actions;
export default workflowPayloadSlice.reducer;
