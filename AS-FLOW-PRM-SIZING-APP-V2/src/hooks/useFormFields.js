import { useEffect, useState } from 'react';
import {  funcSetDefaultValues, getDisplayUnit, getSizingFields, getUOMKey, validateMandatoryFields } from '../utils/validation';
import { useDispatch, useSelector } from 'react-redux';
import useTabPanel from './useTabPanel';
import { setActivateResults, updateNavigationValue } from '../store/slices/navigationSlice';
import { onUpdateFields, onUpdateListOfFields } from '../store/slices/workflowSlice';
import { Pressure_Popupo_Fields, Vacuum_Popup_Fields, WF_BACKEND_CONFIGURATION_FLAG } from '../utils/constants';
import useSaveSizing from './useSaveSizing';
import { setFlowRatePopupFlag, setFlowRateVacuumPopupFlag } from '../store/slices/workflowPayloadSlice';

function useFormFields(tabIndex) {
  const dispatch = useDispatch();
  const {handleSaveWorkflowData}=useSaveSizing();
  const {menus} = useSelector(state=>state.navigation);
  const {focusedFieldName} = useSelector(state=>state.generic);
  const {preferences} = useSelector(state => state.auth);
  // Initialize state as an array to hold objects for each item
  const { heading, items, displayType, selectedItem, UpdateSectionFields,handleChange, handleBlur, handleFocusedFieldName } = useTabPanel(tabIndex);
  const {units,defaultUnits,} = useSelector(state => state.uom);
  const { selectedFields,error,workflowPopup, fieldValidationResults } = useSelector(state => state.workflow);
  const { payloadData} = useSelector(state => state.workflowPayload);
  const [fieldData, setFieldData] = useState([]);
  const [currentFieldData, setCurrentFieldData] = useState([]);


useEffect(() => {
    // console.log('In useFormFields :: useEffect:::111111111111 >>>>>>>>>>> ',displayType,items,displayType === 'form')
    if (items !== undefined && items !== null && items.length > 0 && JSON.stringify(items) !== JSON.stringify(currentFieldData)){
        setCurrentFieldData(items)
    }
}, [items]);

const UpdateFieldData = (localdisplayType,localfieldData,localselectedFields,localpayloadData,localErrors,logtype='Form Type') => {
    // if (displayType === 'form' && localfieldData !== undefined && localfieldData !== null && localfieldData.length > 0 ) {
        // console.log(`Popup 1111 >>>>>>>>>>>> ${logtype} ::::: In useFormFields :: useEffect:::33333 >>>>>>>>>>> displayType: ${localdisplayType}, fieldData: ${JSON.parse(JSON.stringify(localfieldData))}, selectedFields: ${JSON.stringify(localselectedFields)}, payloadData:${JSON.stringify(localpayloadData)}, preferences: ${JSON.stringify(preferences)}`)
        // console.log(`Popup 1111 >>>>>>>>>>>> ${logtype} ::::: In useFormFields :: useEffect:::33333 >>>>>>>>>>> displayType: ${localdisplayType}, fieldData: `,localfieldData, 'selectedFields: ',localselectedFields, 'payloadData: ', localpayloadData, 'preferences: ',preferences)
        const validationResults=WF_BACKEND_CONFIGURATION_FLAG ?{...fieldValidationResults} : null;
        const updatedData=getSizingFields(localdisplayType,localfieldData,localselectedFields,localpayloadData,defaultUnits,localErrors,focusedFieldName,units,preferences,validationResults);
        // console.log(`Popup 1111 >>>>>>>>>>>> ${logtype} ::::: In useFormFields :: updatedData >>>>>>>>>>>`, updatedData)
        let uomFields=[];
        updatedData.forEach((field)=>{
   
            if(field?.type==='radio'){
                const radioKey=selectedFields.find((f1)=>f1.name===field.fieldName);
                // console.log('In useFormField >>>>>>>>>>>> ',field?.type,radioKey,field.fieldList.length)
                if(radioKey===undefined){
                    if(field?.fieldList?.length>0){
                        const localField=field.fieldList.find((f1)=> f1?.defaultValue===true);
                        // console.log('In useFormField:: check radio >>>>>>>>>>>> ',localField)
                        if(localField!==undefined){
                            const item={name:field.fieldName,value:localField.fieldName,page:"useFormFields_radio"}
                            // dispatch(onUpdatePayloadData(item));
                            uomFields.push(item);
                            dispatch(onUpdateFields(item))
                        }
                    }
                }
            }
            if(field?.type==='radioInput'){
                const radioKey=localselectedFields.find((f1)=>f1.name===field.fieldName);
                if(radioKey===undefined){
                    const item={name:field.fieldName,value:field.defaultSelected}
                    uomFields.push(item);
                    // console.log('In useFormField:: check radio >>>>>>>>>>>> ',item,uomFields)
                    dispatch(onUpdateFields(item))
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
                        dispatch(onUpdateFields({name:key,value:unitValue,page:"useFormFields_dimensionName"}))
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
                    // console.log(' In useFormField:: check UOM 222222 >>>>>>>>>>>> ',key,field?.dimensionName,field?.UomFieldName)
                    
                    const verifyKey=selectedFields.find((f1)=>f1.name===key);
                    
                    if(verifyKey===undefined || verifyKey?.value===undefined || verifyKey?.value===null || verifyKey?.value===''){
                        // const localDimension=field?.dimensionName[0];
                        displayUnit=getDisplayUnit(selectedFields);
                        // console.log('In useFormField:: check UOM >>>>>>>>>>>> ',key,verifyKey,displayUnit,field)
                        unitValue=defaultUnits[displayUnit][localDimension];
                        uomFields.push({name:key,value:unitValue,page:"useFormFields_dimensionName"})
                        dispatch(onUpdateFields({name:key,value:unitValue,page:"useFormFields_dimensionName"}))
                        // dispatch(onUpdatePayloadData({name:key,value:unitValue}))

                    }
                    // update DBUomFieldName
                    let Dbkey=field?.DbUomFieldName;
                    //console.log(' In useFormField:: check UOM >>>>>>>>>>>> ',field.fieldName, 'key', key,Dbkey,field?.UomFieldName,field?.DbUomFieldName)
                    if(Dbkey!==undefined && Dbkey!==null && Dbkey!==''){
                        const verifyKey=selectedFields.find((f1)=>f1.name===Dbkey);
                        // console.log('In useFormField:: check UOM useFormFields_dimensionNameDb >>>>>>>>>>>> ',key,verifyKey, Dbkey, unitValue)
                        if((verifyKey===undefined || verifyKey?.value===undefined || verifyKey?.value===null || verifyKey?.value==='') && unitValue!==undefined){
                            // const localDimension=field?.dimensionName[0];
                            uomFields.push({name:Dbkey,value:unitValue,page:"useFormFields_dimensionNameDb"})
                            dispatch(onUpdateFields({name:Dbkey,value:unitValue,page:"useFormFields_dimensionNameDb"}))
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
                        dispatch(onUpdateFields({name:key,value:unitValue,page:"useFormFields_dimensionName 2"}))
                        // dispatch(onUpdatePayloadData({name:key,value:unitValue}))
                    }
                }
                
                
            }else if(field?.type==='radioInput' && Array.isArray(field?.fieldList) && field?.fieldList.length>0){
                field?.fieldList.forEach((item)=>{
                    if(item?.UomFieldName!==undefined && item?.UomFieldName!==null && item?.UomFieldName!==''){
                        const verifyKey=localselectedFields.find((f1)=>f1.name===item?.UomFieldName);
                        if(verifyKey===undefined || verifyKey?.value===undefined || verifyKey?.value===null || verifyKey?.value===''){
                            const dimensionName=item?.dimensionName[0];
                            let displayUnit=getDisplayUnit(localselectedFields)
                            const unitValue=defaultUnits[displayUnit][dimensionName];
                            const localItem={name:item.UomFieldName,value:unitValue,page:"useFormFields_dimensionName 3"}
                            dispatch(onUpdateFields(localItem));
                        }
                    }
                });
                // console.log(' In useFormField:: check UOM 111111 >>>>>>>>>>>> ',field?.fieldName,field?.dimensionName,field?.UomFieldName,Array.isArray(field?.dimensionName))
            }
        })

        
        const localMenu=validateMandatoryFields(updatedData,localselectedFields,localpayloadData,menus,tabIndex);
        // console.log('NavigationValue ::::::: ',localMenu,localpayloadData['IsPressureOnly'],localpayloadData['IsVacuumOnly']);

        if(localMenu?.length>0){
            let localActivateResults=true;
            for(const menu of localMenu){
                if(menu?.name==='Vacuum Case'){
                    if(localpayloadData['IsVacuumOnly']){
                        if(menu?.isCompleted===false){
                            localActivateResults=false;
                            break;
                        }
                    }
                }else if(menu?.isCompleted===false){
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

useEffect(() => {
    
    if (displayType === 'form' && currentFieldData !== undefined && currentFieldData !== null && currentFieldData.length > 0 ) {
        const {updatedData,uomFields}=UpdateFieldData(displayType,currentFieldData,selectedFields,payloadData,error,'Form Type');
        // console.log('In useFormFields :: useEffect:::33333 >>>>>>>>>>> ',uomChangeFlag,items,updatedData)
        setFieldData(updatedData);
    }else{
        setFieldData(currentFieldData);
    }
    //, payloadData['IsVacuumOnly'], payloadData['IsPressureOnly']
}, [ currentFieldData,selectedFields,error, payloadData['IsVacuumOnly'], payloadData['IsPressureOnly']]);

const handleAPI2000ConfirmOk = () => {
    let localSelectedFields=[...selectedFields];
    let localPayloadData={...payloadData};
    // console.log('In useFormFields :: handleAPI2000ConfirmOk ::::::::::::: ')
    let tcResponse=localPayloadData['tcResponse'];
    let equationValues=tcResponse['equationValues'];

    if(payloadData['IsPressureOnly'] && payloadData['API2000WreqChangeWarningFlag']){
        workflowPopup.fields.forEach((item)=>{
            const fieldList=[...Pressure_Popupo_Fields];
            let fieldName=item.fieldName.split('|');
            if(fieldName.length>1){
                fieldName.forEach((field)=>{
                    if(fieldList.indexOf(field)!==-1){
                        fieldName=field; 
                    }
                });
            }else{
                fieldName=item.fieldName;
            }
            if(fieldList.indexOf(fieldName)!==-1){
                const defaultValue = fieldName==='Relieving' || fieldName==='Operating' || fieldName==='SystemMAWP' || fieldName==='OperatingPressure' ?localPayloadData[fieldName]:item.type==='radio'?item?.fieldList!==undefined?item?.fieldList[0]?.fieldName:item?.defaultValue:item.type==='checkbox'?item.defaultValue===''?false:item.defaultValue:typeof item.defaultValue==='object'?Array.isArray(item.defaultValue)?'':item.defaultValue.value:typeof item.defaultValue==='string'?item.defaultValue:typeof item.defaultValue==='boolean'? item.defaultValue===''?false:item.defaultValue:'';
                // console.log('Popup Change 11111 >>>>>>>>>>>> field 2222>>>>>>>>>>>>>>>>>>',item.fieldName,item.defaultValue)
                localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==fieldName);
                localSelectedFields.push({name:fieldName,value:defaultValue});
                localPayloadData[fieldName]=defaultValue;
            }
        });

        ['FlowRatePopupFlag','API2000WreqChangeWarningFlag'].forEach((item)=>{
            localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==item);
            localSelectedFields.push({name:item,value:false});
            localPayloadData[item]=false;
        });
        dispatch(setFlowRatePopupFlag(false));

        localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='API2000WreqChanged');
        localSelectedFields.push({name:'API2000WreqChanged',value:true});
        localPayloadData['API2000WreqChanged']=true;
        
        equationValues={...equationValues,CalculateRequiredFlowPressure:false};
        
    }
    if(payloadData['IsVacuumOnly'] && payloadData['API2000WreqVChangeWarningFlag']){
        workflowPopup.fields.forEach((item)=>{
            const fieldList=[...Vacuum_Popup_Fields];
            let fieldName=item.fieldName.split('|');
            if(fieldName.length>1){
                fieldName.forEach((field)=>{
                    if(fieldList.indexOf(field)!==-1){
                        fieldName=field; 
                    }
                });
            }else{
                fieldName=item.fieldName;
            }
            if(fieldList.indexOf(fieldName)!==-1){
                const defaultValue = fieldName==='Relieving' || fieldName==='Operating' || fieldName==='SystemMAWP' || fieldName==='OperatingPressure' ?localPayloadData[fieldName]:item.type==='radio'?item?.fieldList!==undefined?item?.fieldList[0]?.fieldName:item?.defaultValue:item.type==='checkbox'?item.defaultValue===''?false:item.defaultValue:typeof item.defaultValue==='object'?Array.isArray(item.defaultValue)?'':item.defaultValue.value:typeof item.defaultValue==='string'?item.defaultValue:typeof item.defaultValue==='boolean'? item.defaultValue===''?false:item.defaultValue:'';
                // console.log('Popup Change 11111 >>>>>>>>>>>> field 2222>>>>>>>>>>>>>>>>>>',item.fieldName,item.defaultValue)
                localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==fieldName);
                localSelectedFields.push({name:fieldName,value:defaultValue});
                localPayloadData[fieldName]=defaultValue;
            }
        });

        ['FlowRateVacuumPopupFlag','API2000WreqVChangeWarningFlag'].forEach((item)=>{
            localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==item);
            localSelectedFields.push({name:item,value:false});
            localPayloadData[item]=false;
        });
        dispatch(setFlowRateVacuumPopupFlag(false));

        localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='API2000WreqVChanged');
        localSelectedFields.push({name:'API2000WreqVChanged',value:true});
        localPayloadData['API2000WreqVChanged']=true;

        equationValues={...equationValues,CalculateRequiredFlowVacuum:false};
    }
    tcResponse={...tcResponse,equationValues};
    localPayloadData['tcResponse']=tcResponse;

    if(localPayloadData['PumpInRate']=='' && localPayloadData['PumpOutRate']==''){
        ['TankVolume','SurfaceArea','WettedArea'].forEach((item)=>{

            localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==item);
            localSelectedFields.push({name:item,value:''});
            localPayloadData[item]='';
        });
        
        workflowPopup.fields.forEach((item)=>{
            const fieldList=["Rin","BoilingPoint","FlashPoint", "TankHasInsulation","HeatTransferCoefficient","InsulationThickness","InsulationThermalConductivity","InsulatedSurfaceArea","OuterContSurArea","OuterContSurAreaPer","TankShape","Height_h","VesselWidth_w","LengthEndToEnd_lt","Diameter_d","Ends","LengthSeamToSeam_Ls","IsHorizontalOrientation","BottomPlate_Y","Elevation_H"]
            let fieldName=item.fieldName.split('|');
            if(fieldName.length>1){
                fieldName.forEach((field)=>{
                    if(fieldList.indexOf(field)!==-1){
                        fieldName=field; 
                    }
                });
            }else{
                fieldName=item.fieldName;
            }

            if(fieldList.indexOf(fieldName)!==-1){
                const defaultValue = fieldName==='Relieving' || fieldName==='Operating' || fieldName==='SystemMAWP' || fieldName==='OperatingPressure' ?localPayloadData[fieldName]:item.type==='radio'?item?.fieldList!==undefined?item?.fieldList[0]?.fieldName:item?.defaultValue:item.type==='checkbox'?item.defaultValue===''?false:item.defaultValue:typeof item.defaultValue==='object'?Array.isArray(item.defaultValue)?'':item.defaultValue.value:typeof item.defaultValue==='string'?item.defaultValue:typeof item.defaultValue==='boolean'? item.defaultValue===''?false:item.defaultValue:'';
                // console.log('Popup Change 11111 >>>>>>>>>>>> field 2222>>>>>>>>>>>>>>>>>>',item.fieldName,item.defaultValue)
                localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==fieldName);
                localSelectedFields.push({name:fieldName,value:defaultValue});
                localPayloadData[fieldName]=defaultValue;
            }
        });

    }
    const storeObj={selectedFields:localSelectedFields,payloadData:localPayloadData};
    dispatch(onUpdateListOfFields(storeObj));
    handleSaveWorkflowData(1,storeObj);
}

