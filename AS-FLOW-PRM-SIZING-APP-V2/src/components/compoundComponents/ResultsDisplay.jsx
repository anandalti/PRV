import PropTypes from "prop-types";
import MuiDataTable from "./MuiDataTable";
import { useEffect, useState } from "react";
import LabeledDropdown from "../basicComponents/LabeledDropdown";
import { useSelector, useDispatch } from "react-redux";
import { store } from "../../store/store";
import styles from "./../../styles/Home.module.css";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  API2000_WF,
  Areq_WHITELIST_FieldNames,
  AreqALLUOM_WHITELIST_FieldNames,
  DISPLAY_ALL_RESULTS_COLUMNS,
  DISPLAY_GENERIC_SIZING_TOGGLE,
  dropdownOptions,
  ERROR_COLOR,
  Error_Triangle_Image,
  KA_CD_Options,
  KADATSET_IGNORE_DISPLAY,
  LOADING_RESULTS,
  options,
  Orific_Filter_Column,
  OrificeDropdownOptions,
  OrificeMetricDropdownOptions,
  PAGINATION_FLAG,
  TwoPhase_CDSeries_WF,
  ValveTypeOptions,
  VPValveTypeFilterOptions,
  MULTIVALVE_SELECT,
  MULTIVALVE_SECTION_WF,
  MULTIVALVE_CB_WF,
  MV_SELECTION_API,
  MV_SELECTION_ADD_VALVE_API,
  MV_SELECTION_REMOVE_VALVE_API,
  MV_SELECTION_VALIDATE_VALVE_API
} from "../../utils/constants";
import ErrorComponent from "./ErrorComponent";
import Dialog from "../hoc/Dialog";
import Checkbox from "../basicComponents/Checkbox";
import { default as Check } from "@mui/material/Checkbox";
import {
  toggleDisplayAllOrifices,
  setPayloadData,
  setSelectedDataset,
  setSelectedOrificeArea,
  setSelectedResultRows,
  setMultiValves,
  setGeneric,
  setFinalData,
  setSelectedValveType,
  getMultiValveSelectionDetail,
  setDisplayAllOrifices,
  setResultErrors,
  setProceedButtonDisabledFlag,
  setProceedButtonEnableFlag,
  fetchResultsPage,
  setActiveFilters,
  setValveDataChangeFlag,
  
} from "../../store/slices/workflowPayloadSlice";
// import DropDown from '../basicComponents/DropDown';
import "../../App.css";
import Radio from "@mui/material/Radio";
import { styled } from "@mui/material/styles";
import { fieldValidationAPI, onUpdateFields, onUpdateListOfFields } from "../../store/slices/workflowSlice";
import Button from "../basicComponents/Button";
import {
  getGenericValves,
  onUpdateGenericValveSizingModal,
  toggleGenericSizing,
} from "../../store/slices/genericValveSizingSlice";
import useGenericValveSizing from "../../hooks/useGenericValveSizing";
import useResults from "../../hooks/useResult";
import MultivalveSection from "./MultivalveSection";
import useSaveSizing from "../../hooks/useSaveSizing";
import { CleaningServices } from "@mui/icons-material";

// import { useMemo } from 'react';
// import { Style } from '@mui/icons-material';

const CustomRadio = styled(Radio)(({ theme, checked }) => ({
  // border:checked ? '1px solid #90ee90' :'1px solid e7e4e4',
  // borderColor:checked ? '#90ee90' :'#e7e4e4',
  backgroundColor: "#ffffff", //checked ? '#90ee90' : '#f7f7f7',
  padding: "0px",
  "&.Mui-checked": {
    backgroundColor: "#90ee90",
  },
  "&:hover": {
    backgroundColor: checked ? "#90ee90" : "#f7f7f7",
  },
}));

const NoMatchText = (noValveMsgFlag) => {
  return (
    <span style={noValveMsgFlag && { color: ERROR_COLOR, fontWeight: 500 }}>
      {message}
    </span>
  );
};

