import { useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onUpdateFields, onUpdateError, fieldCalculationAPI,  fieldCalculation_ExecFunction, onUpdateListOfFields, fieldCalculation_ExecAPI, fieldValidationAPI, fieldConvertUomAPI } from "../store/slices/workflowSlice";

import {  ApiExecRequiredFields, filterDimensionUnits, funcExecRequiredFields,  getTargetFields } from "../utils/validation";
import {  setFocusedFieldName } from "../store/slices/genericSlice";
import { DIMENSION_SEPARATOR, FIELD_SPLITTER} from "../utils/constants";
import useTabUpdateUomValues from "./useTabUpdateUomValues";
import { setOnBlurPayloadData } from "../store/slices/workflowPayloadSlice";

const usePopupPanel = (tabIndex) => {
    const dispatch = useDispatch();
    const {focusedFieldName} = useSelector(state=>state.generic);
    const { preferences,userData } = useSelector(state => state.auth);
    // const {menus} = useSelector(state=>state.navigation);
    const {selectedFields, selectedFluidType, workflowSections,workflowPopup, error, selectedWorkflow, fieldValidationResults } = useSelector(state => state.workflow);
    const { payloadData,onBlurPayloadData } = useSelector(state => state.workflowPayload);
    const { units,defaultUnits } = useSelector(state => state.uom);
    const { fluids } = useSelector(state => state.generic);
    const {updateUomValue}=useTabUpdateUomValues();

    // --- Phase 2: Stable handler refs ---
    // Refs hold the latest function body (re-assigned each render inside the if-block).
    // The useCallback wrappers have empty deps so their reference NEVER changes,
    // making React.memo on API2000Popup effective without stale-closure risk.
    const handleChangeRef = useRef(() => {});
    const handleBlurRef  = useRef(() => {});
    // Recursion depth guard: prevents defaultValue chains from causing runaway recursion
    // (e.g., field A's defaultValue triggers field B which triggers field A back again).
    const _changeDepthRef = useRef(0);
    const MAX_CHANGE_DEPTH = 5;

    // Phase 6: latest-value refs — re-assigned on every render so async .then()
    // callbacks always read current store data, not stale dispatch-time snapshots.
    // Previously, closures in async handlers (Exec_Function, Exec_API, etc.) captured
    // payloadData/selectedFields at dispatch time; by response time those values could
    // be outdated, causing onUpdateListOfFields to overwrite newer state with old data.
    const latestPayloadDataRef    = useRef(payloadData);
    const latestSelectedFieldsRef = useRef(selectedFields);
    latestPayloadDataRef.current    = payloadData;
    latestSelectedFieldsRef.current = selectedFields;

    const handleChange = useCallback((...args) => handleChangeRef.current(...args), []);
    const handleBlur   = useCallback((...args) => handleBlurRef.current(...args), []);
    const handleFocusedFieldName = useCallback((fieldName) => {
        dispatch(setFocusedFieldName(fieldName));
    }, [dispatch]);
    // ------------------------------------

    const UpdateSectionFields=(section)=>{
        
        const updatedSection=section?.fields?.map((field)=>{
            // console.log('In usePanel Panel:::::: field?.dimensionName 1111111 >>>>>>> ',units,field?.dimensionName,units[field?.dimensionName],field?.fieldName,field?.dimensionName!==undefined && field?.dimensionName!==null && field?.dimensionName!=='',field?.fieldName?.indexOf('FluidName'),(Array.isArray(field?.fieldName) && field?.fieldName?.indexOf('FluidName')!==-1)|| field?.fieldName==='FluidName' || field?.fieldName?.indexOf('FluidName') !==-1)
            if(field?.dimensionName!==undefined && field?.dimensionName!==null && field?.dimensionName!==''){
                // // console.log(' >>>>>>>> ',field?.dimensionName,typeof field?.dimensionName)
                let options=[]
                let systemUnit=selectedFields.find((item)=>item.name==='DisplayUnitSystem');
                systemUnit=systemUnit!==undefined?systemUnit?.value:'All';
                // console.log(' >>>>>>>> ',field?.dimensionName,systemUnit)
                if(typeof field?.dimensionName==='object'){
                    field?.dimensionName.forEach((item)=>{
                        const localUnits=units[item];
                        let localOptions=[]
                        if(localUnits!==undefined){
                            
                            localUnits?.forEach((unit)=>{
                                // console.log(' In Display UnitSystem options :: 11111 >>>>>>>>>. ',unit.SystemUnit===systemUnit,unit.SystemUnit,systemUnit)
                                if(unit.SystemUnit===systemUnit || systemUnit==='All'){
                                    localOptions.push({label:unit.UnitName,value:unit.UnitKey,...unit})
                                }
                            })
                            // console.log(' In Display UnitSystem options :: 33333 >>>>>>>>>. ',localOptions)
                            localOptions.sort((a, b) => {
                                // Compare dimensionName first
                                return a?.UnitName.localeCompare(b?.UnitName, undefined, { sensitivity: 'base' });
                                });
                        }else{
                            localOptions.push({label:item,value:item})
                        }
                        
                        options=options?.length>0?[...options,{label:DIMENSION_SEPARATOR,value:item},...localOptions]:[...options,...localOptions]
                    })
                }else{
                    const localUnits=units[field?.dimensionName];
                    options=localUnits?.map((unit)=>{
                        return {label:unit.UnitName,value:unit.UnitKey,...unit}
                    })
                    // console.log(' In Display UnitSystem options :: 33333 >>>>>>>>>. ',options)
                    options.sort((a, b) => {
                        return a?.UnitName.localeCompare(b?.UnitName, undefined, { sensitivity: 'base' });
                        });

                    //   console.log(' In Display UnitSystem options :: 444444 >>>>>>>>>. ',options)
                }

                return {
                    ...field,
                    options:options
                }
            }else if((Array.isArray(field?.fieldName) && field?.fieldName?.indexOf('FluidName')!==-1)|| field?.fieldName==='FluidName' || field?.fieldName?.indexOf('FluidName') !==-1){
                let options=[]
                // console.log('In use TabPanel:::::: field?.fieldName 22222 >>>>>>> ',units,field?.fieldName,field?.label)
                const localfluids=fluids[selectedFluidType?.id.toString()];
                
                options=localfluids?.item?.map((it)=>{
                    return {label:it.Name,value:it.Name,...it}
                })

                return {
                    ...field,
                    options:options
                }
            }else{
                return field
            }
        });

        let displayItems = updatedSection.reduce((acc, field) => {
            if (field.fieldGroupType !== undefined) {
                const key = `${field.fieldGroupType}-${field.fieldGroupName}`;
                if (!acc[key]) {
                    acc[key] = {
                        
                        fieldName: field.fieldGroupName,
                        type: field?.type,
                        defaultValue: field.defaultValue,
                        disabled: field.disabled,
                        visible: field?.visible,
                        hideFromSideBar: field?.hideFromSideBar,
                        isValidationRequired:field.isValidationRequired,
                        validateActionType:field.validateActionType,
                        defaultUOM: field.defaultUOM,
                        infoText: "",
                        grid: field?.grid,
                        gridDirection: field?.gridDirection ?? field?.style?.gridDirection,  
                        gridTemplateColumns: field?.gridTemplateColumns ?? field?.style?.gridTemplateColumns,     
                        gridSection: field?.gridSection,                             
                        fieldList: [],
                        fieldGroupType: field.fieldGroupType,
                        fieldGroupLabel: field.fieldGroupLabel,
                        defaultSelected: field.defaultSelected,
                        onBlurAction: field?.onBlurAction,
                        popupFields: field?.popupFields,
                        onchangevalidation: field?.onchangevalidation,
                        mirrorId: field?.mirrorId,
                        calculateFields: field?.calculateFields,
                        UomFieldName:field?.uomFieldName ?? field?.UomFieldName
                    };
                }
                let fieldName=field?.fieldName?.split(FIELD_SPLITTER);
                let value={};
                let fieldGroup=''
                
                if(fieldName.length>1){
                    fieldName.forEach((item)=>{
                        if(item!==undefined && item!==''){
                            value[item]=payloadData[item]
                        }
                        fieldGroup+=`${item}`
                    })
                }else{
                    value=field.fieldName;
                    fieldName=field.fieldName
                    fieldGroup=field.fieldName
                }
                // console.log('In useTabPanel ::: fieldGroup >>>>>>> ',fieldGroup,fieldName,value)
                acc[key].fieldList.push({
                    ...field,
                    fieldGroup:fieldGroup,
                    fieldName:fieldName,
                    value: field.fieldName,
                    selectedValue: field?.fieldName,
                    inputValue: field?.inputValue,
                    inputLabel: field.label,  
                    UomFieldName:field?.uomFieldName ?? field?.UomFieldName                      
                    });
            }else if (field.type === 'select') {
                acc[field.fieldName] = {
                    ...field,
                    value: field.defaultValue,
                    UomFieldName:field?.uomFieldName ?? field?.UomFieldName
                };
            } else {
                acc[field.fieldName] = {
                    ...field,
                    UomFieldName:field?.uomFieldName ?? field?.UomFieldName
                };
            }
            return acc;
        }, {});                    
        displayItems = Object.values(displayItems);
        // console.log('Items >>>>>>> ',displayItems)
        return {
            heading: section.sectionLabel,
            items: displayItems,
            displayType: section.displayType
        }
        
    }

    // Phase 3: Extract DisplayUnitSystem as a fine-grained dep.
    // UpdateSectionFields only reads selectedFields for DisplayUnitSystem,
    // so this scalar avoids recomputing the whole section on every blur/field update.
    const displayUnitSystem = useMemo(
        () => selectedFields.find(f => f.name === 'DisplayUnitSystem')?.value ?? 'All',
        [selectedFields]
    );

    // Phase 3: Memoize the section-building result.
    // UpdateSectionFields does NOT read fieldValidationResults, so validation API
    // responses no longer trigger a full section rebuild + getSizingFields cascade.
    // Deps cover everything UpdateSectionFields actually reads from the outer scope:
    //   workflowPopup (field definitions), displayUnitSystem, units (UOM option lists),
    //   fluids/selectedFluidType (fluid dropdowns).
    // NOTE: payloadData is intentionally excluded. UpdateSectionFields uses payloadData
    // only to seed fieldGroupType initial values, but getSizingFields always overwrites
    // those from selectedFields/payloadData — so stale seeds cause no display issue.
    // Including payloadData here caused UpdateSectionFields to rerun after every
    // CalculatePressureAPI2000 result dispatch (onUpdateListOfFields), triggering a
    // full getSizingFields cascade on every blur — the main cause of the 5-min freeze.
    const activeTabMenu = useMemo(() => {
        if (workflowPopup?.fields?.length) {
            return UpdateSectionFields(workflowPopup);
        }
        return {};
    // UpdateSectionFields closes over the same values listed in deps above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowPopup, displayUnitSystem, units, fluids, selectedFluidType]);

    let selectedItem;
    let nextIndex;

    // switch(9) {
        
    //     default:
    if(workflowPopup !==undefined && Object?.keys(workflowPopup)?.length>0){
        if (workflowPopup?.fields?.length) {
            const updateValueInStore = (item) => {
                // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000:: update ValueInStore 111111>>>>>>>> ',item,selectedFields,payloadData)
                if(item?.name!=='%'){
                    dispatch(onUpdateFields({...item,page:"use PopupPanel"}));
                }
            }
            handleBlurRef.current = (item) => {
                // console.log('On Blur >>>>>>>>>>>> 444444 ',item
                //     ,selectedFields,payloadData,onBlurPayloadData[item.name]
                // )
                if(item?.validatefield && onBlurPayloadData[item.name]===item.value){
                    return;
                }
                dispatch(setFocusedFieldName(""));
                updateValueInStore(item);
                
                dispatch(setOnBlurPayloadData(
                    {
                        ...onBlurPayloadData,
                        [item.name]:item.value
                    }
                ));
                const sectionFields = {...workflowPopup};

                if(item?.validatefield){
                    const disabledFields=fieldValidationResults?.disabledFields ?? {};
                    const mandatoryFields=fieldValidationResults?.mandatoryFields ?? {};
                    const visibleFields=fieldValidationResults?.visibleFields ?? {};
                    const hideFromSideBarFields=fieldValidationResults?.hideFromSideBarFields ?? {};
                    const data={
                                currentField:{FieldName:item.name,FieldValue:item.value,FieldId:item?.fieldId,actionId:item?.actionId,isFieldActionRequired:item?.isFieldActionRequired},
                                inputs:{...payloadData,[item.name]:item.value,userId:userData?.EmailId,workflowId:selectedWorkflow,sectionId:item?.sectionId},
                                error,
                                disabledFields,
                                mandatoryFields,
                                visibleFields,
                                hideFromSideBarFields
                            }
                    const config={url:'/validate',method:'POST',data}
                    dispatch(fieldValidationAPI(config)).then((response)=>{
                        // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>> Validation done successfully ');
                    });
                }else{

                    const calculatedFields= getTargetFields(sectionFields.fields,'calculateFields',item.name,item.value,selectedFields,payloadData, units,null,focusedFieldName,"useTabPanel_OnBlur",preferences,defaultUnits);
                    // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >> calculatedFields:: 222222 >>>>>>>>>>> ',sectionFields.fields,item.name,item.value,calculatedFields)
                    if(calculatedFields?.length>0){
                        calculatedFields.forEach((field)=>{
                            // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >> config >>>>>>>>>>> ',field,field?.ruleType)
                            if(field?.ruleType==='API_FUNCTION_CALL'){
                                const config={...field?.value,TemperatureUOM:preferences?.SystemTemperature,checkSuperCritical:field?.checkSuperCritical}
                                dispatch(fieldCalculationAPI(config)).then((response)=>{
                                    // console.log('API_FUNCTION_CALL: Response >>>>>>>>>>>>>>>> ',response,selectedFields,payloadData)
                                    let newPayloadData={...latestPayloadDataRef.current}
                                    const newSelectFields=latestSelectedFieldsRef.current.map((field)=>{
                                        if(["Relieving","SaturatedSteam","TemperatureUOM"].includes(field.name)){
                                            // console.log('API_FUNCTION_CALL: Response 111>>>>>>>>>>>>>>>> ',field.name,field.value)
                                            let newValue;
                                            if(field.name==='TemperatureUOM'){
                                                newValue=response.payload?.config?.data?.TemperatureUOM;
                                                let tempUOMFlag=newValue==="" || newValue===null || newValue===undefined?false:true;
                                                if(!tempUOMFlag){
                                                    newValue=response.payload?.config?.TemperatureUOM;
                                                }
                                            }else{
                                                newValue=response.payload.response.data.SaturatedSteam;
                                                newValue=newValue===null?field?.name!=='Relieving'?'':field?.value===null|| field.value===undefined?'':field.value:newValue
                                            }// console.log('API_FUNCTION_CALL: Response 222>>>>>>>>>>>>>>>> ',field.name,field.value,newValue)
                                            newPayloadData[field.name]=newValue; //{...newPayloadData[field.name],value:newValue}
                                            return {...field,value:newValue}
                                        }
                                        return field;
                                    })
                                    // console.log('API_FUNCTION_CALL: Response >>>>>>>>>>>>>>>> 22222',newSelectFields,newPayloadData)
                                    
                                        const validationFields= getTargetFields(sectionFields.fields,'validations',item.name,item.value,newSelectFields,newPayloadData, units, error,focusedFieldName,"useTabPanel_OnBlur",null,defaultUnits);
                                        // console.log('On Blur ::::  validations 11111>>>>>>> ',focusedFieldName,validationFields)
                                        if(validationFields.length>0){
                                            let localErrors=[...validationFields]
                                            dispatch(onUpdateError(localErrors));
                                        }else{
                                            dispatch(onUpdateError(null))
                                        }
                                    // }
                                })
                            }else if(field?.ruleType==='Exec_Function'){
                                
                                let config=funcExecRequiredFields(field?.value,payloadData,preferences,units,defaultUnits,item);
                                config={...config,funcCallingField:field?.name}
                                // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000:: field 111111 >>>>>>>>>>> ' ,config)
                                dispatch(fieldCalculation_ExecFunction(config))
                                .then((response)=>{
                                    let localPayloadData={...latestPayloadDataRef.current}
                                    let localSelectedFields=[...latestSelectedFieldsRef.current]
                                    let resultFields=response.payload;
                                    // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 field 14 14 14 14 >>>>>>>>>>> ',resultFields,payloadData)
                                    if(resultFields!==undefined && resultFields!==null && Object.keys(resultFields).length>0){
                                        // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >>>>>>>>>> 15 15 15 15 >>>> ',resultFields)
                                        Object.keys(resultFields).forEach((key)=>{
                                            if(key!=='Error'){
                                                localPayloadData[key]=resultFields[key];
                                                localSelectedFields=localSelectedFields.filter((field)=>field.name!==key);
                                                localSelectedFields.push({name:key,value:resultFields[key]});
                                                // localSelectedFields=localSelectedFields.map((field)=>{
                                                //     if(field.name===key){
                                                //         return {...field,value:resultFields[key]}
                                                //     }
                                                //     return field;
                                                // })
                                            }
                                        });
                                        const storeObj={selectedFields:localSelectedFields,payloadData:localPayloadData};
                                        // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >>>>>>>>>>storeObj 11111 >>>  ',storeObj?.payloadData,storeObj?.selectedFields?.filter((field)=>field.name==='tcResponse'))
                                        dispatch(onUpdateListOfFields(storeObj));
                                    }
                                    const validationFields= getTargetFields(sectionFields.fields,'validations',item.name,item.value,localSelectedFields,localPayloadData, units, error,focusedFieldName,"useTabPanel_OnBlur",null,defaultUnits);
                                    // console.log('On Blur ::::  validations 11111>>>>>>> ',focusedFieldName,validationFields,response,localSelectedFields,localPayloadData)
                                    if(validationFields.length>0){
                                        let localErrors=[...validationFields]
                                        dispatch(onUpdateError(localErrors));
                                    }else{
                                        dispatch(onUpdateError(null))
                                    }
                                })
                            }else if(field?.ruleType==='SAVE_CALCULATED_VALUES'){
                                let localPayloadData={...payloadData}
                                let localSelectedFields=[...selectedFields]
                                let resultFields=field.value;
                                Object.keys(resultFields).forEach((key)=>{
                                    if(key!=='Error'){
                                        localPayloadData[key]=resultFields[key];
                                        localSelectedFields=localSelectedFields.filter((field)=>field.name!==key);
                                                localSelectedFields.push({name:key,value:resultFields[key]});
                                        // localSelectedFields=localSelectedFields.map((field)=>{
                                        //     if(field.name===key){
                                        //         return {...field,value:resultFields[key]}
                                        //     }
                                        //     return field;
                                        // })
                                    }
                                });
                                const storeObj={selectedFields:localSelectedFields,payloadData:localPayloadData};
                                // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >>>>>>>>>>storeObj 22222>>>  ',JSON.stringify(storeObj ))
                                dispatch(onUpdateListOfFields(storeObj));
                            }else if(field?.ruleType==='Exec_API'){
                                                            // console.log('In useTabPanel:::calculatedFields:: field 111111 >>>>>>>>>>> ',field)
                                let config=ApiExecRequiredFields(field?.value,payloadData,preferences,units,defaultUnits,item);
                                let data={...config?.data};
                                data={...data,apiCallingField:field?.name,userId:userData?.EmailId}
                                config={...config,data}
                                                            // console.log(' In field field Calculation_ExecAPI >>>> field 111111 >>>>>>>>>>> ',config)
                                dispatch(fieldCalculation_ExecAPI(config))
                                .then((response)=>{
                                    // console.log('In useTabPanel:::calculatedFields:: field 33333 >>>>>>>>>>> ',response)
                                    let localPayloadData={...latestPayloadDataRef.current}
                                    let localSelectedFields=[...latestSelectedFieldsRef.current]
                                    let resultFields=response.payload;
                                    // console.log('In useTabPanel: config>>>>>>>>>>resultFields ',resultFields, config)
                                    Object.keys(resultFields).forEach((key)=>{
                                        if(key!=='Error'){
                                            localPayloadData[key]=resultFields[key]
                                            localSelectedFields=localSelectedFields.map((field)=>{
                                                if(field.name===key){
                                                    return {...field,value:resultFields[key]}
                                                }
                                                return field;
                                            })
                                        }
                                    })
                                    const validationFields= getTargetFields(sectionFields.fields,'validations',item.name,item.value,localSelectedFields,localPayloadData, units, error,focusedFieldName,"useTabPanel_OnBlur",null,defaultUnits);
                                    // console.log('On Blur ::::  validations 11111>>>>>>> ',focusedFieldName,validationFields,response,localSelectedFields,localPayloadData)
                                    if(validationFields.length>0){
                                        let localErrors=[...validationFields]
                                        dispatch(onUpdateError(localErrors));
                                    }else{
                                        dispatch(onUpdateError(null))
                                    }
                                })
                                                        
                            }else{
                                
                                    const validationFields= getTargetFields(sectionFields.fields,'validations',item.name,item.value,selectedFields,payloadData, units, error,focusedFieldName,"useTabPanel_OnBlur",null,defaultUnits);
                                    // console.log('On Blur ::::  validations 11111>>>>>>> ',focusedFieldName,validationFields)
                                    if(validationFields.length>0){
                                        let localErrors=[...validationFields]
                                        dispatch(onUpdateError(localErrors));
                                    }else{
                                        dispatch(onUpdateError(null))
                                    }
                                // }
                            }
                            
                        });
                    }else{
                            const validationFields= getTargetFields(sectionFields.fields,'validations',item.name,item.value,selectedFields,payloadData, units, error,focusedFieldName,"useTabPanel_OnBlur",null,defaultUnits);
                            // console.log('On Blur ::::  validations 11111>>>>>>> ',focusedFieldName,validationFields)
                            if(validationFields.length>0){
                                let localErrors=[...validationFields]
                                dispatch(onUpdateError(localErrors));
                            }else{
                                dispatch(onUpdateError(null))
                            }
                        // }
                    }
                }

                
                
            }
            handleChangeRef.current = (item) => {
                let localItem = {...item};
                let defaultValueFields=[];

                // console.log('selectedValue >>>>>>>>>>>>>>>>>>> In handleChange >>>> In use PopupPanel::: Calculation :: Popup Change 11111 >>>>>>>>>>>> handle Popup Change 111111>>>>>>>> ',item)
                let copyFlag=false;
                let localSelectedFields=[...selectedFields]
                let localPayloadData={...payloadData};
                
                if(localPayloadData['PopupValueChange']===undefined || localPayloadData['PopupValueChange']===null || localPayloadData['PopupValueChange']===false){
                    updateValueInStore({name:'PopupValueChange',value:true})
                };

                const wfSectionFields = [...workflowSections];
                const sectionFields = {...workflowPopup};
                let uomFieldFlag=false;
                // let newUOMChangeFlag=item?.type==='UOM_DD' && item?.uomAPIConversion?true:false;
                // if(payloadData['UomFieldName']!==''){
                //     updateValueInStore({name:'UomFieldName',value:''})
                // }

                if(item?.validatefield){
                    const disabledFields=fieldValidationResults?.disabledFields ?? {};
                    const mandatoryFields=fieldValidationResults?.mandatoryFields ?? {};
                    const visibleFields=fieldValidationResults?.visibleFields ?? {};
                    const hideFromSideBarFields=fieldValidationResults?.hideFromSideBarFields ?? {};
                    const data={
                                currentField:{FieldName:item.name,FieldValue:item.value,FieldId:item?.fieldId,actionId:item?.actionId,isFieldActionRequired:item?.isFieldActionRequired},
                                inputs:{...payloadData,[item.name]:item.value,userId:userData?.EmailId,workflowId:selectedWorkflow,sectionId:item?.sectionId},
                                error,
                                disabledFields,
                                mandatoryFields,
                                visibleFields,
                                hideFromSideBarFields
                            }
                    const config={url:'/validate',method:'POST',data}
                    dispatch(fieldValidationAPI(config)).then((response)=>{
                        // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>> Validation done successfully ');
                    });

                }else{

                    localSelectedFields=localSelectedFields.filter((field)=>field.name!==item.name);
                    localSelectedFields.push({name:item.name,value:item.value})
                    localPayloadData[item.name]=item.value;

                    if(item?.type==='UOM_DD'){
                        uomFieldFlag=true;
                        const oldUomValue=payloadData[item.name];
                        // console.log('In use PopupPanel::: Calculation :: Popup Change 22222 >>>>>>>>>>>> handle Popup Change 111111>>>>>>>> ',oldUomValue,wfSectionFields)
                        // dispatch(onUpdateFields({name:`prev${item.name}`,value:oldUomValue,page:"updateFieldUOM 1"}));
                        updateValueInStore({name:`prev${item.name}`,value:oldUomValue})
                        if(item.name!=='LengthUOM' && item.name!=='FlowCapacityUOM' && item.name!=='AreaUOM'){
                            // console.log('In use PopupPanel::: Calculation :: Popup Change 33333 >>>>>>>>>>>> handle Popup Change 111111>>>>>>>> ',oldUomValue)
                            sectionFields.fields.forEach((field)=>{
                                if(field?.UomFieldName===item.name){
                                    if(field?.DbUomFieldName!==undefined && field?.DbUomFieldName!==null && field?.DbUomFieldName!==''){
                                        updateValueInStore({name:field?.DbUomFieldName,value:item.value})
                                        localSelectedFields=localSelectedFields.filter((field)=>field.name!==field?.DbUomFieldName);
                                        localSelectedFields.push({name:field?.DbUomFieldName,value:item.value})
                                        localPayloadData={
                                            ...localPayloadData,
                                            [field?.DbUomFieldName]:item.value
                                        }
                                    }
                                    
                                    
                                }
                            });
                            wfSectionFields.forEach((secField)=>{
                                const localSecfield=secField.fields;
                                // console.log('In use PopupPanel::: Calculation :: Popup Change 44444 >>>>>>>>>>>> handle Popup Change 111111>>>>>>>> ',oldUomValue,localSecfield)
                                localSecfield.forEach((field)=>{
                                    // console.log('In use PopupPanel::: Calculation :: Popup Change 5555 >>>>>>>>>>>> handle Popup Change 111111>>>>>>>> ',field?.fieldName,localPayloadData[field?.fieldName],field?.UomFieldName===item.name,field?.UomFieldName,item.name)
                                    if(field?.UomFieldName===item.name){
                                        const localValue=localPayloadData[field?.fieldName];
                                        const dimensionName=field?.dimensionName;
                                        if(dimensionName[0]!=="%" && ['inputUom','radioInput','inputUominfo'].includes(field?.type)){
                                            let dimensionUnits=[]
                                            if(Array.isArray(dimensionName)){
                                                dimensionName.forEach((item)=>{
                                                    const dimensionUnit=units[item];
                                                    dimensionUnits=[...dimensionUnits,...dimensionUnit]
                                                })
                                            }else{
                                                dimensionUnits=units[dimensionName];
                                            }
                                            let oldUom=localPayloadData[field?.UomFieldName];
                                            // console.log('In use PopupPanel::: Calculation ::In filterDimensionUnits >>>>>>>>>>>> 111111 >>>>>>>>>>>>> ',dimensionName,localValue,field?.UomFieldName,oldUom,item.value,oldUomValue,dimensionUnits)
                                            oldUom=dimensionUnits?.find(unit => unit.UnitKey===oldUomValue);
                                            let newUom=item.value;
                                            newUom=dimensionUnits?.find(unit => unit.UnitKey===newUom);
                                            const VacuumFlag=field?.fieldName==='SetVacuum' || field?.fieldName==='UnderPressure' || field?.fieldName==='WreqV' || field?.fieldName.indexOf('Vacuum')!==-1?true:false;
                                            // console.log('In use PopupPanel::: Calculation ::In filterDimensionUnits >>>>>>>>>>>> 222222 >>>>>>>>>>>>> ',localValue,oldUom,newUom,units,localPayloadData,VacuumFlag,isNaN(localValue),localValue==='' || localValue===null || localValue===undefined)
                                            let newValue= localValue==='' || localValue===null || localValue===undefined?newValue:
                                            // console.log('In use PopupPanel::: Calculation ::In filterDimensionUnits >>>>>>>>>>>> 333333 >>>>>>>>>>>>> ',newValue)
                                            updateValueInStore({name:field?.fieldName,value:newValue});
                                        }
                                    }
                                })
                            });
                        }else{
                            updateValueInStore({name:item.name,value:item.value})
                        }
                        // dispatch(onUpdateListOfFields({selectedFields:localSelectedFields,payloadData:localPayloadData}))
                    }

                    if(item?.action!==undefined && item?.action?.type.toLowerCase()==='copy'){
                        // console.log('in useTabPanel:: handleChange:: Copy Action >>>>>>> ',localItem)
                        copyFlag=true;
                        updateValueInStore({name:"AlwaysUseTsat",value:true});
                        localSelectedFields=localSelectedFields.filter((field)=>field.name!=="AlwaysUseTsat");
                        localSelectedFields.push({name:"AlwaysUseTsat",value:true});
                        localPayloadData["AlwaysUseTsat"]=true;

                        const field=selectedFields.find((it)=>it.name===localItem?.targetField);
                        localItem={name:localItem.currentField,value:field.value,mandatory:localItem?.mandatory}
                        updateValueInStore(localItem)
                        localSelectedFields=localSelectedFields.filter((field)=>field.name!==localItem.name);
                        localSelectedFields.push({name:localItem.name,value:localItem.value})
                        localPayloadData[localItem.name]=localItem.value;
                        
                    }else if(!uomFieldFlag){
                        updateValueInStore(localItem);
                    }
                    
                    // dispatch(onUpdateListOfFields({selectedFields:localSelectedFields,payloadData:localPayloadData}));

                    defaultValueFields= getTargetFields(sectionFields.fields,'defaultValue',localItem.name,localItem.value,localSelectedFields,localPayloadData, units,null,focusedFieldName,'useTabPanel',preferences,defaultUnits);
                    // console.log('In useTabPanel :: defaultValueFields >>>>>>> ',defaultValueFields,localItem)
                    defaultValueFields.forEach((field)=>{
                        // console.log('In use PopupPanel::: defaultValueFields >>>>>>>>>>> ',field)
                        if(field?.nextRound!==undefined && field?.nextRound!==null && field?.nextRound!=='' && !field?.nextRound){
                            if(typeof field.value==='object'){
                                const localValue=field.value[field.name];
                                if(localValue!==undefined && localValue!=='' && localValue!==null){
                                    const localItem2={name:field.name,value:localValue}
                                    updateValueInStore(localItem2)
                                }
                            }else{
                                updateValueInStore({name:field.name,value:field.value})
                            }
                            
                        }else{
                            // Recursion guard: cap defaultValue chain depth to prevent runaway
                            // mutual recursion (e.g., field A's default triggers field B which
                            // triggers field A again). Legitimate chains are ≤ 3-4 levels.
                            if (_changeDepthRef.current < MAX_CHANGE_DEPTH) {
                                _changeDepthRef.current++;
                                try {
                                    handleChange({name:field.name,value:field.value});
                                } finally {
                                    _changeDepthRef.current--;
                                }
                            }
                        }
                    });

                    
                    const calculatedFields= getTargetFields(sectionFields.fields,'calculateFields',localItem.name,localItem.value,localSelectedFields,localPayloadData, units,null,focusedFieldName,"useTabPanel_OnChange",preferences,defaultUnits);
                    // console.log('In use PopupPanel:::handle Change :::: calculatedFields 00000 >>>>>>>>>>> ',calculatedFields,localSelectedFields,localPayloadData)
                    if(calculatedFields?.length>0){
                        calculatedFields.forEach((field)=>{
                            if(field?.ruleType==='COPY_FIELD_DATA'){
                                field?.rule?.parametersObjects.forEach((param)=>{
                                    const localValue=payloadData[param.from]
                                    if(localValue!==undefined  && localValue!=='' && localValue!==null){
                                        const localItem2={name:param.to,value:localValue}
                                        updateValueInStore(localItem2)
                                    }
                                });

                                
                            }else if(copyFlag && field?.ruleType==='API_FUNCTION_CALL'){
                                const config={...field?.value,TemperatureUOM:preferences?.SystemTemperature,checkSuperCritical:field?.checkSuperCritical}
                                dispatch(fieldCalculationAPI(config)).then((response)=>{
                                    // console.log('API_FUNCTION_CALL: Response >>>>>>>>>>>>>>>> ',response,selectedFields,payloadData)
                                    let newPayloadData={...payloadData}
                                    localSelectedFields=localSelectedFields.map((field)=>{
                                        if(["Relieving","SaturatedSteam","TemperatureUOM"].includes(field.name)){
                                            // console.log('API_FUNCTION_CALL: Response 111>>>>>>>>>>>>>>>> ',field.name,field.value)
                                            let newValue;
                                            if(field.name==='TemperatureUOM'){
                                                newValue=response.payload?.config?.data?.TemperatureUOM;
                                                let tempUOMFlag=newValue==="" || newValue===null || newValue===undefined?false:true;
                                                if(!tempUOMFlag){
                                                    newValue=response.payload?.config?.TemperatureUOM;
                                                }
                                            }else{
                                                newValue=response.payload.response.data.SaturatedSteam;
                                                newValue=newValue===null?field?.name!=='Relieving'?'':field?.value===null|| field.value===undefined?'':field.value:newValue
                                            }
                                            // console.log('handle Change :::: API_FUNCTION_CALL: Response 222>>>>>>>>>>>>>>>> ',field.name,field.value,newValue)
                                            localPayloadData[field.name]=newValue; //{...newPayloadData[field.name],value:newValue}
                                            return {...field,value:newValue}
                                        }
                                        return field;
                                    })
                                    // console.log('handle Change :::: API_FUNCTION_CALL: Response >>>>>>>>>>>>>>>> 22222',response,newSelectFields,newPayloadData)
                                    
                                })
                            }else if(field?.ruleType==='Exec_Function_OnChange'){
                                let config=funcExecRequiredFields(field?.value,payloadData,preferences,units,defaultUnits,item);
                                config={...config,funcCallingField:field?.name}
                                // console.log('In use PopupPanel::: Calculation :: 111111 ::calculatedFields:: field 222222222222 >>>>>>>>>>> ' ,config)
                                dispatch(fieldCalculation_ExecFunction(config))
                                .then((response)=>{
                                    
                                    let resultFields=response.payload;
                                    // console.log(`In CalculateTup >>>>>>>>>>>>>>>>>> In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 :: Exec_Function_OnChange>>>>>>>>>>storeObj >>>  `,JSON.stringify(resultFields ))
                                    if(resultFields!==undefined && resultFields!==null && Object.keys(resultFields).length>0){
                                        Object.keys(resultFields).forEach((key)=>{
                                            if(key!=='Error'){
                                                localPayloadData[key]=resultFields[key];
                                                localSelectedFields=localSelectedFields.filter((field)=>field.name!==key);
                                                localSelectedFields.push({name:key,value:resultFields[key]});
                                            }
                                        });
                                        const storeObj={selectedFields:localSelectedFields,payloadData:localPayloadData};
                                        // console.log(`In CalculateTup >>>>>>>>>>>>>>>>>> In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 :: Exec_Function_OnChange>>>>>>>>>>storeObj >>>  `,JSON.stringify(storeObj ))
                                        dispatch(onUpdateListOfFields(storeObj));
                                    }
                                    const validationFields= getTargetFields(sectionFields.fields,'validations',item.name,item.value,localSelectedFields,localPayloadData, units, error,focusedFieldName,"useTabPanel_OnBlur",null,defaultUnits);
                                    // console.log('On Blur ::::  validations 11111>>>>>>> ',focusedFieldName,validationFields,response,localSelectedFields,localPayloadData)
                                    if(validationFields.length>0){
                                        let localErrors=[...validationFields]
                                        dispatch(onUpdateError(localErrors));
                                    }else{
                                        dispatch(onUpdateError(null))
                                    }
                                })
                            
                            }else if(field?.value?.actionType==='OnChange' && field?.ruleType==='Exec_API'){
                                                            // console.log('In useTabPanel:::calculatedFields:: field 111111 >>>>>>>>>>> ',field)
                                let config=ApiExecRequiredFields(field?.value,payloadData,preferences,units,defaultUnits,item);
                                let data={...config?.data};
                                data={...data,apiCallingField:field?.name,userId:userData?.EmailId}
                                config={...config,data}
                                                            // console.log(' In field field Calculation_ExecAPI >>>> field 111111 >>>>>>>>>>> ',config)
                                dispatch(fieldCalculation_ExecAPI(config))
                                .then((response)=>{
                                    // console.log('In useTabPanel:::calculatedFields:: field 33333 >>>>>>>>>>> ',response)
                                    let localPayloadData={...payloadData}
                                    let localSelectedFields=[...selectedFields]
                                    let resultFields=response.payload;
                                    // console.log('In useTabPanel: config>>>>>>>>>>resultFields ',resultFields, config)
                                    Object.keys(resultFields).forEach((key)=>{
                                        if(key!=='Error'){
                                            localPayloadData[key]=resultFields[key]
                                            localSelectedFields=localSelectedFields.map((field)=>{
                                                if(field.name===key){
                                                    return {...field,value:resultFields[key]}
                                                }
                                                return field;
                                            })
                                        }
                                    })
                                    const validationFields= getTargetFields(sectionFields.fields,'validations',item.name,item.value,localSelectedFields,localPayloadData, units, error,focusedFieldName,"useTabPanel_OnBlur",null,defaultUnits);
                                    // console.log('On Blur ::::  validations 11111>>>>>>> ',focusedFieldName,validationFields,response,localSelectedFields,localPayloadData)
                                    if(validationFields.length>0){
                                        let localErrors=[...validationFields]
                                        dispatch(onUpdateError(localErrors));
                                    }else{
                                        dispatch(onUpdateError(null))
                                    }
                                })
                                                        
                            }
                        });
                    }
                    // console.log('In use PopupPanel::: 111111 >>>> ',localSelectedFields,localPayloadData)
                    let validateFlag=true;
                    if(focusedFieldName!=='' && focusedFieldName!==undefined && focusedFieldName!==null){
                        if(focusedFieldName===localItem.name){
                            if(localItem?.onchangevalidation!==undefined){
                                validateFlag=localItem?.onchangevalidation;
                            }
                        }
                    }
                    // console.log('In use PopupPanel::: 222222 >>>> ',localSelectedFields,localPayloadData)
                    if(localItem?.type==='checkbox'){
                        handleBlur(localItem);
                    }else if(validateFlag){
                        const validationFields= getTargetFields(sectionFields.fields,'validations',localItem.name,localItem.value,localSelectedFields,localPayloadData, units, error,focusedFieldName,"useTabPanel_OnChange",null,defaultUnits);
                        // console.log(' validations 11111>>>>>>> ',localItem,validationFields.length,validationFields)
                        if(validationFields.length>0){
                            let localErrors=[...validationFields]
                            dispatch(onUpdateError(localErrors));
                        }else{
                            dispatch(onUpdateError(null))
                        }
                    }
                }
                // console.log('In use PopupPanel::: 33333 >>>> ',localSelectedFields,localPayloadData)
                    
                if((localItem?.name==='IsVacuumOnly' || localItem?.name==='IsPressureOnly') && localItem?.value===false){
                    const pressureValue=payloadData['IsPressureOnly']
                    const vacuumflag=payloadData['IsVacuumOnly']
                    let localItem;
                    if(item?.name==='IsVacuumOnly' && !pressureValue){
                        localItem={name:'IsPressureOnly',value:true}
                    }else if(item?.name==='IsPressureOnly' && !vacuumflag){
                        localItem={name:'IsVacuumOnly',value:true}
                    }
                    if(localItem!==undefined){
                        handleChange(localItem)
                    }
                }
                //update UOM field's input value as per new UOM
                if(localItem?.name === 'DisplayUnitSystem'){
                    updateUomValue(localItem.value)
                }
                // console.log('In use PopupPanel::: 44444 >>>> ',localSelectedFields,localPayloadData)
            };
            // const section = workflowSections.find(section => section.displayOrder === tabIndex + 1);
            
            
            
                
        }
        selectedItem={...payloadData}
    }
    //         break;
        
    // }
    const {heading, items, displayType} = activeTabMenu;
    // console.log(' In use PopupPanel 2222>>>>>>>>> ',activeTabMenu)
    return {heading, items, displayType, selectedItem, UpdateSectionFields,handleChange,handleBlur,handleFocusedFieldName};
}

export default usePopupPanel;