import { useEffect, useMemo, useState } from 'react';
import {   getDisplayUnit, getSizingFields, getUOMKey, validateMandatoryFields } from '../utils/validation';
import { useDispatch, useSelector } from 'react-redux';
import { setActivateResults, updateNavigationValue } from '../store/slices/navigationSlice';
import { onUpdateFields, onUpdateListOfFields, setEnterTankData } from '../store/slices/workflowSlice';
import usePopupPanel from './usePopupPanel';
import { API2000_WF, API2000PopupResultPressureFields, API2000PopupResultVacuumFields, Popup_Result_Var_list, Pressure_Popupo_Fields, Vacuum_Popup_Fields, WF_BACKEND_CONFIGURATION_FLAG } from '../utils/constants';
import useSaveSizing from './useSaveSizing';
import useSearchSizing from './useSearchSizing';
import { setFlowRatePopupFlag, setFlowRateVacuumPopupFlag, setIsPopupDataSaved } from '../store/slices/workflowPayloadSlice';
import { convertUnitDiffDims } from '../utils/convertUnit';
// import { setFlowCalcPopupSaved } from '../store/slices/workflowPayloadSlice';

function usePopupFields(tabIndex) {
  const dispatch = useDispatch();
  const {menus} = useSelector(state=>state.navigation);
  const {focusedFieldName} = useSelector(state=>state.generic);
  const {preferences} = useSelector(state => state.auth);
  // Initialize state as an array to hold objects for each item
  const { heading, items, displayType,  UpdateSectionFields,handleChange, handleBlur, handleFocusedFieldName } = usePopupPanel(tabIndex);
  const {updateTcResponse,handleSaveWorkflowData}=useSaveSizing();
  const {searchSizing} =useSearchSizing(false);
  const {units,defaultUnits} = useSelector(state => state.uom);
  const { selectedFields,error,EnterTankData,selectedWorkflow,searchFlag,status, fieldValidationResults,uomConvertedValues } = useSelector(state => state.workflow);
  const { payloadData,sizingData } = useSelector(state => state.workflowPayload);
  const [fieldData, setFieldData] = useState([]);
  const [popupFlag,setPopupFlag]=useState(false);
  const [apiHitFlag,setApiHitFlag]=useState(false);
  const [currentFieldData, setCurrentFieldData] = useState([]);
  const [localSelectedFields,setLocalSelectedFields]=useState([...selectedFields]);
  const [localPayloadData,setLocalPayloadData]=useState({...payloadData});
  const [okButtonDisabled,setOkButtonDisabled]=useState(false);
  const [closeButtonDisabled,setCloseButtonDisabled]=useState(false);


useEffect(() => {
    // console.log('Popup Change 11111 >>>>>>>>>>>>: useEffect:::111111111111 >>>>>>>>>>> ',displayType,displayType === 'form',selectedWorkflow,payloadData?.CalculateFlowRate,(EnterTankData || payloadData?.EnterTankData || (payloadData?.CalculateFlowRate && API2000_WF.indexOf(selectedWorkflow)!==-1)),apiHitFlag)
    if((EnterTankData || payloadData?.EnterTankData || (payloadData?.CalculateFlowRate && API2000_WF.indexOf(selectedWorkflow)!==-1))){
        if (items !== undefined && items !== null && items.length > 0 && JSON.stringify(items) !== JSON.stringify(currentFieldData)){
            setCurrentFieldData(items);
            setPopupFlag(true);
        }
    }else{
        setPopupFlag(false);
    }
}, [items]);

const UpdateFieldData = (localdisplayType,localfieldData,localselectedFields,localpayloadData,localErrors,logtype='Form Type') => {
    // if (displayType === 'form' && localfieldData !== undefined && localfieldData !== null && localfieldData.length > 0 ) {
        const validationResults=WF_BACKEND_CONFIGURATION_FLAG ?{...fieldValidationResults} : null;
        let updatedData=getSizingFields(localdisplayType,localfieldData,localselectedFields,localpayloadData,defaultUnits,localErrors,focusedFieldName,units,preferences,validationResults);
        // console.log('In Popup >>>>>>>>>>>> 1111111',updatedData)
        const isPressureOnly=localpayloadData['IsPressureOnly']!==undefined?localpayloadData['IsPressureOnly']:false;
        const isVacuumOnly=localpayloadData['IsVacuumOnly']!==undefined?localpayloadData['IsVacuumOnly']:false;
        updatedData=updatedData.map((field)=>{
            if(field.gridSection===2 && field.type!=="label"){
                const keys=Object.keys(field.value);
                if(!isPressureOnly){
                    // console.log(`Popup 1111 >>>>>>>>>>>> ${keys} >> ${keys[0]} >> ${API2000PopupResultPressureFields.indexOf(keys[0])!==-1} >> isPressureOnly:: ${isPressureOnly} ::::: In useFormFields :: updatedData >>>>>>>>>>>`, field.value)
                    if(API2000PopupResultPressureFields.indexOf(keys[0])!==-1){
                        return {...field,value:{...field.value,[keys[0]]:''}};
                    }
                }
                if(!isVacuumOnly){
                    // console.log(`Popup 1111 >>>>>>>>>>>> ${keys} >> ${keys[1]} >> ${API2000PopupResultVacuumFields.indexOf(keys[1])!==-1}>> isVacuumOnly:: ${isVacuumOnly} ::::: In useFormFields :: updatedData >>>>>>>>>>>`, field.value)
                    if(API2000PopupResultVacuumFields.indexOf(keys[1])!==-1){
                        return {...field,value:{...field.value,[keys[1]]:''}};
                    }
                }
            }
            return field;
        })
        // console.log('In use PopupPanel:::calculatedFields::Popup 1111 >>>>>>>>>>>> updatedData >>>>>>>>>>>>>>>>', updatedData)
        let uomFields=[];
        updatedData.forEach((field)=>{
   
            if(field?.type==='radio'){
                const radioKey=selectedFields.find((f1)=>f1?.name===field.fieldName);
                // console.log('In useFormField >>>>>>>>>>>> ',field?.type,radioKey,field.fieldList.length)
                if(radioKey===undefined){
                    if(field?.fieldList?.length>0){
                        const localField=field?.fieldList.find((f1)=> f1?.defaultValue===true);
                        // console.log('In useFormField:: check radio >>>>>>>>>>>> ',localField)
                        if(localField!==undefined){
                            const item={name:field?.fieldName,value:localField.fieldName,page:"useFormFields_radio"}
                            // dispatch(onUpdatePayloadData(item));
                            uomFields.push(item);
                            // dispatch removed — batched below after forEach
                        }
                    }
                }
            }
            if(field?.type==='radioInput'){
                const radioKey=localselectedFields.find((f1)=>f1.name===field.fieldName);
                if(radioKey===undefined){
                    const item={name:field.fieldName,value:field.defaultSelected}
                    // console.log('In useFormField:: check radio >>>>>>>>>>>> ',item)
                    uomFields.push(item);
                    // dispatch removed — batched below after forEach
                }
            }
            if(field?.type==='multiInputUom'){
                let localField = field?.fieldList[0];
                if(Array.isArray(localField.dimensionName)){
                    let localDimension=localField.dimensionName[0];
                    let displayUnit;
                    let unitValue;
                    let key=localField?.DbUomFieldName!==undefined?localField?.DbUomFieldName:getUOMKey(localDimension,field?.UomFieldName);
                    //console.log(' In useFormField:: check UOM11 >>>>>>>>>>>> ',key,localField?.dimensionName,localField?.UomFieldName, localField?.DbUomFieldName)
                    const verifyKey=localselectedFields.find((f1)=>f1.name===key);
                    // console.log('In useFormField:: check UOM >>>>>>>>>>>> ',key,verifyKey)
                    if(verifyKey===undefined || verifyKey?.value===undefined || verifyKey?.value===null || verifyKey?.value===''){
                        // const localDimension=field?.dimensionName[0];
                        displayUnit=getDisplayUnit(localselectedFields);
                        unitValue=defaultUnits[displayUnit][localDimension];
                        uomFields.push({name:key,value:unitValue,page:"useFormFields_dimensionName"})
                        // dispatch removed — batched below after forEach
                        // dispatch(onUpdatePayloadData({name:key,value:unitValue}))
                    }
                }
            }
            if(field?.dimensionName!==undefined && field?.dimensionName!==null && field?.dimensionName!==''){
                let key;
                if(Array.isArray(field?.dimensionName)){

                    let localDimension=field?.dimensionName[0];
                    let displayUnit;
                    let unitValue;
                    key=field?.UomFieldName!==undefined?field?.UomFieldName:getUOMKey(localDimension,field?.UomFieldName);
                    // console.log(' In useFormField:: check UOM >>>>>>>>>>>> ',key,field?.dimensionName,field?.UomFieldName)
                    
                    const verifyKey=selectedFields.find((f1)=>f1.name===key);
                    // console.log('In useFormField:: check UOM >>>>>>>>>>>> ',key,verifyKey)
                    if(verifyKey===undefined || verifyKey?.value===undefined || verifyKey?.value===null || verifyKey?.value===''){
                        // const localDimension=field?.dimensionName[0];
                        displayUnit=getDisplayUnit(selectedFields);
                        unitValue=defaultUnits[displayUnit][localDimension];
                        uomFields.push({name:key,value:unitValue,page:"useFormFields_dimensionName"})
                        // dispatch removed — batched below after forEach
                        // dispatch(onUpdatePayloadData({name:key,value:unitValue}))

                    }
                    // update DBUomFieldName
                    let Dbkey=field?.DbUomFieldName;
                    //console.log(' In useFormField:: check UOM >>>>>>>>>>>> ',field.fieldName, 'key', key,Dbkey,field?.UomFieldName,field?.DbUomFieldName)
                    if(Dbkey!==undefined && Dbkey!==null && Dbkey!==''){
                        const verifyKey=selectedFields.find((f1)=>f1.name===Dbkey);
                        // // console.log('In useFormField:: check UOM useFormFields_dimensionNameDb >>>>>>>>>>>> ',key,verifyKey, Dbkey, unitValue)
                        if((verifyKey===undefined || verifyKey?.value===undefined || verifyKey?.value===null || verifyKey?.value==='') && unitValue!==undefined){
                            const localDimension=field?.dimensionName[0];
                            uomFields.push({name:Dbkey,value:unitValue,page:"useFormFields_dimensionNameDb"})
                            // dispatch removed — batched below after forEach
                            // dispatch(onUpdatePayloadData({name:key,value:unitValue}))

                        }
                    }

                }else{
                    key=field?.UomFieldName!==undefined?field?.UomFieldName:getUOMKey(localDimension,field?.UomFieldName);
                    const verifyKey=selectedFields.find((f1)=>f1.name===key);
                    if(verifyKey===undefined || verifyKey?.value===undefined || verifyKey?.value===null || verifyKey?.value===''){
                        const displayUnit=getDisplayUnit(selectedFields);
                        const unitValue=defaultUnits[displayUnit][field?.dimensionName];
                        uomFields.push({name:key,value:unitValue,page:"useFormFields_dimensionName 2"})
                        // dispatch removed — batched below after forEach
                        // dispatch(onUpdatePayloadData({name:key,value:unitValue}))
                    }
                }
                
                
            }
        })

        // Phase 5: Batch all UOM-default updates into a single onUpdateListOfFields dispatch.
        // Previously each missing UOM field triggered a separate dispatch(onUpdateFields(...))
        // causing the O(n) filter+push reducer to run once per field (~10-15x per getSizingFields).
        // Now the reducer runs exactly once regardless of how many UOM defaults are needed.
        if (uomFields.length > 0) {
            let batchedSelFields = [...localselectedFields];
            let batchedPayload   = {...localpayloadData};
            uomFields.forEach(f => {
                batchedSelFields = batchedSelFields.filter(sf => sf.name !== f.name);
                batchedSelFields.push({name: f.name, value: f.value, page: f.page});
                batchedPayload[f.name] = f.value;
            });
            dispatch(onUpdateListOfFields({selectedFields: batchedSelFields, payloadData: batchedPayload}));
        }

        
        const localMenu=validateMandatoryFields(updatedData,localselectedFields,localpayloadData,menus,tabIndex);
        // console.log('NavigationValue ::::::: ',localMenu);

        if(localMenu?.length>0){
            let localActivateResults=true;
            for(const menu of localMenu){
                if(menu?.isCompleted===false){
                    localActivateResults=false;
                    break;
                }else if(menu.errorType==='error'){
                    localActivateResults=false;
                    break;
                }
            }
            dispatch(setActivateResults(localActivateResults))
            dispatch(updateNavigationValue(localMenu))
        }else{
            dispatch(updateActiveResults(false))
        }
        
        // setFieldData(updatedData);
        if(localfieldData.find(item=>item.fieldName==='IsPressureOnly|IsVacuumOnly')){
            if(payloadData['IsVacuumOnly'] !== undefined && payloadData['IsVacuumOnly'] ===false){
                let updatedMenu = JSON.parse(JSON.stringify(menus))
                
                    updatedMenu.map(menuItem=>{
                        if (menuItem.name === 'Vacuum Case') {
                            menuItem.isCompleted = true;
                        }
                        return menuItem
                    });
                    dispatch(updateNavigationValue(updatedMenu))
                //}, 0);
             }
             if(localpayloadData['IsPressureOnly'] !== undefined && localpayloadData['IsPressureOnly'] ===false){
                let updatedMenu = JSON.parse(JSON.stringify(menus))
                updatedMenu.forEach(menuItem=>{
                     if(menuItem.name === 'Pressure Case'){
                         menuItem.isCompleted = true;
                     }
                 })
                 dispatch(updateNavigationValue(updatedMenu))
             }
        }
        return {updatedData,uomFields};
    
}

const convertedValue=(value,oldUom,newUom,vacuumFlag)=>{
    const dim=oldUom.split('.')[0];
    oldUom=units[dim].find((item)=>item.UnitKey===oldUom);
    newUom=units[dim].find((item)=>item.UnitKey===newUom);
    return convertUnitDiffDims(value, oldUom, newUom,units,payloadData,vacuumFlag);
}

useEffect(() => {
    // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> 9999999 >>> In useFormFields :: useEffect:::444444 >>>>>>>>>>> ',apiHitFlag)
    if (displayType === 'popup' && currentFieldData !== undefined && currentFieldData !== null && currentFieldData.length > 0 ) {
        // if(payloadData['UomFieldName']!=='' && payloadData['UomFieldName']!==undefined && payloadData['UomFieldName']!==null){
        //     dispatch(onUpdateFields({name:'UomFieldName''UomFieldName',value:''}));
        // }
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> 9999999 >>> In useFormFields :: useEffect:::33333 >>>>>>>>>>> ',apiHitFlag)
        const {updatedData,uomFields}=UpdateFieldData(displayType,currentFieldData,selectedFields,payloadData,error,'Form Type');
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> 9999999 >>> In useFormFields :: useEffect:::33333 >>>>>>>>>>> ',updatedData.length)
        let newFieldData=[...updatedData];
        let localpayload={...payloadData};
        let localSelFields=[...selectedFields];
        uomFields.forEach((field)=>{
            localpayload[field.name]=field.value;
            localSelFields=localSelFields.filter((f1)=>f1.name!==field.name);
            localSelFields.push({name:field.name,value:field.value});
        });
        if(selectedWorkflow===12){
            if(localpayload['PopupValueChange'] !==true){
                if(localpayload['WallTemp']!=localpayload['VesselWall'] || localpayload['OperatingPopup']!=localpayload['Operating'] || localpayload['OperatingPressurePopup']!=localpayload['OperatingPressure']){

                    localSelFields=localSelFields.map((field)=>{
                        if(field?.name==='WallTemp'){
                            localpayload['WallTemp']=localpayload['VesselWall'];
                            return {...field,value:localpayload['VesselWall']};
                        }else if(field?.name==='OperatingPopup'){
                            localpayload['OperatingPopup']=localpayload['Operating'];
                            return {...field,value:localpayload['Operating']};
                        }else if(field?.name==='OperatingPressurePopup'){
                            localpayload['OperatingPressurePopup']=localpayload['OperatingPressure'];
                            return {...field,value:localpayload['OperatingPressure']};
                        }else{
                            return field;
                        }
                    });
                    const storeObj={selectedFields:localSelFields,payloadData:localpayload};
                    // console.log('In handleOk :: 3333 >>>>>>>>>>>> ',storeObj)
                    dispatch(onUpdateListOfFields(storeObj));
                }
            }
        }else if(API2000_WF.indexOf(selectedWorkflow)!==-1){
            if(localpayload['PopupValueChange'] !==true){
                
                // newFieldData=updatedData.map((field)=>{
                //     if(localpayload[`prev${field.UomFieldName}`]!==undefined && localpayload[field.UomFieldName] !== localpayload[`prev${field.UomFieldName}`] ){
                //         let localField={...field};
                //         localField.value=convertedValue(localField.value,localpayload[`prev${field.UomFieldName}`],localpayload[field.UomFieldName],false);
                //         console.log('In use PopupPanel:::calculatedFields uomFields >>>>>>>>>>>> ',field.fieldName,uomFields,updatedData,localpayload[`prev${field.UomFieldName}`],localpayload[field.UomFieldName],payloadData)
                //         return localField;
                //     }else if(field.UomFieldName===undefined && field?.fieldList!==undefined){
                //         let localField={...field};
                //         let fieldValue;
                        
                //         localField.fieldList= field?.fieldList?.map((subField)=>{
                //             let localSubField={...subField};
                //             if(localpayload[`prev${subField.UomFieldName}`]!==undefined && localpayload[subField.UomFieldName] !== localpayload[`prev${subField.UomFieldName}`] ){
                //             // console.log('In use PopupPanel:::calculatedFields uomFields >>>>>>>>>>>> ',localSubField.fieldName,subField,uomFields,updatedData,localpayload[`prev${field.UomFieldName}`],localpayload[field.UomFieldName],payloadData)
                //                 let localSubValues={}
                //                 localSubField.fieldName.forEach((subFieldName)=>{
                //                     const VacuumFlag=subFieldName.indexOf('Vacuum')!==-1?true:false;
                //                     localSubValues[subFieldName]=convertedValue(field.value[subFieldName],localpayload[`prev${subField.UomFieldName}`],localpayload[subField.UomFieldName],VacuumFlag);
                //                 });
                //                 // console.log('In use PopupPanel:::calculatedFields uomFields >>>>>>>>>>>> ',localSubField,localSubValues)
                //                 // localSubField.value={...localSubValues};
                //                 fieldValue={...localSubValues};
                //                 return localSubField;
                //             }else{
                //                 return localSubField;
                //             }
                //         });
                //         console.log('In use PopupPanel:::calculatedFields >>>>>>> 55555 >>>>>>. ',localField.fieldName,localField.value,fieldValue)
                //         localField.value={...fieldValue};
                //         return localField;
                //     }
                // // else{
                //     return field;
                // //     }
                // })
            }  
        }
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> 222222 >>>>>>>>>>>> ',newFieldData,newFieldData)
        setOkButtonDisabled(false);
        setCloseButtonDisabled(false);
        setLocalPayloadData(localpayload);
        setLocalSelectedFields(localSelFields);
        setFieldData(newFieldData);

    }else{
        setLocalPayloadData({...payloadData});        
        setLocalSelectedFields([...selectedFields]);
        setFieldData(currentFieldData);
    }
    //, payloadData['IsVacuumOnly'], payloadData['IsPressureOnly']
}, [ currentFieldData,
    fieldValidationResults,
    error, uomConvertedValues,
    payloadData['IsVacuumOnly'], payloadData['IsPressureOnly'], payloadData['LengthUOM']]);

 useEffect(() => {
     if(apiHitFlag===true && status!=='loading'){
        // console.log('Popup Change 11111 >>>>>>>>>>>> >>>>>>>> 22222 >>>>> apiHitFlag, status>>>>>>>>>>>>33333 >>>>>>>> ',searchFlag,status,apiHitFlag,EnterTankData,fieldData?.length)
        if(selectedWorkflow===12){
            dispatch(setEnterTankData(false));
            dispatch(onUpdateFields({name:'EnterTankData',value:false,page:"usePopupFields"}));
        }else if(API2000_WF.indexOf(selectedWorkflow)!==-1){
            dispatch(onUpdateFields({name:'CalculateFlowRate',value:false}));
        }
        setApiHitFlag(false);
        setPopupFlag(false);
        setOkButtonDisabled(false);
        setCloseButtonDisabled(false);
        
        // console.log(`Popup Change 11111 >>>>>>>>>>> :: handle Close >>>>>>>>>>>> apiHitFlag:: ${apiHitFlag}`);
    }
}, [status,EnterTankData,fieldData,apiHitFlag]);

const handleClose=(event,reason)=>{
    // console.log(`Popup Change 11111 >>>>>>>>>>>>In handle Close >>>>>>>>>>>> reason:: ${reason}`);
    if (reason && reason === "backdropClick") 
        return;

    dispatch(onUpdateFields({name:`UomFieldName`,value:'',page:"handleClose"}));
    // console.log(`In Popup :: handle Close >>>>>>>>>>>> closeButtonDisabled:: ${closeButtonDisabled}`);
    if(!closeButtonDisabled){
        setOkButtonDisabled(true);
        setCloseButtonDisabled(true);
        // console.log('Popup Change 11111 >>>>>>>>>>>> >>>>>>>> ',searchFlag,sizingData?.SizingId,payloadData)
        let localSelectedFields=[...selectedFields];
        let localPayloadData={...payloadData};
        if(localPayloadData['PopupValueChange']){
            if(sizingData?.SizingId!==undefined){
                // console.log('Popup Change 11111 >>>>>>>>>>>> >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> handle Close >>>>>>>>>>>>>>>>> ')
                searchSizing(sizingData?.SizingId);
            }else if(!searchFlag){
                // console.log('Popup Change 11111 >>>>>>>>>>>> field 111>>>>>>>>>>>>>>>>>>',items)
                items.forEach((item)=>{
                    const defaultValue = item.fieldName==='Relieving' || item.fieldName==='Operating' || item.fieldName==='SystemMAWP' || item.fieldName==='OperatingPressure' ?localPayloadData[item.fieldName]:item.type==='radio'?item?.fieldList!==undefined?item?.fieldList[0]?.fieldName:item?.defaultValue:item.type==='checkbox'?item.defaultValue===''?false:item.defaultValue:typeof item.defaultValue==='object'?Array.isArray(item.defaultValue)?'':item.defaultValue.value:typeof item.defaultValue==='string'?item.defaultValue:typeof item.defaultValue==='boolean'? item.defaultValue===''?false:item.defaultValue:'';
                    // console.log('Popup Change 11111 >>>>>>>>>>>> field 2222>>>>>>>>>>>>>>>>>>',item.fieldName,item.defaultValue)
                    localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==item.fieldName);
                    localSelectedFields.push({name:item.fieldName,value:defaultValue});
                    localPayloadData[item.fieldName]=defaultValue;
                });
                let clearFields=['Wreq','WreqV','TankVolume','SurfaceArea','WettedArea'];
                clearFields=[...clearFields,...Vacuum_Popup_Fields,...Pressure_Popupo_Fields,...Popup_Result_Var_list]
                clearFields.forEach((item)=>{
                    localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==item);
                    localSelectedFields.push({name:item,value:''});
                    localPayloadData[item]='';
                });
                
                localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='tcResponse');
                localSelectedFields.push({name:'tcResponse',value:null});
                localPayloadData['tcResponse']=null;
            }
        }
        if(selectedWorkflow===12){
            
            // console.log('field 11111>>>>>>>>>>>>>>>>>>',items.length);
            if(!searchFlag || sizingData?.SizingId===undefined){
                localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='Wreq');
                localSelectedFields.push({name:'Wreq',value:''});
                localPayloadData['Wreq']='';
            }
            

            if(localPayloadData['EnterTankData']!==undefined){
                localPayloadData['EnterTankData']=false;
                localSelectedFields=localSelectedFields.map((field)=>{
                    if(field.name==='EnterTankData'){
                        return {...field,value:false}
                    }
                    return field;
                });
            }

            
            dispatch(setEnterTankData(false));
            
        }else if(API2000_WF.indexOf(selectedWorkflow)!==-1){
            if(!searchFlag){
                // console.log('In usetabPanel >>>>>>>>>>>>>>> 111111',localPayloadData['IsVacuumOnly'], localPayloadData['ProductMovementVacuum']!=='')
                if(localPayloadData['API2000WreqChanged']===false){
                    if(localPayloadData['Wreq']!==undefined){
                        localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='Wreq');
                        localSelectedFields.push({name:'Wreq',value:''});
                        localPayloadData['Wreq']='';
                    }
                }else if(localPayloadData['IsVacuumOnly'] && localPayloadData['ProductMovementVacuum']!==''){
                    localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='FlowRateVacuumPopupFlag');
                    localSelectedFields.push({name:'FlowRateVacuumPopupFlag',value:true});
                    localPayloadData['FlowRateVacuumPopupFlag']=true;
                    dispatch(setFlowRateVacuumPopupFlag(true));
                }
                // console.log('In usetabPanel >>>>>>>>>>>>>>> 222222',localPayloadData['FlowRateVacuumPopupFlag'], localPayloadData['ProductMovementVacuum']!=='')
                if(localPayloadData['API2000WreqVChanged']===false){
                    if(localPayloadData['Wreqv']!==undefined){
                        localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='Wreqv');
                        localSelectedFields.push({name:'Wreqv',value:''});
                        localPayloadData['Wreqv']='';
                    }
                }else if(localPayloadData['IsPressureOnly'] && localPayloadData['ProductMovementPressure']!==''){
                    localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='FlowRatePopupFlag');
                    localSelectedFields.push({name:'FlowRatePopupFlag',value:true});
                    localPayloadData['FlowRatePopupFlag']=true;
                    dispatch(setFlowRatePopupFlag(true));
                }

                
            }
            

        }
        // console.log('In usetabPanel >>>>>>>>>>>>>>> 33333 >>>>>>>>>>>> In Close Popup >>>>>>>>>>>> >>>>>>>> ',localPayloadData['FlowRateVacuumPopupFlag'], localPayloadData['ProductMovementVacuum']!=='')
        dispatch(onUpdateListOfFields({selectedFields:localSelectedFields,payloadData:localPayloadData}));
        // setPopupFlag(false);
        setApiHitFlag(true);
        // console.log('Popup Change 11111 >>>>>>>>>>>> handle close >>>>>>');
    }

    if(payloadData['PopupValueChange']===true){
        dispatch(onUpdateFields({name:`PopupValueChange`,value:false}));
    }
    // console.log(`In Popup :: handle CloseIn handle Close >>>>>>>>>>>> PopupValueChange:: ${payloadData['PopupValueChange']}`);
}