const ResultsDisplay = ({ dataDisplayFlag = true }) => {
  const { workflows, selectedWorkflow, selectedFields,fieldValidationResults, error } = useSelector(
    (state) => state.workflow
  );
  useGenericValveSizing();
  const dispatch = useDispatch();
  const {
    vpValveTypeOptions,
    resultData,
    sizingData,
    finalData,
    resultColumns,
    displayColumns,
    displayColumnsAPI,
    resultErrors,
    IsMultiValves,
    IsGeneric,
    status,
    displayAllOrifices,
    selectedValveType,
    selectedOrificeArea,
    selectedDataset,
    selectedResultRows,
    selectedValvesHeader,
    payloadData,
    MultiValveFieldSection,
    totalCounts,
    currentPage,
    pageSize,
    filterOptions,
    activeFilters,
    valveDataChangeFlag
  } = useSelector((state) => state.workflowPayload);
  const { isAdvanced } = useSelector((state) => state.layout);
  const { userData } = useSelector(state => state.auth);
  const {handleFilterChange}=useResults();
  const { handleSaveSizingData } = useSaveSizing();

  useEffect(() => {
    let count = 3;
    if (DISPLAY_ALL_RESULTS_COLUMNS) count++;
    if (KADATSET_IGNORE_DISPLAY.indexOf(payloadData["WorkFlowId"]) === -1)
      count++;
    document.documentElement.style.setProperty(
      "--grid-results-filter-items",
      count
    );
  });
  const { genericSizingEnabled } = useSelector(
    (state) => state.genericValveSizing
  );
  const [displayErrors, setDisplayErrors] = useState(false);
  const [customOptions, setCustomOptions] = useState(options);
  const [displayAllFields, setDisplayAllFields] = useState(false);
  const [finalDisplayColumns, setFinalDisplayColumns] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [multivalve, setMultivalve] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [multivalveData, setMultivalveData] = useState([]);
  const [multiValveActionFlag, setMultiValveActionFlag] = useState(false);
  const [filterActionFlag, setFilterActionFlag] = useState(false);
  
  // const handleMultivalveToggle = () =>{
  //   selectedRows
  // }
  const handleGenericToggle = () => {
    if (!genericSizingEnabled) {
      const { WorkFlowId, IsVacuumOnly, IsPressureOnly } = payloadData;
      dispatch(getGenericValves({ WorkFlowId, IsVacuumOnly, IsPressureOnly }));
    }
    dispatch(toggleGenericSizing(!genericSizingEnabled));
  };

  const handleRowSelected = (rowData, rowMeta) => {
    // console.log('inside result page 3>>>>', rowData, rowMeta,selectedRowIndex)
    const selectedIndex = rowData[0];
    let localData = [];
    if (selectedIndex !== undefined) {
      if (
        resultData[selectedDataset.label] !== undefined &&
        resultData[selectedDataset.label].length > 0
      ) {
        localData = [  
                {
                    ...resultData[selectedDataset.label].find(
                      (row) => row.ValveId === selectedIndex
                    ),
                    PoverP: sizingData?.OverPressurePer,
                  }

        ];
        // console.log('inside result page 3>>>> localData >>>', localData);
        
        // if(multivalve){
        //   setSelectedRows(prev =>
        //               prev.includes(selectedIndex)
        //                 ? prev.filter(v => v !== selectedIndex) // unselect
        //                 : [...prev, selectedIndex]              // select
        //             );
        //   localData = [...multivalveData, ...localData];
        // }
      }
    }
    // console.log('inside result page 3>>>> localData >>>', "localData, rowMeta, selectedDataset, selectedIndex >>> ", selectedRows,localData, selectedResultRows)
    dispatch(setSelectedResultRows(localData));
    
    dispatch(setProceedButtonEnableFlag(localData?.length>0))
    setSelectedRowIndex(selectedIndex);
  };

  useEffect(() => {
    if(!sizingData?.IsMultivalve && selectedResultRows?.length > 0){
      // console.log('sizingData >>>>>>>>>>>>>>>>>>>> ',sizingData,selectedResultRows?.length)
      if (
        resultData[selectedDataset.label] !== undefined &&
        resultData[selectedDataset.label].length > 0
      ) {
        let selectedIndex;
        const localdata=resultData[selectedDataset.label]
        if(localdata?.length > 0){
          localdata?.forEach((row,index) => { 
              if(row.ValveId === selectedResultRows[0]?.ValveId){
                selectedIndex = index; 
                return row.ValveId === selectedResultRows[0]?.ValveId 
              } 
            }
          )
        }
        if(selectedIndex !== undefined){
          // console.log('selectedIndex >>>>>>>>>>>> ',selectedIndex)
          setSelectedRowIndex(selectedResultRows[0]?.ValveId);
        }
      }
    }
  },[sizingData])

  const handleMultivalveRowsSelected = (rowData, rowMeta) => {
    // console.log('inside result page 3>>>>', rowData, rowMeta,selectedRowIndex)
    const selectedIndex = rowData[0];
    // const checked=selectedResultRows?.find(row => row.ValveId == selectedIndex) ? true : false;
    // console.log(' 00000000000 >>>>>>>>>> filter >>>>>>>>>>> ',selectedIndex, checked)
    let localData = [];
    if (selectedIndex !== undefined) {
      if (
        resultData[selectedDataset.label] !== undefined &&
        resultData[selectedDataset.label].length > 0
      ) {
        localData = [  
                {
                    ...resultData[selectedDataset.label].find(
                      (row) => row.ValveId === selectedIndex
                    ),
                    // PoverP: sizingData?.OverPressurePer,
                  }

        ];

        // const ValveIdExists= selectedResultRows?.find(row => row.ValveId == selectedIndex) ? true : false;
            setSelectedRows(prev =>
                      prev.includes(selectedIndex)
                        ? prev.filter(v => v !== selectedIndex) // unselect
                        : [...prev, selectedIndex]              // select
                    );
        // if(!checked){
            const currentSelectedRows = store.getState().workflowPayload.selectedResultRows;
            localData = [...currentSelectedRows, ...localData];
        // }else{
        //   // console.log(' >>>>>>>>>> filter >>>>>>>>>>> ',localData, rowData[0])
        //   localData = selectedResultRows?.filter(row => row.ValveId != selectedIndex);
          // console.log(' 222222222 >>>>>>>>>> filter >>>>>>>>>>> ',localData, selectedResultRows)
        // }
      }
    }
    // console.log('inside result page 3>>>> localData >>>', "localData, rowMeta, selectedDataset, selectedIndex >>> ", selectedRows,localData, selectedResultRows)
    
    

    const config={
      url:MV_SELECTION_ADD_VALVE_API,
      method:'post',
      data:{workFlowId:selectedWorkflow, valveData:localData}

    }
    // console.log(config)
    dispatch(getMultiValveSelectionDetail(config)).then(res => {
      // console.log('Add >>>>>>>>>>>>>>> ',selectedIndex,localData,selectedResultRows,res?.payload?.selectedValves)
      // dispatch(setSelectedResultRows(res?.payload?.selectedValves));
      setSelectedRowIndex(selectedIndex);
    });
  };
  const handleMultiValveAction=(item)=>{
    // console.log('In handleChange >>>> In handleMultiValveAction >>>> ',item);
    handleOrificeAreaChange(item);
  }

  const handleSelectedValveAction=(valve,rowData,rowMeta)=>{
    
    const rowId=rowData[1];
    // console.log('handleSelectedValveAction >>>>>>>> ',valve,rowData,rowId,rowMeta,selectedResultRows);
    if(rowMeta?.action==='onChange'){
      // console.log('handleSelectedValveAction >> OnChange >>>>>>>> ',valve,rowData,rowMeta);
      const valveId=rowData[0];
      const currentRow=selectedResultRows?.find(row => row.rowId == rowMeta?.dataIndex +1);
      // console.log('rowMeta >>>>>>>> ',rowMeta);
      let fieldName=rowMeta?.name;
      if(rowMeta?.name==='ValvePset'){
        fieldName='Pset';
      }else if(rowMeta?.name==='ValvePover'){
        fieldName='Pover';
      }else if(rowMeta?.name==='ValvePoverP'){
        fieldName='PoverP';
      }
      dispatch(setValveDataChangeFlag(true));
      let localUpdatedRows=selectedResultRows?.map(row => {
        if(row.rowId == currentRow?.rowId){
          return {...row,
            [fieldName]: rowMeta?.value,
            [rowMeta?.name]: rowMeta?.value,
          }
        }else{
          return row;
        }
      })
      // console.log('localUpdatedRows >>>>>>>> ',localUpdatedRows);
      dispatch(setSelectedResultRows(localUpdatedRows));
    }else if(rowMeta?.action==='onBlur'){
      // console.log('handleSelectedValveAction >> OnBlur >>>>>>>> ',valveDataChangeFlag,valve,rowData,rowMeta,selectedResultRows);
      if(valveDataChangeFlag){
        const valveId=rowData[0];
        
        const fieldName=rowMeta?.name;
          let validateRow=selectedResultRows?.find(row => row.rowId == rowId);
          const config={
          url:MV_SELECTION_VALIDATE_VALVE_API,
          method:'post',
          data:{
            rowIdToValidate: validateRow?.rowId,
            fieldName,
            workFlowId: selectedWorkflow,
            valveData: selectedResultRows,
            error:resultErrors[selectedDataset.label] ?? []
          }

        }
        // const localData=selectedResultRows?.filter(row => row.ValveId != removedData?.ValveId);  
        
        dispatch(getMultiValveSelectionDetail(config)).then(res => {
          
          // const localData=[...res?.payload?.selectedValves];
          
          // let errors = [];//[...error]
          // localData?.forEach(valve => {
          //   if(valve?.errors && valve?.errors?.length > 0){
          //     errors.push(...valve?.errors);
          //   }
          // });
          // let prevErrors = store.getState().workflowPayload.resultErrors[selectedDataset.label] ?? [];
          // prevErrors = prevErrors.filter(e => e.type !== 'MultiValve Error');
          if(res?.payload?.error && res?.payload?.error?.length > 0){
            const multivalveError = res?.payload?.error.find(err => err.type === 'MultiValve Error');
            // console.log('multivalveError >>>>>>>> ',multivalveError);
            if(multivalveError){
              dispatch(setProceedButtonDisabledFlag(true));
            }else{            
              dispatch(setProceedButtonDisabledFlag(false));
            }
            dispatch(setResultErrors({ [selectedDataset.label]: [...res?.payload?.error] }));
          }
          // if(errors.length > 0){
            
          //   dispatch(setResultErrors({ [selectedDataset.label]: [...errors,...prevErrors] }));
          // }else{
          //   dispatch(setResultErrors({ [selectedDataset.label]: [...errors,...prevErrors] }));
          // }
          // console.log('validate >>>>>>>>>>>>>>> ',localData,selectedResultRows,res?.payload?.selectedValves)
          dispatch(setValveDataChangeFlag(false));
          dispatch(setSelectedResultRows(res?.payload?.selectedValves));
          setSelectedRowIndex(valveId);
        });
      }
    }else{
      let removedData=selectedResultRows?.find(row => row.rowId == rowId);
      // console.log('removedData >>>>>>>> ',removedData?.rowId,valve);

      const config={
        url:MV_SELECTION_REMOVE_VALVE_API,
        method:'post',
        data:{
          rowIdToRemove: removedData?.rowId,
          workFlowId: selectedWorkflow,
          valveData: selectedResultRows,
          error:resultErrors[selectedDataset.label] ?? []
        }

      }
      // const localData=selectedResultRows?.filter(row => row.ValveId != removedData?.ValveId);  
      
      dispatch(getMultiValveSelectionDetail(config)).then(res => {
        
         // console.log('Validate >>>>>>>>>>>>>>> ',selectedResultRows,res?.payload?.selectedValves)
        // dispatch(setSelectedResultRows(res?.payload?.selectedValves));
        if(res?.payload?.error && res?.payload?.error?.length > 0){
          const multivalveError = res?.payload?.error.find(err => err.type === 'MultiValve Error');
          // console.log('multivalveError >>>>>>>> ',multivalveError);
          if(multivalveError){
            dispatch(setProceedButtonDisabledFlag(true));
          }else{            
            dispatch(setProceedButtonDisabledFlag(false));
          }
          dispatch(setResultErrors({ [selectedDataset.label]: [...res?.payload?.error] }));
        }
        setSelectedRowIndex(removedData?.ValveId);
      })
    }
  }
  const hasFailedExpression = (errors, expression) => {
    if (!errors || errors.length === 0 || typeof errors==='boolean') {
      return false;
    }
  
    // Group errors by Brand and ModelNumber
    const groupedErrors = errors.reduce((acc, error) => {
      const key = `${error?.Brand} ${error?.ModelNumber}`;
      if (!acc[key]) {
        acc[key] = [];
      }
  
      const failedExpressions = Array.isArray(error?.failedExpressions)
        ? error.failedExpressions.join(", ")
        : error?.failedExpressions;
  
      if (failedExpressions && !acc[key].includes(failedExpressions)) {
        acc[key].push(failedExpressions);
      }
  
      return acc;
    }, {});
  
    // Check if groupedErrors contain the specified expression
    if (Object.keys(groupedErrors).length > 0) {
      const kvltPointR3Keys = Object.keys(groupedErrors).filter((key) =>
        groupedErrors[key].includes("Kv < 0.3")
      );
  
      return Object.keys(groupedErrors).some(
        (key) =>
          !kvltPointR3Keys.includes(key) &&
          groupedErrors[key].includes(expression)
      );
    }
  
    return false;
  };
  
  useEffect(() => {
    // console.log('ResultsDisplay::useEffect triggered >>>>>>>>>>>>>>>>> ', payloadData.ValveId)
    if (payloadData.ValveId) {
      if (
        resultData[selectedDataset.label] !== undefined &&
        resultData[selectedDataset.label].length > 0
      ) {
        const index = resultData[selectedDataset.label].findIndex(
          (valve) => valve.ValveId === payloadData.ValveId
        );
        // console.log('inside result page >>>> useEffect >>>', index, payloadData.ValveId, selectedDataset)
        if (index >= 0) {
          // handleRowSelected(null, {"dataIndex":index})
          handleRowSelected([payloadData.ValveId], { dataIndex: index });
        }
      }
    }
    if (
      payloadData?.Id === undefined ||
      payloadData?.Id === null ||
      payloadData?.Id === ""
    ) {
      // console.log('In Payload Id >>>>>>>>>> ',sizingData)
      const id = sizingData?.Id;
      dispatch(onUpdateFields({ name: "Id", value: id }));
    }
  }, [resultData]);

  useEffect(() => {
    const expressionToCheck = "Vreqp >= 0";

    const message =
      status === "loading"
        ? LOADING_RESULTS?.content
        : hasFailedExpression(
            resultErrors[selectedDataset.label],
            expressionToCheck
          )
        ? `No valves met flowrate. Please use Multivalve.`
        : "No Results found";
    const noValveMsgFlag =
      status === "loading"
        ? false
        : hasFailedExpression(
            resultErrors[selectedDataset.label],
            expressionToCheck
          )
        ? true
        : false;
        
    const newCustomOptions = {
      ...options,
      ...(PAGINATION_FLAG
        ? {
            serverSide: true,
            count: totalCounts[selectedDataset?.value] ?? 0,
            page: currentPage,
            rowsPerPage: pageSize,
            onChangePage: (newPage) => {
              dispatch(fetchResultsPage({ pageNumber: newPage, pageSize }));
            },
            onChangeRowsPerPage: (newPageSize) => {
              dispatch(fetchResultsPage({ pageNumber: 0, pageSize: newPageSize }));
            },
            onFilterChange: (changedColumn, filterList, type) => {
              // Fires for: applyNewFilters() call (type='custom'), chip × removal (type='chip'), RESET (type='reset').
              // filterList is array-of-arrays indexed by column position matching finalDisplayColumns.
              // RESET → type==='reset', filterList is all empty arrays → newActiveFilters={} → full reload.
              const newActiveFilters = {};
              finalDisplayColumns.forEach((col, index) => {
                if (filterList[index]?.length > 0) {
                  newActiveFilters[col.name] = filterList[index];
                }
              });
              dispatch(setActiveFilters(newActiveFilters));
              dispatch(fetchResultsPage({ pageNumber: 0, pageSize }));
            },
            customFilterDialogFooter: (currentFilterList, applyNewFilters) => (
              <>
                {/* Scoped CSS: hide built-in RESET button only while this custom footer is mounted
                    (i.e., only when PAGINATION_FLAG=true). Removed when filter dialog closes. */}
                <style>{`[data-testid="filterReset-button"] { display: none !important; }`}</style>
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  right: '16px',
                  display: 'flex',
                  gap: '8px',
                  zIndex: 1,
                }}>
                  <Button
                    style={{
                      border: '1px solid rgba(0,0,0,0.35)',
                      padding: '3px 10px',
                      fontSize: '11px',
                      lineHeight: 1.5,
                      background: 'transparent',
                    }}
                    onClick={() => {
                      // With confirmFilters removed (false), built-in RESET now calls onFilterReset()
                      // which fires onFilterChange(type='reset') → clears chips + dispatches reset.
                      // Programmatic click resets TableFilter internal state → dropdowns show ALL.
                      const resetBtn = document.querySelector('[data-testid="filterReset-button"]');
                      if (resetBtn) resetBtn.click();
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </>
            ),
          }
        : {
            rowsPerPage: pageSize,
          }),
      rowsPerPageOptions: [10, 25, 50, 100],
      selectableRows: "none",
      tableBodyMaxHeight: sizingData?.multiValveSelectionDisplayFlag? "30rem": "none",
      onRowClick: (rowData, rowMeta) => {
        const newData = rowData.map((row, index) => {
          if (index === 0) {
            return row?.props?.value;
          }
          return row?.props?.children;
        });
        handleRowSelected(newData, rowMeta);
      },
      textLabels: {
        body: {
          noMatch: noValveMsgFlag ? (
            <span style={{ color: ERROR_COLOR, fontWeight: 600 }}>
              {message}
            </span>
          ) : (
            message
          ),
        },
      },
    };
    setCustomOptions(newCustomOptions);
  }, [status, selectedRowIndex, selectedDataset, sizingData?.multiValveSelectionDisplayFlag, selectedRows, totalCounts, currentPage, pageSize, finalDisplayColumns]);

  // console.log('In ResultsDisplay >>>>>>>> 2222 >>>>>>>',dataDisplayFlag,isAdvanced)
  const handleOrificeData = (flag) => {
    let localDisplayColumns=selectedDataset.value==='ASME'?[...displayColumns]:[...displayColumnsAPI];
    return Object.keys(resultData)?.reduce((acc, key) => {
      // console.log('handleOrificeData key 11111>>>>>>>>>>>>>> ',flag,key,resultData[key])
      if(resultData[key].length > 0) {
          if(!flag){
            let localValve=[]
            const localArr=resultData[key].reduce((localAcc, valve) => {
              
              const workflowId=payloadData['WorkFlowId']
              const localKey = API2000_WF.indexOf(workflowId)!==-1?`${valve.ModelId}-${valve.ModelNumber}-${valve.VPValveType}`:`${valve.ModelId}-${valve.ModelNumber}`;
              // const IsCompletexValveCase=payloadData['IsPressureOnly'] && payloadData['IsVacuumOnly'];

              const valveKey=localDisplayColumns?.find(col => col.name==='Vsel' || col.name==='Wsel' || col.name==='Qm'  || col.name==='MaxWsel');
              // let valveKeyV=displayColumns?.find(col => col.name==='Wsel_v' || col.name==='Vsel_v');

              let WreqpColFlag=false;
              let WreqVal;
              
              if(workflowId==12 && payloadData['FireSizingMethod']==='Unwetted'){
                let Wreqp=localDisplayColumns?.find(col => col.name==='Wreqp');
              
                if(Wreqp){
                  WreqVal=valve[Wreqp?.name]
                  WreqpColFlag=true;
                }
              }
              
              if(WreqpColFlag){
                if(WreqVal<=valve[valveKey?.name]){ 
                  if (!localAcc[localKey]) {
                    localValve=[valve];
                    localAcc[localKey] = localValve;
                  }else if(localAcc[localKey]?.length > 0 && Number(valve[valveKey?.name]) < Number(localAcc[localKey][0][valveKey?.name])){
                    localValve=[valve];
                    localAcc[localKey] = localValve;
                  }else if(localAcc[localKey]?.length > 0 && Number(valve[valveKey?.name]) == Number(localAcc[localKey][0][valveKey?.name])){
                    localValve=[...localAcc[localKey],valve];
                    localAcc[localKey] = localValve;
                  }
                }
              }else if (!localAcc[localKey]) {
                
                localValve=[valve];
                localAcc[localKey] = localValve;
              }else if(localAcc[localKey]?.length > 0 && Number(valve[valveKey?.name]) < Number(localAcc[localKey][0][valveKey?.name])){
                localValve=[valve] ;
                localAcc[localKey] = localValve;
              }else if(localAcc[localKey]?.length > 0 && Number(valve[valveKey?.name]) == Number(localAcc[localKey][0][valveKey?.name])){
                localValve=[...localAcc[localKey],valve];
                localAcc[localKey] = localValve;
              }
              
              return localAcc;
          }, {});
          const localObjValues=[...Object.values(localArr)];
          // console.log('localAcc 111111111 22222222>>>>>>>>>>>>>> ',localArr,localObjValues)
          let localData=[];
          localObjValues.forEach(item => localData.push(...item));
          
          acc[key] = [...localData]; 
         }else{
            acc[key] = resultData[key];
          }
      }
      return acc;
    }, {});
  };


  const adjustColumnFilters = (columns, data) => {
    const getAreaValue = (value, selectedLabel) => {
      if (value === null || value === undefined) {
        return "";
      }
      if (typeof value === "object" && !Array.isArray(value)) {
        return value?.[selectedLabel] ?? "";
      }
      return value;
    };

    let localColumns=[];
    let fireUnwettedFlag=false;
    let localDisplayColumns=selectedDataset.value==='ASME'?[...displayColumns]:[...displayColumnsAPI];
    const workflowId=payloadData['WorkFlowId']
    if(workflowId==12 && payloadData['FireSizingMethod']==='Unwetted'){
      fireUnwettedFlag=true;
    }
    if (displayAllFields) {
      localColumns = columns.filter(
        (column) => !AreqALLUOM_WHITELIST_FieldNames.includes(column.name)
          // column.name !== "AreqAllUOM" && column.name !== "AreqvAllUOM" && column.name !== "AreqAllUOMG" && column.name !== "AreqAllUOML" && column.name !== "AreqAllUOML2"
      );
    }
    if(workflowId==12 && !fireUnwettedFlag && !displayAllFields){
      localColumns=localDisplayColumns.filter(column=>column.name!=='Wreqp' );
    }
    let reqColumns=displayAllFields?localColumns:workflowId==12 && !fireUnwettedFlag ? localColumns:localDisplayColumns;
    // console.log(' >>>>>>>>>> ',reqColumns)
    const localreqCols = reqColumns?.map((column) => {
      let localColumn = { ...column };
      if (Areq_WHITELIST_FieldNames.includes(column?.name)){
        // || column?.name === "Areq" || column?.name === "Areq_v"  || column?.name === "AreqG" || column?.name === "AreqL" || column?.name === "AreqL2") {
        const label = column?.label?.replace(
          "AreaUOM",
          selectedOrificeArea?.label
        );
        localColumn = { ...localColumn, label };
      }

      if (column?.name === "Wreqp" && fireUnwettedFlag) {
        if (
          payloadData["WorkFlowId"] == 12 &&
          payloadData["FireSizingMethod"] === "Unwetted"
        ) {
          const localValue = payloadData["FlowCapacityUOM"];
          const label = column?.label?.replace("FlowCapacityUOM", localValue);
          localColumn = { ...localColumn, label };
        }
      }
      if (column?.name === "ValveId") {
        localColumn = { ...localColumn };
      }
      const allValues = data.map((row) => {
        // console.log('In allValues >>>>>>>>>>>>>>>>> ',row,row[localColumn.name],localColumn.name)
        if (Areq_WHITELIST_FieldNames.includes(column?.name)){
        // if (column?.name === "Areq" || column?.name === "Areq_v" || column?.name === "AreqG" || column?.name === "AreqL" || column?.name === "AreqL2") {
          return getAreaValue(row?.[localColumn.name], selectedOrificeArea?.label);
        } else {
          return row[localColumn.name];
        }
      });
      // When PAGINATION_FLAG=true, use server-provided distinct values (full dataset).
      // Areq-family columns are object-valued — fall back to current-page extraction for those.
      const serverFilterValues = PAGINATION_FLAG && !Areq_WHITELIST_FieldNames.includes(column?.name)
        ? filterOptions?.[selectedDataset?.value]?.[column?.name]
        : null;
      const filterNames = (serverFilterValues && serverFilterValues.length > 0)
        ? serverFilterValues
        : [...new Set(allValues)];
      const isSingleOption = filterNames.length === 1;
      const hasNoOptions = filterNames.length === 0;
      // Continuous/calculated columns — not useful as categorical filter dropdowns
      const isFilterExcluded = ['Areq', 'Wsel', 'Vsel'].includes(column?.name);
      return {
        ...localColumn,
        options: {
          ...localColumn.options,
          filter: !isFilterExcluded && !hasNoOptions,
          filterType: "dropdown",
          filterOptions: {
            names: filterNames,
            display: isSingleOption
              ? (_filterList, _onChange, _index, column) => (
                  <div style={{ opacity: 0.45, pointerEvents: 'none', minWidth: 180 }}>
                    <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.54)', display: 'block', marginBottom: 4, fontFamily: 'inherit' }}>
                      {column.label}
                    </span>
                    <div style={{
                      padding: '4px 0',
                      borderBottom: '1px solid rgba(0,0,0,0.3)',
                      fontSize: '14px',
                      color: 'rgba(0,0,0,0.38)',
                      fontFamily: 'inherit',
                    }}>
                      {filterNames[0]}
                    </div>
                  </div>
                )
              : undefined,
            logic: (value, filterVal) => {
              if (Areq_WHITELIST_FieldNames.includes(column?.name)){
              // if (column?.name === "Areq" || column?.name === "Areq_v"  || column?.name === "AreqG" || column?.name === "AreqL" || column?.name === "AreqL2") {
                return getAreaValue(value, selectedOrificeArea?.label) !== filterVal[0];
              } else {
                return value !== filterVal[0];
              }
            },
          },
          setCellHeaderProps: () => ({
            style: {
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 0,
            },
          }),
          customHeadLabelRender: (columnMeta) => (columnMeta?.name==='ValveId' || (columnMeta?.name==='Wreqp' && !fireUnwettedFlag)?'':columnMeta?.label),
          customBodyRender: (value,tableMeta) => {
            const isAreaColumn = tableMeta?.columnData?.name==='Areq' || tableMeta?.columnData?.name==='AreqG' || tableMeta?.columnData?.name==='AreqL' || tableMeta?.columnData?.name==='AreqL2' || tableMeta?.columnData?.name==='Areq_v';
            let newValue = isAreaColumn ? getAreaValue(value, selectedOrificeArea?.label) : value;
            if (isAreaColumn && (newValue === "" || newValue === null || newValue === undefined)) {
              const parsedValue = parseFloat(value);
              newValue = Number.isNaN(parsedValue) ? "" : parsedValue.toFixed(3);
            }
            if(newValue!==undefined && newValue!==null && newValue!==''){
              if(tableMeta?.columnData?.name==='Wreqp' && fireUnwettedFlag){
                if(payloadData['WorkFlowId']==12 && payloadData['FireSizingMethod']==='Unwetted'){
                  newValue=parseFloat(newValue)?.toFixed(3);
                }
              }
              if(tableMeta?.columnData?.name==='Wsel' || tableMeta?.columnData?.name==='Wsel_v' || tableMeta?.columnData?.name==='Vsel' || tableMeta?.columnData?.name==='Vsel_v' || tableMeta?.columnData?.name==='Qm' || tableMeta?.columnData?.name==='MaxWsel' || tableMeta?.columnData?.name==='MaxWselV'){
                newValue=parseFloat(newValue)?.toFixed(3);

              }
            }
            // console.log('In adjustColumnFilters >>>>>>>>>>>>>>>>> ',tableMeta?.columnData?.name,selectedRowIndex,value)
            if(tableMeta?.columnData?.name==='ValveId'){
              return (
                !sizingData?.multiValveSelectionDisplayFlag?
                <Radio
                  style={{
                    color: selectedRowIndex === value ? "#00aa7e" : "#e7e4e4",
                  }}
                  value={value}
                  checked={selectedRowIndex === value}
                  onChange={() =>
                    handleRowSelected(tableMeta.rowData, {
                      dataIndex: tableMeta.rowIndex,
                      type: "radio",
                    })
                  }
                /> :
                
                <button
                    type="button"
                    style={{
                        width: "3rem",
                        padding: "0.1rem 0.1rem",
                        border: "1px solid #706c6c",
                        borderRadius: "0.25rem",
                        backgroundColor: "#aea8a7",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                    onClick={(e) => {
                        e.stopPropagation(); // ✅ prevent row select
                        // let newData = [...multivalveData]
                        // newData = newData.filter(
                        // (_, index) => index !== rowIndex
                        // );
                        // console.log(rowIndex,'rowIndexrowIndex');
                        handleMultivalveRowsSelected(tableMeta.rowData, {
                            dataIndex: tableMeta.rowIndex,
                            type: "checkbox",
                          });
                    }}
                    >
                    + Add
                </button>
                // <Check
                //   style={{
                //     color: selectedRows.includes(value) ? "#00aa7e" : "#e7e4e4",
                //   }}
                //   checked={selectedRows.includes(value)}
                //   onChange={() => {
                //     handleMultivalveRowsSelected(tableMeta.rowData, {
                //       dataIndex: tableMeta.rowIndex,
                //       type: "checkbox",
                //     });
                    
                //   }}
                // />

              );
            }
            return <div style={{ textAlign: "center" }}>{newValue}</div>;
          },
          setCellProps: () => ({
            style: {
              textAlign: "center",
              marginLeft: 0,
              marginRight: 0,
            },
          }),
        },
      };
    });

    const finalColumns =  data?.length>0?[...localreqCols]:[];
    setFinalDisplayColumns(finalColumns);
  };

  useEffect(() => {
    // console.log('selectedRowIndex >>>>>>>>>>>> ',selectedRowIndex)
    adjustColumnFilters(resultColumns, finalData || []);
  }, [resultColumns, finalData, selectedRowIndex, IsMultiValves, selectedRows, filterOptions]);

  useEffect(() => {
    const OrificeFlag =
      payloadData["Orifices"] === undefined ? false : payloadData["Orifices"];
    // When PAGINATION_FLAG=true: backend already filtered orifices — use resultData directly.
    // When PAGINATION_FLAG=false: apply client-side orifice filtering via handleOrificeData (unchanged).
    const sourceData = PAGINATION_FLAG
      ? resultData
      : handleOrificeData(OrificeFlag);
    // console.log('After Orifice >>>>>>>>>> ',resultData)
    if (
      sourceData !== undefined &&
      sourceData[selectedDataset.label] !== undefined
    ) {
      let localData = [...sourceData[selectedDataset.label]];
      // let localData=[...finalData];
      // console.log('In ResultsDisplay >>>>>>>> 3333 >>>>>>>',localData,selectedValveType.value)
      if (selectedValveType.value !== "All") {
        const localVpValveOptions = VPValveTypeFilterOptions.find(
          (row) => row.Key === selectedValveType.value
        );
        localData = sourceData[selectedDataset.label].filter(
          (row) =>
            localVpValveOptions.VPValveType.indexOf(row.VPValveType) !== -1 || (row?.VPValveTypeV!==undefined &&localVpValveOptions.VPValveType.indexOf(row?.VPValveTypeV) !== -1)
        );
      }
      if (payloadData?.ValveId !== undefined) {
        const localSelectedValve = localData.find(
          (row) => row.ValveId === payloadData.ValveId
        );
        if (localSelectedValve) {
          localData = localData.filter(
            (row) => row.ValveId !== payloadData.ValveId
          );
          localData = [localSelectedValve, ...localData];
        }
      }
      dispatch(setFinalData(localData));
    } else {
      dispatch(setFinalData([]));
    }
  }, [
    resultData,
    // selectedDataset,
    selectedValveType,
    // selectedOrificeArea,
    displayAllFields,
    displayAllOrifices,
  ]);
  // Note: displayAllOrifices stays in deps — needed when PAGINATION_FLAG=false to re-run client-side filter

  useEffect(()=>{
      // console.log('In Multivalve Toggle >>>>>>>> ',{multiValveActionFlag,IsMultiValves,multivalve,MultiValveFieldSection,multiValveSelectionDisplayFlag:payloadData?.multiValveSelectionDisplayFlag})
      if(filterActionFlag){
        handleSaveSizingData(2);
        setFilterActionFlag(false);
      }
  },[filterActionFlag])

  const handleChange = (item) => {
    const newSelectedDataset = { label: item.value, value: item.value };
    dispatch(setSelectedDataset(newSelectedDataset));
    // console.log('In ResultsDisplay >>>>> handleChange >>>> ',newSelectedDataset)
    dispatch(onUpdateFields({ name: "KADataSet", value: newSelectedDataset.value }));
    // dispatch(
    //   setPayloadData({ ...payloadData, KADataSet: newSelectedDataset.value })
    // );
    setFilterActionFlag(true);
  };

  const handleValveTypeChange = (item) => {
    dispatch(setSelectedValveType(item));
  };

  const handleOrificeAreaChange = (item) => {
    // console.log('In ResultsDisplay >>>>> handleOrificeAreaChange >>>> ',item)
    const newSelectedOrificeArea = OrificeDropdownOptions.find(
      (option) => option.value === item.value
    );
    // console.log(`In ResultsDisplay >>>> handleOrificeAreaChange >>>> ${JSON.stringify(newSelectedOrificeArea)}`);
    dispatch(
      setSelectedOrificeArea({
        label: newSelectedOrificeArea.label,
        value: newSelectedOrificeArea.value,
      })
    );
    dispatch(
      onUpdateFields({
        name: "OrificeAreaUOM",
        value: newSelectedOrificeArea.value,
      })
    );

    setFilterActionFlag(true);

  };



  const handleCheckboxChange = (item) => {
    // console.log(item.value)
    const newOrificeFlag = item.value;
    const newDisplayAllOrifices = !displayAllOrifices;
    dispatch(setPayloadData({ ...payloadData, Orifices: newOrificeFlag }));
    dispatch(toggleDisplayAllOrifices());

    if (PAGINATION_FLAG) {
      // Backend handles orifice filtering — re-fetch with new flag, reset to page 0
      // extraParams wins over stale payloadData.Orifices in the thunk (avoids async race)
      dispatch(fetchResultsPage({
        pageNumber: 0,
        pageSize,
        extraParams: { Orifices: newOrificeFlag, DisplayAllOrifices: newDisplayAllOrifices }
      }));
    }
    // PAGINATION_FLAG=false: no API call — useEffect handles it via handleOrificeData (unchanged)
  };

  const handleErrorClick = (flag) => {
    setDisplayErrors(flag);
  };

  // console.log(' In Results >>>>>>>>. ',finalData,selectedDataset,resultData[selectedDataset.label])
  if (isAdvanced && !finalData.length) {
    return (
      <>
        <Dialog
          open={displayErrors}
          onClose={() => handleErrorClick(false)}
          title="Errors"
          noPadding
          draggable
        >
          {/* <ErrorComponent errors={resultErrors} onClose={() => handleErrorClick(false)} /> */}
          <ErrorComponent
            errors={resultErrors[selectedDataset.label]?.filter(
              (e) =>
                selectedValveType?.value === "All" ||
                e.ValveTypeSummary === selectedValveType?.value
            )}
            onClose={() => handleErrorClick(false)}
          />
        </Dialog>
        <Dialog open={status === "loading"} title={LOADING_RESULTS.title}>
          {LOADING_RESULTS.content}
        </Dialog>
      </>
    );
  }

  const handleMultivalveToggle = () =>{
    
    const disabledFields=fieldValidationResults?.disabledFields ?? {};
    const mandatoryFields=fieldValidationResults?.mandatoryFields ?? {};
    const visibleFields=fieldValidationResults?.visibleFields ?? {};
    const hideFromSideBarFields=fieldValidationResults?.hideFromSideBarFields ?? {};
    const data={
                currentField:{FieldName:'IsMultivalve',FieldValue:!IsMultiValves,FieldId:null,actionId:null,isFieldActionRequired:null},
                inputs:{...payloadData,'IsMultivalve':!IsMultiValves,'Orifices':true,userId:userData?.EmailId,workflowId:selectedWorkflow,sectionId:null},
                error,
                disabledFields,
                mandatoryFields,
                visibleFields,
                hideFromSideBarFields
            }
    const config={url:'/validate',method:'POST',data}
    // console.log('In Multivalve Toggle >>>>>>>>>>>.config  data 111111>>>>>>>> ',data);
    dispatch(fieldValidationAPI(config)).then((response)=>{
      // console.log('In Multivalve Toggle >>>>>>>>>>>. Validation response 2222222>>>>>>>> ',response);
      
      setMultiValveActionFlag(true);
      dispatch(setMultiValves(!IsMultiValves));
      dispatch(setSelectedResultRows([]));
      // console.log('In Multivalve Toggle >>>>>>>> ',displayAllOrifices)
      dispatch(setDisplayAllOrifices(true));
    });
    
  }

  useEffect(()=>{
      // console.log('In Multivalve Toggle >>>>>>>> ',{multiValveActionFlag,IsMultiValves,multivalve,MultiValveFieldSection,multiValveSelectionDisplayFlag:payloadData?.multiValveSelectionDisplayFlag})
      if(multiValveActionFlag){
        handleSaveSizingData(2);
        setMultiValveActionFlag(false);
      }
  },[multiValveActionFlag])

  // console.log('In Result Set >>>>>>>> ',MULTIVALVE_SELECT,MULTIVALVE_SECTION_WF,MULTIVALVE_CB_WF,
  //   MULTIVALVE_CB_WF.includes(selectedWorkflow.toString()),
  // selectedWorkflow,
  // selectedResultRows?.length,
  // payloadData?.Wreq,
  // payloadData?.VlreqMass,
  // payloadData?.Qreq,
  // (selectedWorkflow!=3 && (payloadData?.Wreq !=='' //|| payloadData?.VlreqMass !=='' || payloadData?.Qreq !==''

  // )),payloadData?.Wreq !=='',
  //             MULTIVALVE_SELECT && MULTIVALVE_CB_WF.includes(selectedWorkflow) &&
  //           (
  //             (selectedWorkflow!=3 && (payloadData?.Wreq !=='' || payloadData?.VlreqMass !=='' || payloadData?.Qreq !=='')) || 
  //           (selectedWorkflow==3 && ((payloadData?.IsPressureOnly && payloadData?.Wreq !='') || (payloadData?.IsVacuumOnly && payloadData?.WreqV !='' )))
  //         )
  //         );
  return (
    <>
      {dataDisplayFlag && (
        <>
          <div className="results-filter-container" id="results">
            <>
              <img
                className="results-img"
                src={Error_Triangle_Image}
                alt="exclamation"
                // style={{ marginLeft: 16 }}
                onClick={() => handleErrorClick(true)}
              />
            </>
            <div className="results-checkbox">
              <Checkbox
                fieldName="displayAllOrifices"
                label="Display All Orifices"
                value={displayAllOrifices}
                disabled={false}
                onChange={handleCheckboxChange}
              />
            </div>
            {DISPLAY_ALL_RESULTS_COLUMNS && (
              <div className="results-checkbox">
                <Checkbox
                  fieldName="displayAllFields"
                  label="Display All Fields"
                  value={displayAllFields}
                  disabled={false}
                  onChange={() => setDisplayAllFields(!displayAllFields)}
                  // onChange={handleFilterChange}
                />
              </div>
            )}
            <div>
              <LabeledDropdown
                label="Orifice Area:"
                options={
                  payloadData[Orific_Filter_Column] !== "All"
                    ? OrificeDropdownOptions.filter(
                        (dd) => dd.display === payloadData[Orific_Filter_Column]
                      )
                    : OrificeDropdownOptions
                }
                fieldName={selectedOrificeArea.value}
                value={selectedOrificeArea.value}
                width="100%"
                grid={4}
                onChange={(item) => handleOrificeAreaChange(item)}
                results={true}
              />
            </div>
            <div>
              <LabeledDropdown
                options={vpValveTypeOptions}
                fieldName={selectedValveType.value}
                value={selectedValveType.value}
                width="100%"
                grid={4}
                onChange={(item) => handleValveTypeChange(item)}
                results={true}
              />
            </div>

            {KADATSET_IGNORE_DISPLAY.indexOf(selectedWorkflow) ===
              -1 && (
              <div>
                <LabeledDropdown
                  label="K & A Data Set:"
                  options={TwoPhase_CDSeries_WF.includes(selectedWorkflow)? KA_CD_Options :dropdownOptions}
                  fieldName={selectedDataset.value}
                  value={selectedDataset.value}
                  width="100%"
                  grid={2}
                  onChange={(item) => handleChange(item)}
                  results={true}
                />
              </div>
            )}
          </div>
          {DISPLAY_GENERIC_SIZING_TOGGLE && (
            <>
              {workflows.find((wf) => wf.Id === selectedWorkflow)
                ?.IsGenericReq && (
                <div className="generic-toggle-section" id="">
                  <div className="generic-dummy-divs"></div>
                  <div className="generic-dummy-divs"></div>
                  <div className="generic-dummy-divs"></div>

                  <div className="generic-checkbox">
                    <Checkbox
                      fieldName="genericToggle"
                      label="Generic"
                      value={genericSizingEnabled}
                      disabled={false}
                      onChange={handleGenericToggle}
                    />
                  </div>
                  {genericSizingEnabled && (
                    <Button
                      className={`${styles["bgColor_Transparent"]} ${styles["border"]} ${styles["borderRadius"]} ${styles["headerButton"]} ${styles["textColorBlack"]} generic-edit-button`}
                      // className="generic-edit-button "
                      variant="outlined"
                      endIcon={<NavigateNextIcon />}
                      onClick={() =>
                        dispatch(onUpdateGenericValveSizingModal(true))
                      }
                    >
                      Edit Valve
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
          {MULTIVALVE_SELECT && MULTIVALVE_CB_WF.includes(selectedWorkflow.toString()) &&
            (
              (selectedWorkflow!=3 && (payloadData?.Wreq !=='' || payloadData?.VlreqMass !=='' || payloadData?.Qreq !=='')) || 
            (selectedWorkflow==3 && ((payloadData?.IsPressureOnly && payloadData?.Wreq !='') || (payloadData?.IsVacuumOnly && payloadData?.WreqV !='' ))))
          && (
              <div className="results-checkbox">
                <Checkbox
                  fieldName="Multivalve"
                  label="Multivalve"
                  value={IsMultiValves}
                  disabled={false}
                  // onChange={() => setMultivalve(!multivalve)}
                  onChange={handleMultivalveToggle}
                />
              </div>
          )}
          <div style={{ margin: "auto 0.875rem" }}>
            <MuiDataTable
              data={finalData}
              columns={finalDisplayColumns}
              options={customOptions}
            />
          </div>
          
          { (sizingData?.multiValveSelectionDisplayFlag && resultData && MultiValveFieldSection !==null) && (
            <MultivalveSection 
              multivalveData = {selectedResultRows} 
              selectedValvesHeader = {selectedValvesHeader}
              MultiValveFieldSection = {MultiValveFieldSection}
              handleSelectedValveAction = {handleSelectedValveAction}
              handleMultiValveAction = {handleMultiValveAction}
            />
          )}
          
        </>
      )}
      <Dialog
        open={displayErrors}
        onClose={() => handleErrorClick(false)}
        title="Errors"
        noPadding
        draggable
      >
        {/* <ErrorComponent errors={resultErrors} onClose={() => handleErrorClick(false)} /> */}
        <ErrorComponent
          errors={resultErrors}
          onClose={() => handleErrorClick(false)}
        />
      </Dialog>
      <Dialog open={status === "loading"} title={LOADING_RESULTS.title}>
        {LOADING_RESULTS.content}
      </Dialog>
    </>
  );
};

ResultsDisplay.propTypes = {
  data: PropTypes.array,
};

export default ResultsDisplay;