const handleAPI2000ConfirmCancel = () => {
    let localSelectedFields=[...selectedFields];
    let localPayloadData={...payloadData};

    // if(localPayloadData['PopupValueChange']){
    //     workflowPopup.fields.forEach((item)=>{
            
    //         const defaultValue = item.fieldName==='Relieving' || item.fieldName==='Operating' || item.fieldName==='SystemMAWP' || item.fieldName==='OperatingPressure' ?localPayloadData[item.fieldName]:item.type==='radio'?item?.fieldList!==undefined?item?.fieldList[0]?.fieldName:item?.defaultValue:item.type==='checkbox'?item.defaultValue===''?false:item.defaultValue:typeof item.defaultValue==='object'?Array.isArray(item.defaultValue)?'':item.defaultValue.value:typeof item.defaultValue==='string'?item.defaultValue:typeof item.defaultValue==='boolean'? item.defaultValue===''?false:item.defaultValue:'';
    //         // console.log('Popup Change 11111 >>>>>>>>>>>> field 2222>>>>>>>>>>>>>>>>>>',item.fieldName,item.defaultValue)
    //         localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==item.fieldName);
    //         localSelectedFields.push({name:item.fieldName,value:defaultValue});
    //         localPayloadData[item.fieldName]=defaultValue;
            
    //     });
    // }

    if(payloadData['IsPressureOnly']){
        localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='Wreq');
        localSelectedFields.push({name:'Wreq',value:payloadData['Wreq1']});
        localPayloadData['Wreq']=payloadData['Wreq1'];
  
        localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='API2000WreqChangeWarningFlag');
        localSelectedFields.push({name:'API2000WreqChangeWarningFlag',value:false});
        localPayloadData['API2000WreqChangeWarningFlag']=false;
      }
      if(payloadData['IsVacuumOnly']){
        localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='WreqV');
        localSelectedFields.push({name:'WreqV',value:payloadData['WreqV1']});
        localPayloadData['WreqV']=payloadData['WreqV1'];
  
        localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='API2000WreqVChangeWarningFlag');
        localSelectedFields.push({name:'API2000WreqVChangeWarningFlag',value:false});
        localPayloadData['API2000WreqVChangeWarningFlag']=false;
      }
    dispatch(onUpdateListOfFields({selectedFields:localSelectedFields,payloadData:localPayloadData}));
}

  // Return state values and setters
  return {
    heading,
    fieldData,
    displayType,
    selectedItem, 
    focusedFieldName,
    UpdateFieldData,
    UpdateSectionFields,
    handleChange,
    handleBlur,
    handleFocusedFieldName,
    handleAPI2000ConfirmOk,
    handleAPI2000ConfirmCancel
    };
}

export default useFormFields;