const handleOk=()=>{
    // console.log('Popup Change 11111 >>>>>>>>>>>>In handleok >>>>>>>>>>>> >>>>>>>> ',okButtonDisabled)
    // console.log(`In handleOk :: 11111>>>>>>>>>>>> okButtonDisabled:: ${okButtonDisabled}`);
    dispatch(onUpdateFields({name:`UomFieldName`,value:'',page:"handleOk"}));
    // dispatch(setFlowCalcPopupSaved(true));
    if(!okButtonDisabled){
        setOkButtonDisabled(true);
        setCloseButtonDisabled(true);
        let localSelectedFields=[...selectedFields];
        let localPayloadData={...payloadData};
        // console.log(`In handleOk :: 22222 >>>>>>>>>>>> selectedWorkflow:: ${selectedWorkflow} >>> ${API2000_WF.indexOf(selectedWorkflow)!==-1} >>> `,localPayloadData);
        // console.log('Popup Change 11111 >>>>>>>>>>>> Store data >>>>>>>>>>>>>>>>> 11111111111111 >>>>>>>>> ',{localSelectedFields,localPayloadData})
        if(selectedWorkflow===12){
            // dispatch(setEnterTankData(false));
            localSelectedFields=localSelectedFields.map((field)=>{
        
                if(field.name==='EnterTankData'){
                    localPayloadData['EnterTankData']=false;
                    return {...field,value:false};
                }else 
                if(field.name.indexOf('UOM')!==-1){
                    let fieldValue=localPayloadData[field.name];
                    if(fieldValue!==undefined && fieldValue!==null && fieldValue!==''){
                        let fieldDim=fieldValue.split(".")[0];
                        if(fieldDim==='length'){
                            fieldValue=localPayloadData['LengthUOM'];
                        }else if(fieldDim==='area'){
                            fieldValue=localPayloadData['AreaUOM'];
                        }else if(fieldDim==='massflow'){
                            fieldValue=localPayloadData['FlowCapacityUOM'];
                        }
                        localPayloadData[field.name]=fieldValue;
                        return {...field,value:fieldValue};
                    }
                }else if(field.name==='VesselWall'){
                    const WallTemp = localPayloadData['WallTemp'] !==undefined && localPayloadData['WallTemp']!==null ? localPayloadData['WallTemp'] :localPayloadData['VesselWall'];
                    localPayloadData['VesselWall']=WallTemp;
                    return {...field,value:WallTemp};
                }else if(field.name==='Operating'){
                    const OperatingPopup = localPayloadData['OperatingPopup'] !==undefined && localPayloadData['OperatingPopup']!==null ? localPayloadData['OperatingPopup'] :localPayloadData['Operating'];
                    localPayloadData['Operating']=OperatingPopup;
                    return {...field,value:OperatingPopup};
                }else if(field?.name==='OperatingPressure'){
                    const OperatingPressurePopup = localPayloadData['OperatingPressurePopup'] !==undefined && localPayloadData['OperatingPressurePopup']!==null ? localPayloadData['OperatingPressurePopup'] :localPayloadData['OperatingPressure'];
                    localPayloadData['OperatingPressure']=OperatingPressurePopup;
                    return {...field,value:OperatingPressurePopup};
                }
                return field;
            });

            const storeObj={selectedFields:localSelectedFields,payloadData:localPayloadData};
            // console.log('In handleOk :: 3333 >>>>>>>>>>>> ',storeObj)
            dispatch(onUpdateListOfFields(storeObj));
            handleSaveWorkflowData(1,storeObj);
            setApiHitFlag(true);
            // console.log('In handleOk :: 444444 >>>>>>>>>>>> ')
        }else if(API2000_WF.indexOf(selectedWorkflow)!==-1){
            let tcResponse=localPayloadData['tcResponse'];
            if(tcResponse!==undefined && tcResponse!==null && tcResponse!==''){
                tcResponse=updateTcResponse(tcResponse);
                // console.log('In use PopupPanel:::calculatedFields tcResponse >>>> 1111 >>>>>',tcResponse)
                localPayloadData['tcResponse']=tcResponse;

                localSelectedFields=localSelectedFields.map((field)=>{
                    if(field.name==='tcResponse'){
                        return {...field,value:tcResponse};
                    }
                    return field;
                });
            }
            localSelectedFields=localSelectedFields.map((field)=>{
                
                if(localPayloadData['IsPressureOnly'] && field.name==='FluidName'){
                    localPayloadData['FluidName']='Air';
                    return {...field,value:'Air'};
                }else if(localPayloadData['IsVacuumOnly'] && field.name==='FluidNameVacuum'){
                    localPayloadData['FluidNameVacuum']='Air';
                    return {...field,value:'Air'};
                }else if(localPayloadData['IsPressureOnly'] && field.name==='MolWeight'){
                    localPayloadData['MolWeight']='28.97000';
                    return {...field,value:'28.97000'};
                }else if(localPayloadData['IsVacuumOnly'] && field.name==='MolWeightVacuum'){
                    localPayloadData['MolWeightVacuum']='28.97000';
                    return {...field,value:'28.97000'};
                }else if(localPayloadData['IsPressureOnly'] && field.name==='KCpByCv'){
                    localPayloadData['KCpByCv']='1.40000';
                    return {...field,value:'1.40000'};
                }else if(localPayloadData['IsVacuumOnly'] && field.name==='KCpByCvVacuum'){
                    localPayloadData['KCpByCvVacuum']='1.40000';
                    return {...field,value:'1.40000'};
                }else if(localPayloadData['IsPressureOnly'] && field.name==='Compressibility'){
                    localPayloadData['Compressibility']='1.00000';
                    return {...field,value:'1.00000'};
                }else if(localPayloadData['IsVacuumOnly'] && field.name==='CompressibilityVacuum'){
                    localPayloadData['CompressibilityVacuum']='1.00000';
                    return {...field,value:'1.00000'};  
                }else if(field.name==='Wreq' || field.name==='WreqV'){
                    if(localPayloadData[`${field.name}1`]!==''){
                        localPayloadData[field.name]=localPayloadData[`${field.name}1`];
                        return {...field,value:localPayloadData[`${field.name}1`]};    
                    } 
                }else if(field.name.indexOf('UOM')!==-1 && field.name!=='insulationThicknessUOM'){
                    let fieldValue=localPayloadData[field.name];
                    if(fieldValue!==undefined && fieldValue!==null && fieldValue!==''){
                        let fieldDim=fieldValue.split(".")[0];
                        if(fieldDim==='length'){
                            fieldValue=localPayloadData['LengthUOM'];
                        }else if(fieldDim==='area'){
                            fieldValue=localPayloadData['AreaUOM'];
                        }else if(fieldDim==='massflow'){
                            fieldValue=localPayloadData['FlowCapacityUOM'];
                        }
                        localPayloadData[field.name]=fieldValue;
                        return {...field,value:fieldValue};
                    }
                }
                return field;
            });
            if(localPayloadData['IsPressureOnly']){
     
                localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='FlowRatePopupFlag');
                localSelectedFields.push({name:'FlowRatePopupFlag',value:true});
                localPayloadData['FlowRatePopupFlag']=true;
                dispatch(setFlowRatePopupFlag(true));
                localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='API2000WreqChanged');
                localSelectedFields.push({name:'API2000WreqChanged',value:false});
                localPayloadData['API2000WreqChanged']=false;
            }
            if(localPayloadData['IsVacuumOnly']){

                localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='FlowRateVacuumPopupFlag');
                localSelectedFields.push({name:'FlowRateVacuumPopupFlag',value:true});
                localPayloadData['FlowRateVacuumPopupFlag']=true;
                dispatch(setFlowRateVacuumPopupFlag(true));
                localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='API2000WreqVChanged');
                localSelectedFields.push({name:'API2000WreqVChanged',value:false});
                localPayloadData['API2000WreqVChanged']=false;
            }
            const storeObj={selectedFields:localSelectedFields,payloadData:localPayloadData};
            // console.log('Popup Change 11111 >>>>>>>>>>>> >>>>>>>> 22222 >>>>>first In handleOk :: 3333 >>>>>>>>>>>> ',storeObj)
            // console.log('Store data >>>>>>>>>>>>>>>>> 222222222222222 >>>>>>>>> ',{storeObj})
            dispatch(onUpdateListOfFields(storeObj));
            
            handleSaveWorkflowData(1,storeObj);
            // console.log('Popup Change 11111 >>>>>>>>>>>> handle Ok >>>>>>');
            setApiHitFlag(true);
        }
        
        dispatch(setIsPopupDataSaved(true));
        // setPopupFlag(false);
        // console.log('Popup Change 11111 >>>>>>>>>>>> >>>>>>>> 22222 >>>>>',searchFlag,status,apiHitFlag,EnterTankData,fieldData?.length)
    }

    if(payloadData['PopupValueChange']===true){
        dispatch(onUpdateFields({name:`PopupValueChange`,value:false}));
    }
}

const handleBlurField=(item)=>{
    // console.log('On Blur >>>>>>>>>>>> 33333',item);
    handleBlur(item);
}

  return {
    heading,
    fieldData,
    apiHitFlag,
    displayType,
    popupFlag, 
    focusedFieldName,
    localPayloadData,
    localSelectedFields,
    okButtonDisabled,
    closeButtonDisabled,
    handleClose,
    handleOk,
    handleChange,
    handleBlurField,
    handleFocusedFieldName
};
}

export default usePopupFields;