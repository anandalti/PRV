import { useDispatch, useSelector } from "react-redux";
import { fetchResults, setPayloadData } from "../store/slices/workflowPayloadSlice";
import { onUpdateFields, resetSelectedFields, saveWorkflowData } from "../store/slices/workflowSlice";
import { defaultUOMs, FieldsWithBooleanValues, Popup_Result_Var_list, SAVE_WF_DATA_API, SIZIND_RESULT_API, PAGINATION_FLAG } from "../utils/constants";
import { ModelMapping } from "../utils/modelMapping";
import useLogin from "./useLogin";
// import { resetSelectedFields } from "../store/slices/workflowSlice";
import {
  onSelectMenu,
  resetNavigationMenu,
} from "../store/slices/navigationSlice";
import { updateSnakebar } from "../store/slices/preferenceSlice";
import { toggleGenericSizing } from "../store/slices/genericValveSizingSlice";
import {  getUserPreference } from "../utils/utility";
import {convertUnitDiffDims} from '../utils/convertUnit';

const useSaveSizing = () => {
  const { userData } = useLogin();
  const dispatch = useDispatch();
  const { rolesData, preferences } = useSelector(state => state.auth);
  const { MultiValveSelectionData, payloadData, selectedResultRows, selectedDataset, sizingData,selectedValveType, displayAllOrifices, uomList, selectedOrificeArea, IsMultiValves, IsGeneric, pageSize } = useSelector((state) => state.workflowPayload);
  const { activeMenu } = useSelector(state => state.navigation);
  const { selectedWorkflow, selectedFields, error, selectedValveCategory, selectedFluidType, selectedSizingMethodology, fieldValidationResults } = useSelector(state => state.workflow);
  const {units,defaultUnits} = useSelector((state) => state.uom);

  const gosProceedFuncion = (newSizingData) => {
    const { tools, requisitionListId } = rolesData;
    const userTools = tools === "null" ? "" : tools;
    const useRequisitionListId =
      requisitionListId === "null" ? "" : requisitionListId;
    let isModelChanged;
    let isOrificeChanged;
    const sizingId = newSizingData?.SizingId;
    isModelChanged = "Y";
    isOrificeChanged = "Y";
    let sapModel = "";
    const { ModelNumber, SizeOrOrifice } = newSizingData;
    if (!!sizingData) {
      const { ModelNumber: oldModelNumber, SizeOrOrifice: oldOrifice } =
        sizingData;
      if (!!oldModelNumber && !!ModelNumber && oldModelNumber === ModelNumber) {
        isModelChanged = "N";
        if (!!oldOrifice && !!SizeOrOrifice && oldOrifice === SizeOrOrifice) {
          isOrificeChanged = "N";
        }
      }
    }
    if (!!sizingId) {
      if (ModelNumber) {
        let k = ModelMapping.filter(item => item['ModelNumber'] === ModelNumber && item["SAP Material Number"] != '30236')
        sapModel = k && k.length > 0 ? k[0]['SAP Material Number'] : ModelNumber
        sapModel = sapModel.includes('+') ? sapModel.replaceAll('+', '-') : sapModel
      }
      if (!!userTools && userTools === "Cart") {
        if (typeof addToCart === "function") {
          addToCart(
            sizingId,
            sapModel,
            SizeOrOrifice,
            isModelChanged,
            isOrificeChanged
          );
        }
      } else if (!!useRequisitionListId && useRequisitionListId !== "") {
        if (typeof addToWorkspace === "function") {
          // console.log('addToWorkSpace >>>>>>>>> ',sizingId,sapModel,SizeOrOrifice,isModelChanged,isOrificeChanged)
          addToWorkspace(
            sizingId,
            sapModel,
            SizeOrOrifice,
            isModelChanged,
            isOrificeChanged
          );
        }
      } else {
        if (typeof showSelectionDetails === "function") {
          showSelectionDetails(
            sizingId,
            sapModel,
            SizeOrOrifice,
            isModelChanged,
            isOrificeChanged
          );
        }
      }
    }
  };


  function getProcessedValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "boolean") return value;
    if (isNaN(value)) return 0;
    return parseFloat(value);
  }


  const updateTcResponse = (tcResponse) => {
    let localtcResponse={...tcResponse};
    const FlowCapacityUOM=payloadData['FlowCapacityUOM'];
    if(FlowCapacityUOM!==localtcResponse?.receivedUnits?.FlowCapacityUOM){
      let inputValues=localtcResponse?.inputValues;
      let newInputValues={...inputValues};
      let newReceivedUnits={...localtcResponse?.receivedUnits}; 
      const FCUOM_tcRes_receivedUnit=localtcResponse?.receivedUnits?.FlowCapacityUOM;

      const dim=FlowCapacityUOM.split('.')[0];
      const newUom=units[dim].find((item)=>item.UnitKey===FlowCapacityUOM);

      Popup_Result_Var_list.forEach((field) => {
        if(FCUOM_tcRes_receivedUnit?.UnitKey!==FlowCapacityUOM){
          const VacuumFlag=field.indexOf('Vacuum')!==-1?true:false;
         const newValue=convertUnitDiffDims(inputValues[field], FCUOM_tcRes_receivedUnit, newUom,units,payloadData,VacuumFlag)
          // const newValue=convertedValue(inputValues[field],FCUOM_tcRes_receivedUnit.UnitKey,FlowCapacityUOM,VacuumFlag);
          // console.log('In use PopupPanel:::calculatedFields tcResponse >>>> ',field,newValue,inputValues[field],payloadData[field],newUom.UnitKey,FCUOM_tcRes_receivedUnit.UnitKey);
          newInputValues[field]=newValue;
        }

      });
      newReceivedUnits['FlowCapacityUOM']=newUom;
      localtcResponse={...localtcResponse,inputValues:newInputValues,receivedUnits:newReceivedUnits};
      // console.log('In use PopupPanel:::calculatedFields tcResponse >>>> 2222 >>>>>',localtcResponse)
    }
    return localtcResponse;
  }


  const handleSaveGVS = () => {
    const payloadObj = {
      UserId: userData?.Id ?? 1,
    };

    if (Array.isArray(gvsSelectedFields) && gvsSelectedFields.length > 0) {
      gvsSelectedFields.forEach(({ name, value }) => {
        let localValue = getProcessedValue(value);
        const booleanField = FieldsWithBooleanValues.find(
          (obj) => obj.name === name
        );
        if (booleanField) {
          localValue = localValue === booleanField?.value;
        }
        payloadObj[name] = localValue;
      });
    }

    // console.log("Saving Generic Valve Sizing Data:", payloadObj);
  };

  const handleSaveSizingData = (
    draftStage,
    saveSizingFlag = true,
    gvs = false
  ) => {
    // console.log('Sizing Details Saved >>>> ',selectedOrificeArea);
    const LocalCode =
      !payloadData?.IsASMESection8 &&
      selectedSizingMethodology?.Code === "SectionVIII"
        ? "API520"
        : selectedSizingMethodology?.Code;
    const IsASMESection8 =
      selectedSizingMethodology?.Code === "API2000" ||
      selectedSizingMethodology?.Code === "None"
        ? null
        : payloadData?.IsASMESection8;
    let FieldProperties={};
    if(fieldValidationResults!=null){
      const {inputs, errors, ...LocalFieldProperties} = fieldValidationResults;
      FieldProperties={...LocalFieldProperties};
    }
    let localError=[];
    if(error!==undefined && error!==null && error.length>0){
      for(let i=0;i<error.length;i++){
        const itemPresent=localError.find(item => item.name === error[i]?.name);
        if(itemPresent===undefined)
          localError.push({...error[i],value:error[i]?.value?.error ?? error[i]?.value});
      }
    }
    // console.log('KADataSet >>>>>>>>>>>>>> ',{KADataSet:payloadData?.KADataSet,selectedDataset})
    // console.log(`In handleSaveSizingData :: selectedOrificeArea >>>>>>>>>>> `,payloadData,selectedFields)
    const relievingTemp= ['Economizer','Preheater'].includes(payloadData?.SizingBasis)?payloadData?.WaterRelieving:payloadData?.Relieving;
    const payloadObj = {
      UserId: userData?.Id ?? 1,
      UserMailId: userData?.EmailId ?? "",
      WorkflowId: selectedWorkflow,
      WorkFlowId: selectedWorkflow,
      ValveCategory: selectedValveCategory?.name,
      FluidType: selectedFluidType?.name,
      SizingMethodology: selectedSizingMethodology?.name,
      Code: LocalCode,
      KADataSet: selectedDataset?.value,
      Orifices: IsMultiValves?true:displayAllOrifices,
      IsDisplayAllOrifices: IsMultiValves?true:displayAllOrifices,
      OrificeAreaUOM: selectedOrificeArea?.value,
      SizingValveType: selectedValveType.name,
      IsGeneric: IsGeneric,
      IsMultivalve: IsMultiValves,
      DraftStage: draftStage,
      SizingTabIndex: activeMenu,
      Id: sizingData !== null && sizingData !== undefined ? sizingData?.Id!==""?sizingData?.Id:undefined : undefined,
      SizingId:
        sizingData !== null && sizingData !== undefined
          ? sizingData?.SizingId
          : undefined,
      IsASMESection8: IsASMESection8,
      saveSizingFlag: saveSizingFlag,
      Relieving: relievingTemp,
      error: localError,
    };
    // console.log(`IsMultiValves >>>>>>>>>>>>>> `,{IsMultiValves,KADataSet:payloadObj["KADataSet"],KADataSet_2: selectedDataset?.value})
    // let tcResponse;

    // if(payloadData?.tcResponse!==undefined){
    //   tcResponse=updateTcResponse(field.value);
    // }

    let localTempPayloadObj = {};

    if (selectedFields?.length > 0) {
      selectedFields?.forEach((field) => {
        if(field.name==='tcResponse'){
          // console.log('tcResponse >>>>>>>>>> ',field.value)
          const tcResponse=field.value!==null && field.value!==""?updateTcResponse(field.value):field.value;
          // console.log('In use PopupPanel:::calculatedFields tcResponse >>>> 33333 >>>>>',tcResponse)
          payloadObj[field.name] = tcResponse;
        }else 
        if (field.name !== '%') {
          let localValue=field.value === null || field.value === undefined ? "" : typeof field.value === 'string' || typeof field.value === 'boolean' ? field.value : isNaN(field.value) ? 0 : parseFloat(field.value)
          const validateBooleanField=FieldsWithBooleanValues.find(obj => obj.name === field.name)
          if(validateBooleanField){
            localValue=localValue===validateBooleanField?.value;
          }
          // if(field.name==='KADataSet'){
          //   console.log(`IsMultiValves >>>>>>>>>>>>>> `,{IsMultiValves,KADataSet:payloadObj["KADataSet"],KADataSet_2: selectedDataset?.value,localValue,field})
          // }
          payloadObj[field.name] = localValue;
          localTempPayloadObj[field.name] = field.value;
        }
      });
    }
    // console.log(`In handleSaveSizingData :: payloadObj 2222222 >>>>>>>>>>> `,payloadObj["KADataSet"])
    if (uomList?.length > 0) {
      uomList?.forEach((uom) => {
        if (payloadObj[uom?.name] !== undefined) {
          payloadObj[uom?.name] = uom?.value;
        }
      });
    }
    // console.log(`In handleSaveSizingData :: payloadObj 3333333 >>>>>>>>>>> `,payloadObj["OrificeAreaUOM"])
    let userPreference = getUserPreference(preferences);
    // console.log('userPreference >>>>>>>>>>>>>>>>> ',userPreference)
    const calcMethod = payloadObj["CalculationMethod"];
    payloadObj["ValveDataSetMultiPhase"]= userPreference["ValveDataSetMultiPhase"];
    payloadObj["ValveDataSetSinglePhase"]= userPreference["ValveDataSetSinglePhase"];
    Object.keys(defaultUOMs).forEach((key) => {
      if (
        payloadObj[key] === undefined ||
        payloadObj[key] === null ||
        payloadObj[key] === ""
      ) {
        const keyUOM =
          userPreference[key] !== undefined
            ? userPreference[key]
            : defaultUnits[calcMethod][defaultUOMs[key]];
        payloadObj[key] = keyUOM;
      }
    });
    payloadObj["FieldProperties"] = { ...FieldProperties };
    payloadObj["error"] = localError;
    payloadObj["SelectedValve"] = selectedResultRows?.length > 0 ? selectedResultRows : [];
    // console.log('fieldValidationResults >>>>>>>>>>>>>> 333333 444444 >>>>>>>>>>>> ',{FieldProperties,payloadObj})
    if (gvs) {
      payloadObj.genericSizingDetails = { ...gvsPayloadData };
    } else {
      dispatch(toggleGenericSizing(false));
    }
    localTempPayloadObj={...payloadObj,...localTempPayloadObj};
    dispatch(setPayloadData(localTempPayloadObj));
    // console.log(`fieldValidationResults >>>>>>>>>>>>>> 333333`,payloadObj,LocalCode)
    payloadObj["Code"] = LocalCode;
    const paginatedData = PAGINATION_FLAG
      ? { ...payloadObj, pageNumber: 0, pageSize: pageSize ?? 10, DisplayAllOrifices: displayAllOrifices }
      : payloadObj;   // PAGINATION_FLAG=false: no page params, no DisplayAllOrifices → backend unchanged
    const config = { url: SIZIND_RESULT_API, method: "post", data: paginatedData };
    dispatch(fetchResults(config));
  };

  const handleSaveWorkflowData = (draftStage, storeData = null) => {
    // console.log('In handleSaveWorkflowData 1111111111111 >>>>>>>>>>>>>>>>> ');
    let LocalCode;
    let IsASMESection8;
    let localSelectedFields = [...selectedFields];
    let localPayloadData = { ...payloadData };
    let FieldProperties={};
    if(fieldValidationResults!=null){
      const {inputs, errors, ...LocalFieldProperties} = fieldValidationResults;
      FieldProperties={...LocalFieldProperties};
    }
    // console.log('Sizing Details Saved:: handleSaveWorkflowData >>>> ',selectedOrificeArea,selectedFields);
    if (storeData !== null) {
      localSelectedFields = [...storeData.selectedFields];
      localPayloadData = { ...storeData.payloadData };
    }

    LocalCode =
      !localPayloadData?.IsASMESection8 &&
      selectedSizingMethodology.Code === "SectionVIII"
        ? "API520"
        : selectedSizingMethodology.Code;
    IsASMESection8 =
      selectedSizingMethodology.Code === "API2000" ||
      selectedSizingMethodology.Code === "None"
        ? null
        : localPayloadData?.IsASMESection8 === undefined
        ? false
        : localPayloadData?.IsASMESection8;

    // const IsASMESection8 = selectedSizingMethodology.Code === "API2000" || selectedSizingMethodology.Code === "None" ? null : payloadData.IsASMESection8;
    let payloadObj = {};
    let localTempPayloadObj = {};
    if (localSelectedFields.length > 0) {
      localSelectedFields.forEach((field) => {
        if(field.name==='tcResponse'){
          // console.log('tcResponse >>>>>>>>>> ',field.value)
          const tcResponse=field.value!==null && field.value!==""?updateTcResponse(field.value):field.value;
          // console.log('In use PopupPanel:::calculatedFields tcResponse >>>> 44444 >>>>>',tcResponse)
          payloadObj[field.name] = tcResponse;
          // localTempPayloadObj[field.name] = tcResponse;
        }else
        if (field.name !== '%') {
          let localValue=field.value === null || field.value === undefined || field.value === "" ? "" : typeof field.value === 'string' || typeof field.value === 'boolean' ? field.value : isNaN(parseFloat(field.value)) ? 0 : parseFloat(field.value)
          // console.log(' >>>>>>.. ',field.name,field.value,localValue);
          const validateBooleanField=FieldsWithBooleanValues.find(obj => obj.name === field.name)
          if(validateBooleanField){
            localValue=localValue===validateBooleanField?.value;
          }
          payloadObj[field.name] = localValue;
          localTempPayloadObj[field.name] = field.value;
        }
      });
    }

    let localError=[];
    if(error!==undefined && error!==null && error.length>0){
      for(let i=0;i<error.length;i++){
        const itemPresent=localError.find(item => item.name === error[i]?.name);
        if(itemPresent===undefined)
          localError.push({...error[i],value:error[i]?.value?.error});
      }
    }

    // console.log('payloadObj >>>>>>.. ',payloadObj);
    const relievingTemp= ['Economizer','Preheater'].includes(payloadObj?.SizingBasis)?payloadObj?.WaterRelieving:payloadObj?.Relieving;
        // console.log(`selectedOrificeArea >>>>>>>>>>>>>>>>> `,selectedOrificeArea)
    payloadObj = {
      ...payloadObj,
      UserId: userData?.Id ?? 1,
      UserMailId: userData?.EmailId ?? "",
      WorkFlowId: selectedWorkflow,
      ValveCategory: selectedValveCategory.name,
      FluidType: selectedFluidType.name,
      SizingMethodology: selectedSizingMethodology.name,
      Code: LocalCode,
      KADataSet: selectedDataset.value,
      Orifices: displayAllOrifices,
      IsDisplayAllOrifices: displayAllOrifices,
      OrificeAreaUOM: selectedOrificeArea?.value,
      SizingValveType: selectedValveType.name,
      IsGeneric: IsGeneric,
      IsMultivalve: IsMultiValves,
      DraftStage: selectedResultRows?.length > 0 ? 3 : draftStage,
      Id:
        sizingData !== null && sizingData !== undefined
          ? sizingData?.Id
          : undefined,
      SizingId:
        sizingData !== null && sizingData !== undefined
          ? sizingData?.SizingId
          : undefined,
      IsASMESection8: IsASMESection8,
      SizingTabIndex: activeMenu,
      saveSizingFlag: true,
      Relieving: relievingTemp,
      FieldProperties: FieldProperties,
      error: localError,
    };
    // console.log(`localError >>>>>>>>>>>>>> 111111111 >>>>>>`,localError?.length
    //   // ,{localError,error,payloadObj}
    // )

    const updatedSelectedResultRows = selectedResultRows.map((row,index)=>{
      const Wreq=row?.Wreq;
      const Vreq=row?.Vreq;
      const Qreq=row?.Qreq;
      const WreqV=row?.Wreq;
      let localSelectedValve=row;
      let localReResponse=localSelectedValve?.ReResponse ? JSON.parse(localSelectedValve?.ReResponse) : null
    // console.log(localSelectedValve,localReResponse,localReResponse?.uomReceived?.orificeAreaUOM,selectedOrificeArea?.value)
      if(localReResponse!==null && localReResponse!==undefined){
        let localOrificeAreaUnit=selectedOrificeArea?.value?.split('.')[1];
        localOrificeAreaUnit=localOrificeAreaUnit.replace("2", "²")
        if(localReResponse?.ReResponseG!==undefined){
          let localuomReceived={...localReResponse?.ReResponseG?.uomReceived};
          localuomReceived={
            ...localuomReceived,
            orificeAreaUOM:localOrificeAreaUnit
          }

          let localReResponseG={
            ...localReResponse?.ReResponseG,
            uomReceived:localuomReceived
          }
          localReResponse={
            ...localReResponse,
            ReResponseG:localReResponseG        
          }
        }
        if(localReResponse?.ReResponseL!==undefined){
          let localuomReceived={...localReResponse?.ReResponseL?.uomReceived};
          localuomReceived={
            ...localuomReceived,
            orificeAreaUOM:localOrificeAreaUnit
          }

          let localReResponseL={
            ...localReResponse?.ReResponseL,
            uomReceived:localuomReceived
          }
          localReResponse={
            ...localReResponse,
            ReResponseL:localReResponseL       
          }
        }
        if(localReResponse?.ReResponseL2!==undefined){
          let localuomReceived={...localReResponse?.ReResponseL2?.uomReceived};
          localuomReceived={
            ...localuomReceived,
            orificeAreaUOM:localOrificeAreaUnit
          }

          let localReResponseL2={
            ...localReResponse?.ReResponseL2,
            uomReceived:localuomReceived
          }
          localReResponse={
            ...localReResponse,
            ReResponseL2:localReResponseL2       
          }
        }
        if(localReResponse?.uomReceived!==undefined){
        
        // if(localOrificeAreaUnit !==localReResponse?.uomReceived?.orificeAreaUOM){
          let localuomReceived={...localReResponse?.uomReceived};
          
          localuomReceived={
            ...localuomReceived,
            orificeAreaUOM:localOrificeAreaUnit
          }
          localReResponse={
            ...localReResponse,
            uomReceived:localuomReceived
          }
        }
        // }
      
      }
      let localReResponse_v=localSelectedValve?.ReResponse_v ? JSON.parse(localSelectedValve?.ReResponse_v) : null;
      if(localReResponse_v!==null && localReResponse_v!==undefined){
        let localOrificeAreaUnit=selectedOrificeArea?.value?.split('.')[1];
        // if(localOrificeAreaUnit !==localReResponse_v?.uomReceived?.orificeAreaUOM){
          let localuomReceived={...localReResponse_v?.uomReceived};
          localOrificeAreaUnit=localOrificeAreaUnit.replace("2", "²")
          localuomReceived={
            ...localuomReceived,
            orificeAreaUOM:localOrificeAreaUnit
          }
          localReResponse_v={
            ...localReResponse_v,
            uomReceived:localuomReceived
          }
        // }
      }
    
      return {...row,
        Wreq,  
        Vreq,
        Qreq,
        WreqV,
        SetPressure: row?.Pset,
        OverPressure: row?.Pover,
        OverPressurePer: row?.PoverP,
        ReqFlowPer: parseFloat(row?.ValveSelectedPer),
        ReqOrificeArea: row?.Areq,
        ReResponse: localReResponse!==null?JSON.stringify(localReResponse):null,
        ReResponse_v: localReResponse_v!==null?JSON.stringify(localReResponse_v):null,
        TotalReqArea: MultiValveSelectionData?.totalRequiredArea,
        TotalSelectedArea: MultiValveSelectionData?.totalSelectedArea,
        TotalSelectedPer: MultiValveSelectionData?.TotalSelectedPercentage,
        TotalRatedPressValveFlow: MultiValveSelectionData?.RatedPressFlow,
        TotalActualPressValveFlow: MultiValveSelectionData?.TotalActualPressFlow,
        Quantity:row?.Quantity ?? 1,
        SelectedValve: {...row},
        "ItemNumber":`0001`
    }
    });
            
    
    if (selectedResultRows?.length > 0) {
      
      payloadObj = {
        ...payloadObj,
        // ...selectedResultRows[0],   
        // "Wreq": Wreq,  
        // "Vreq": Vreq,
        // "Qreq": Qreq,
        // "WreqV": WreqV,
        // "error": localError,
        // "ReResponse": localReResponse!==null?JSON.stringify(localReResponse):null,
        // "ReResponse_v": localReResponse_v!==null?JSON.stringify(localReResponse_v):null,
        "SelectedValve":updatedSelectedResultRows?.length >0?updatedSelectedResultRows:[],
        // "ItemNumber":`0001`
      }
    }
    // console.log('Proceed Payload >>>>>>>>>. ',localSelectedFields,localPayloadData,payloadObj)
    // payloadObj['IsASMESection8'] = IsASMESection8;
    // payloadObj['SizingTabIndex'] = activeMenu;

    // console.log('Sizing Details Saved:: payloadObj >>>> ',payloadObj);
    localTempPayloadObj={...payloadObj,...localTempPayloadObj};
    dispatch(setPayloadData(localTempPayloadObj));
    const config = { url: SAVE_WF_DATA_API, method: "post", data: payloadObj };
    dispatch(saveWorkflowData(config)).then((data) => {
      const msg = `Sizing details saved successfully with Sizing Id ${data.payload.sizingData[0].SizingId}`;
      // dispatch(onUpdateFields);
      dispatch(
        updateSnakebar({ status: true, message: msg, severity: "success" })
      );
      // if (draftStage === 3) {
      //   gosProceedFuncion(data.payload.sizingData[0]);
      // }
    });
  };

  const handleClearSizingDetails = () => {
    // dispatch(clearPayloadData());
    // console.log('Sizing Details Cleared');
    dispatch(setPayloadData({}));
    dispatch(resetSelectedFields());
    dispatch(onSelectMenu(0));
    dispatch(resetNavigationMenu());
  };

  return {
    payloadData,
    updateTcResponse,
    handleSaveSizingData,
    handleSaveWorkflowData,
    handleClearSizingDetails,
    handleSaveGVS,
  };
};

export default useSaveSizing;
