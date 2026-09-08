import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onSelectValveCategory, onSelectFluidType, onSelectSizingMethodology, fetchWorkflowSections, onUpdateFields, onUpdateError, fieldCalculationAPI, onUpdateSetPayloadFlag, fieldCalculation_ExecFunction, fetchWorkFlowPopupData, onUpdateListOfFields, setWorkflowDataLoaded, fieldCalculation_ExecAPI, fieldValidationAPI, displayUnitConvertUomAPI } from "../store/slices/workflowSlice";
import { onSelectMenu, setActivateResults } from "../store/slices/navigationSlice";
import {  setAdvViewResultDisplay, setOnBlurPayloadData, updateWorkflowPayload } from "../store/slices/workflowPayloadSlice";
import {  ApiExecRequiredFields, funcExecRequiredFields, getTargetFields } from "../utils/validation";
import { setFocusedFieldName } from "../store/slices/genericSlice";
import { DIMENSION_SEPARATOR, FIELD_SPLITTER, RESULT_PAGE_TITLE, SP_GR_Constant, fluid2PhaseProperties, fluidProperties,  fluidPropertiesVacuumFA, fluidVacuumProperties } from "../utils/constants";
import useTabUpdateUomValues from "../hooks/useTabUpdateUomValues";
import { convertUnitDiffDims } from "../utils/convertUnit";
// import { isArray } from "mathjs";


const useTabPanel = (tabIndex) => {
    let activeTabMenu = {}
    const dispatch = useDispatch();
    const {focusedFieldName, genericErrors} = useSelector(state=>state.generic);
    const { preferences,userData } = useSelector(state => state.auth);
    const { isAdvanced } = useSelector((state) => state.layout);
    const {menus} = useSelector(state=>state.navigation);
    const {selectedFields, valveCategories, selectedValveCategory, fluidTypes, selectedFluidType, 
            sizingMethodologies, selectedSizingMethodology, selectedWorkflow, 
            workflowSections, error, setPayloadFlag, searchFlag, fieldValidationResults } = useSelector(state => state.workflow);
    const { payloadData,advViewResultDisplayFlag,IsPopupDataSaved,FlowRatePopupFlag,FlowRateVacuumPopupFlag,onBlurPayloadData } = useSelector(state => state.workflowPayload);
    const { units,defaultUnits } = useSelector(state => state.uom);
    const {activateResults} = useSelector(state => state.navigation)
    const { fluids } = useSelector(state => state.generic);
    const {updateUomValue}=useTabUpdateUomValues()
    useEffect(() => {
        if(selectedWorkflow) {
            
            
            // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> In useTabPanel >>>>>>>> ',selectedWorkflow,IsPopupDataSaved)
            if(!IsPopupDataSaved){
                dispatch(fetchWorkFlowPopupData({selectedWorkflow,searchFlag,userId: userData?.EmailId}));
            }
            // console.log('Workflow Section: >>>>>>>>> 11111111', selectedWorkflow);
            dispatch(fetchWorkflowSections({selectedWorkflow,userId: userData?.EmailId}));
        }
    }, [ selectedWorkflow])


    useEffect(()=>{
        // console.log('setPayloadFlag >>>>>>>>>>>>>>>> ',setPayloadFlag)
        if(setPayloadFlag){
            const payloadData = selectedFields.reduce((acc, item)=>{
                acc[item.name]=item.value;
                return acc
            },{})
            dispatch(updateWorkflowPayload(payloadData))
            dispatch(onUpdateSetPayloadFlag(false))
        }
    },[setPayloadFlag])
    useEffect(()=>{

        window.scrollTo({
            top: 0,
            behavior: 'auto' // Optional: 'auto' or 'smooth'
        });
    },[tabIndex]);

    const UpdateSectionFields=(section)=>{
        
        const updatedSection=section?.fields?.map((field)=>{
            // console.log('In use TabPanel:::::: field?.dimensionName 1111111 >>>>>>> ',units,field?.dimensionName,units[field?.dimensionName],field?.fieldName,field?.dimensionName!==undefined && field?.dimensionName!==null && field?.dimensionName!=='',field?.fieldName?.indexOf('FluidName'),(Array.isArray(field?.fieldName) && field?.fieldName?.indexOf('FluidName')!==-1)|| field?.fieldName==='FluidName' || field?.fieldName?.indexOf('FluidName') !==-1)
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
                                if(item==='viscosity' && unit.SystemUnit==='Metric' && systemUnit==='English' && unit.UnitName==='cP'){
                                    localOptions.push({label:unit.UnitName,value:unit.UnitKey,...unit})

                                }
                                if(unit.SystemUnit===systemUnit || unit.SystemUnit==='All' || systemUnit==='All'){
                                    localOptions.push({label:unit.UnitName,value:unit.UnitKey,...unit})
                                }
                            });

                            localOptions = localOptions.reduce((acc, current) => {
                                const x = acc.find(item => item.value === current.value);
                                if (!x) {
                                    return acc.concat([current]);
                                } else {
                                    return acc;
                                }
                            }, []);
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
            }else if((field?.fluidType!==undefined && field?.fluidType!==null && field?.fluidType!=='')){
                let options=[]
                if(selectedFluidType!==undefined){
                    const localfluids=fluids[field?.fluidType];
                    console.log('In use TabPanel:::::: field?.fieldName 22222 >>>>>>> ',localfluids,field,field?.label, selectedFluidType)
                    
                    options=localfluids?.item?.map((it)=>{
                        return {label:it.Name,value:it.Name,...it}
                    })
                }

                return {
                    ...field,
                    options:options
                }
            }else if((Array.isArray(field?.fieldName) && field?.fieldName?.indexOf('FluidNameLiquid')!==-1)|| field?.fieldName==='FluidNameLiquid' || field?.fieldName?.indexOf('FluidNameLiquid') !==-1){

                let options=[]
                // console.log('In use TabPanel:::::: field?.fieldName 22222 >>>>>>> ',units,field?.fieldName,field?.label, selectedFluidType)
                if(selectedFluidType!==undefined){
                    const localfluids=fluids["2"];
                    
                    options=localfluids?.item?.map((it)=>{
                        return {label:it.Name,value:it.Name,...it}
                    })
                }

                return {
                    ...field,
                    options:options
                }
            }else if((Array.isArray(field?.fieldName) && field?.fieldName?.indexOf('FluidName')!==-1)|| field?.fieldName==='FluidName' || field?.fieldName?.indexOf('FluidName') !==-1){

                let options=[]
                // console.log('In use TabPanel:::::: field?.fieldName 22222 >>>>>>> ',units,field?.fieldName,field?.label, selectedFluidType)
                if(selectedFluidType!==undefined){
                    const localfluids=fluids[selectedFluidType?.id?.toString()];
                    
                    options=localfluids?.item?.map((it)=>{
                        return {label:it.Name,value:it.Name,...it}
                    })
                }

                return {
                    ...field,
                    options:options
                }
            }else{
                return field
            }
        });

        // console.log('updatedSection >>>>>>>>>> ',updatedSection)

        let displayItems = updatedSection.reduce((acc, field) => {
            if (field.fieldGroupType !== undefined && field.fieldGroupType !== null && field.fieldGroupType !== '') {
                const key = `${field.fieldGroupType}-${field.fieldGroupName}`;
                if (!acc[key]) {
                    acc[key] = {
                        sectionId: field.sectionId,
                        sectionName: field.sectionName,
                        fieldName: field.fieldGroupName,
                        type: field?.type,
                        defaultValue: field.defaultValue,
                        isValidationRequired:field.isValidationRequired,
                        validateActionType:field.validateActionType,
                        defaultUOM: field.defaultUOM,
                        style: field.style,
                        disabled: field.disabled,
                        disableUOM: field.disableUOM,
                        visible: field?.visible,
                        hideFromSideBar: field?.hideFromSideBar,
                        infoText: "",
                        grid: field?.grid,
                        gridDirection: field?.gridDirection,  
                        gridTemplateColumns: field?.gridTemplateColumns,     
                        gridSection: field?.gridSection,                             
                        fieldList: [],
                        fieldGroupType: field.fieldGroupType,
                        fieldGroupLabel: field.fieldGroupLabel,
                        defaultSelected: field.defaultSelected,
                        onBlurAction: field?.onBlurAction,
                        popupFields: field?.popupFields,
                        onchangevalidation: field?.onchangevalidation,
                        mirrorId: field?.mirrorId,
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
                    UomFieldName:field?.uomFieldName ?? field?.UomFieldName,
                    action: field?.copyAction ?? field?.action,
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

    let handleChange;
    let handleBlur;
    let handleFocusedFieldName;
    let selectedItem;
    let nextIndex;
    
    // const dynamicCase=menus.length;
    const dynamicCase=menus[menus?.length - 1]?.name === RESULT_PAGE_TITLE ?menus.length-1:menus.length;
    // console.log('In useTabPanel >>>>>>>>>> ',tabIndex,menus.length-1,menus,dynamicCase)
    switch(tabIndex) {
        case 0:
            activeTabMenu = valveCategories;
            nextIndex = tabIndex + 1;
            selectedItem=selectedValveCategory?.id;
            handleChange = (e, newValue) => {
                if(selectedValveCategory?.id!==newValue){
                    dispatch(onSelectValveCategory(newValue));
                }
                dispatch(onSelectMenu(nextIndex));
            }
            break;
        case 1:
            activeTabMenu = fluidTypes;
            nextIndex = tabIndex + 1;
            selectedItem=selectedFluidType?.id;
            handleChange = (e, newValue) => {
                // console.log(' >>>>>>>>>>>> ',newValue,selectedFluidType)
                if(selectedFluidType?.id!==newValue){
                    dispatch(onSelectFluidType(newValue));
                }
                dispatch(onSelectMenu(nextIndex));
            }
            break;
        case 2:
            activeTabMenu = sizingMethodologies;
            nextIndex = tabIndex + 1;
            selectedItem=selectedSizingMethodology?.id;
            handleChange = (e, newValue) => {
                dispatch(onSelectSizingMethodology(newValue));
                
                dispatch(setWorkflowDataLoaded(true));
                dispatch(onSelectMenu(tabIndex + 1));
            }
            break;
        case dynamicCase:
            activeTabMenu = {
                heading: 'Results',
                items: selectedFields,
                displayType: 'Results'
            }
            break
        default:
            if (workflowSections.length) {
                const updateValueInStore = (item) => {
                    if(item?.name!=='%'){
                        // console.log('in useTabPanel:: updateValueInStore >>>>>>> ',item)
                        // dispatch(onUpdatePayloadData(item));
                        dispatch(onUpdateFields({...item,page:"useTabPanel"}));
                    }
                }

                const getFieldSectionIndex=(tabIndex,fieldName)=>{
                    let localtabIndex=tabIndex;
                    if(isAdvanced){
                        workflowSections.forEach((section) => {
                            const localsectionFields=section.fields.find(
                            (field) => field.fieldName === fieldName
                            );
                            if(localsectionFields!==undefined){
                                localtabIndex=section.displayOrder;
                            }
                        });
                    }
                    return localtabIndex;
                }
                handleBlur=(item)=> {
                    // console.log('In handleBlur >>>>>>>>>>>>>>>>>..>>>>> ',item.name,onBlurPayloadData[item.name],item.value)
                    if(item?.validatefield && onBlurPayloadData[item.name]===item.value){
                        return;
                    }
                    // console.log('In field ValidationAPI:handleBlur 111111>>>>>>>> ',item,payloadData[item.name])
                    const localtabIndex =getFieldSectionIndex(tabIndex + 1,item.name)
                    dispatch(setFocusedFieldName(""));
                    
                    const sectionFields = workflowSections.find(section => section.displayOrder === localtabIndex);
                    if(item.value===''){
                        const defaultField=sectionFields.fields.find((field)=>field.fieldName===item.name);
                        if(defaultField!==undefined){
                            if(typeof defaultField.defaultValue==='object'){
                                const localvalue=defaultField.defaultValue?.value??'';
                                updateValueInStore({name:item.name,value:localvalue});
                                dispatch(setOnBlurPayloadData(
                                    {
                                        ...onBlurPayloadData,
                                        [item.name]:localvalue
                                    }
                                ));
                            }
                        }
                    }else{
                        updateValueInStore(item);
                        dispatch(setOnBlurPayloadData(
                            {
                                ...onBlurPayloadData,
                                [item.name]:item.value
                            }
                        ));
                    }

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
                        // console.log('In useTabPanel:::calculatedFields:: 00000 >>>>>>>>>>> ',calculatedFields)
                        if(calculatedFields?.length>0){
                            calculatedFields.forEach((field)=>{
                                // console.log('In useTabPanel:::calculatedFields:: field 00000 >>>>>>>>>>> ',field?.ruleType)
                                if(field?.ruleType==='API_FUNCTION_CALL'){
                                    const config={...field?.value,TemperatureUOM:preferences?.SystemTemperature,checkSuperCritical:field?.checkSuperCritical,selectedWorkFlowId:selectedWorkflow,SizingBasis:payloadData['SizingBasis'],TemperatureUOM:payloadData['TemperatureUOM'],Relieving:payloadData['Relieving']}
                                    dispatch(fieldCalculationAPI(config)).then((response)=>{
                                        // console.log('In useTabPanel:::API_FUNCTION_CALL: Response >>>>>>>>>>>>>>>> ',response,selectedFields,payloadData)
                                        let newPayloadData={...payloadData}
                                        const newSelectFields=selectedFields.map((field)=>{
                                            if(["Relieving","SaturatedSteam","TemperatureUOM"].includes(field.name)){
                                                // console.log('API_FUNCTION_CALL: Response 111>>>>>>>>>>>>>>>> ',field.name,field.value)
                                                let newValue;
                                                if(field.name==='TemperatureUOM'){
                                                    newValue=response?.payload?.config?.data?.TemperatureUOM;
                                                    let tempUOMFlag=newValue==="" || newValue===null || newValue===undefined?false:true;
                                                    if(!tempUOMFlag){
                                                        newValue=response?.payload?.config?.TemperatureUOM;
                                                    }
                                                }else{
                                                    const SizingBasis=payloadData['SizingBasis'];
                                                    newValue=response?.payload?.response.data.SaturatedSteam;
                                                    newValue=newValue===null?field?.name!=='Relieving'?'':field?.value===null|| field.value===undefined?'':field.value:field?.name!=='Relieving'?newValue:SizingBasis==='Economizer' || SizingBasis==='Preheater'?'':newValue
                                                }// console.log('API_FUNCTION_CALL: Response 222>>>>>>>>>>>>>>>> ',field.name,field.value,newValue)
                                                newPayloadData[field.name]=newValue; //{...newPayloadData[field.name],value:newValue}
                                                return {...field,value:newValue}
                                            }
                                            return field;
                                        })
                                        // console.log('API_FUNCTION_CALL: Response >>>>>>>>>>>>>>>> 22222',newSelectFields,newPayloadData)
                                        // for(const section of workflowSections){
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
                                    // console.log('In useTabPanel:::calculatedFields:: field 111111 >>>>>>>>>>> ',field)
                                    let config=funcExecRequiredFields(field?.value,payloadData,preferences,units,defaultUnits,item);
                                    config={...config,funcCallingField:field?.name}
                                    dispatch(fieldCalculation_ExecFunction(config))
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
                                }else if(field?.ruleType==='Exec_API'){
                                    // console.log('In useTabPanel:::calculatedFields:: field 111111 >>>>>>>>>>> ',field)
                                    let config=ApiExecRequiredFields(field?.value,payloadData,preferences,units,defaultUnits,item);
                                    let data={...config?.data};
                                    data={...data,apiCallingField:field?.name,userId:userData?.EmailId}
                                    config={...config,data}
                                    // console.log('In useTabPanel:::calculatedFields:: In field field Calculation_ExecAPI >>>> field 111111 >>>>>>>>>>> ',config,payloadData)
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
                                }else{
                                    // for(const section of workflowSections){
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
                            // for(const section of workflowSections){
                            // console.log('In On blur ::::: 111111 >>>>>>>>> ',selectedFields,payloadData)
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
                handleFocusedFieldName=(fieldName)=>{
                    // console.log(' In useTabPanel:: handleFocusedFieldName >>>>>>>>>>>> ',fieldName)
                    dispatch(setFocusedFieldName(fieldName));
                }
                handleChange = (item, localSelectedFields1=null, localPayloadData1=null) => {
                    // console.log('In handleChange >>>>>>>>>>>>>>>>>..>>>>> ',item?.type,item?.name,onBlurPayloadData[item.name],item);
                    let prevValue;
                    if(isAdvanced){
                        if(payloadData["IsPressureOnly"] && payloadData["IsVacuumOnly"]){
                            dispatch(onSelectMenu(3));
                          }else if(payloadData["IsPressureOnly"] || payloadData["IsVacuumOnly"]){
                            dispatch(onSelectMenu(3));
                          }else{
                            dispatch(onSelectMenu(3));
                          }
                        if(advViewResultDisplayFlag){
                            dispatch(setAdvViewResultDisplay(false));
                        }
                    }
                    if(payloadData['UomFieldName']!==''){
                        updateValueInStore({name:'UomFieldName',value:''})
                    }
                    const fluidFieldFlag=item?.name==='FluidName' || item?.name==='FluidNameVacuum' || item?.name==='FluidNameLiquid' || item?.name==='FluidNameLiquid2';
                    let localItem = fluidFieldFlag?{...item,validatefield:false}:{...item};
                    localItem={...localItem, value:localItem.value==='US Customary'?'English':localItem.value}
                    
                    if(localItem?.type==='combobox'){
                        prevValue=payloadData[localItem.name];
                        dispatch(setOnBlurPayloadData(
                            {
                                ...onBlurPayloadData,
                                [localItem.name]:payloadData[localItem.name]
                            }
                        ));
                    }

                    let defaultValueFields=[];
                    // console.log('In useTabPanel:::handle Change >>> handle Change 111111>>>>>>>> ',item,activateResults)
                    let copyFlag=false;
                    let localSelectedFields=localSelectedFields1 && Array.isArray(localSelectedFields1)?[...localSelectedFields1]:[...selectedFields]
                    let localPayloadData=localPayloadData1?{...localPayloadData1}:  {...payloadData}
                    let defaultFieldCheckFlag=true;
                    // console.log(`In usetabPanel >>>>>>>>>>>>>>> FlowRateVacuumPopupFlag: ${FlowRateVacuumPopupFlag}, ${payloadData['API2000WreqVChangeWarningFlag']}, fieldname:: ${localItem.name} >>> ${payloadData['FlowRateVacuumPopupFlag'] && (localItem.name==='Wreq' || localItem.name==='WreqV')}`)
                    if(FlowRatePopupFlag&& localItem.name==='Wreq'){
                        if(payloadData['API2000WreqChangeWarningFlag']!==true){
                            defaultFieldCheckFlag=false;
                            updateValueInStore({name:`prev${localItem.name}`,value:payloadData[localItem.name]});
                            updateValueInStore({name:'API2000WreqChangeWarningFlag',value:true});
                            // updateValueInStore({name:'Wreq1',value:localItem.value});
                        }
                    }else if(FlowRateVacuumPopupFlag && localItem.name==='WreqV'){
                        if(payloadData['API2000WreqVChangeWarningFlag']!==true){
                            defaultFieldCheckFlag=false;
                            updateValueInStore({name:`prev${localItem.name}`,value:payloadData[localItem.name]});
                            updateValueInStore({name:'API2000WreqVChangeWarningFlag',value:true});
                            // updateValueInStore({name:'WreqV1',value:localItem.value});
                        }
                    }

                    if(item?.UomFieldName!==undefined){
                        const currUOMField=payloadData[`Current${item?.UomFieldName}`]
                        if(currUOMField!==undefined){
                            updateValueInStore({name:item?.UomFieldName,value:currUOMField})
                        }
                    }

                    if(localItem.name==='DisplayUnitSystem'){
                        localItem.value = localItem.value=='US Customary'?'English':localItem.value;
                        const prevValue=['All','English'].indexOf(localPayloadData['DisplayUnitSystem'])!==-1;
                        const updatedValue=['All','English'].indexOf(localItem.value)!==-1;
                        let updatedFields=[...selectedFields];
                        let updatedPayload={...payloadData};
                        // console.log('In CalculateRatedFlow >> >>>>>>>>>>>>>>>> ',prevValue,updatedValue,selectedFields,payloadData)
                        // if(prevValue!==updatedValue){
                        const config ={
                            url: '/UOM/displayunit/conversion',
                            method: 'POST',
                            data: {
                                inputs: {...payloadData,'DisplayUnitSystem':localItem.value,workflowId:selectedWorkflow},
                            }
                        }
                        // console.log('config >>>>>>>>>>>>>>>>>>>',config);
                        dispatch(displayUnitConvertUomAPI(config));
                            // selectedFields.forEach((field)=>{
                            //     // console.log('In useTabPanel >>>>>>>>>>>>>>>> In useTabUpdateUomValues >>>>>>> ',field)
                            //     if(field.name.indexOf('UOM')!==-1 && field.value!==undefined){
                                    
                            //         const displayUnit=localItem.value==='Metric'?'Metric':'English';
                            //         const localDimension=field.value.split('.')[0];
                            //         const unitValue=defaultUnits[displayUnit][localDimension];
                            //         updatedPayload[field.name]=unitValue;
                            //         updatedFields=updatedFields.filter((it)=>it.name!==field.name);
                            //         updatedFields.push({...field,value:unitValue})
                            //         // console.log('In CalculateRatedFlow >> UOM Values >>>>>>>>>>> ',field?.name,unitValue)
                            //     }
                            // })
                        // }else{

                        //     localSelectedFields=[...updatedFields]
                        //     localPayloadData={...updatedPayload}
                        //     const storeObj={selectedFields:updatedFields,payloadData:updatedPayload};
                        //     dispatch(onUpdateListOfFields(storeObj));
                        // }

                        
                    }

                    let localValue=item.value;
                    if(item?.action!==undefined && item?.action?.type.toLowerCase()==='copy'){
                        // console.log('in useTabPanel:: handleChange:: Copy Action >>>>>>> ',localItem)
                        copyFlag=true;
                        updateValueInStore({name:"AlwaysUseTsat",value:true})
                        const field=selectedFields.find((it)=>it.name===localItem?.targetField);
                        localItem={...item,name:localItem.currentField,value:field.value,mandatory:localItem?.mandatory}
                        localValue=field.value;
                        updateValueInStore(localItem)
                    }else{
                        localSelectedFields = localSelectedFields.filter(it => it.name !==localItem?.name);
                        localSelectedFields.push({name:localItem?.name,value:localItem?.value});

                        localPayloadData[localItem?.name]=localItem?.value;
                        updateValueInStore(localItem)
                    }
                                   
                    // console.log('In handle Change 22222 >>>>>>>>>>> ',item,selectedFluidType)
                    workflowSections.forEach((section)=>{
                        // console.log('handle Change 222222>>>>>>>> ',section,workflowSections)
                        
                        if(item?.name==='FluidName' || item?.name==='FluidNameVacuum'){
                            const localId=![17, 19, 20].includes(selectedWorkflow) && selectedFluidType.id.toString()=='5'?'1':selectedFluidType.id.toString();
                            const fluidtype=fluids[localId];
                            const fluidValues=fluidtype?.item?.find((it)=>it.Name===item.value);
                            // console.log('Fluid Values >>>>>>>>>>>>>>>>>>>>>> handle Change 3333>>>>>>>> ',selectedFluidType,item,localId,fluidValues,fluidtype)
                            // workflowSections.forEach((section)=>{
                            if(fluidValues!==undefined && fluidValues!==null){
                                section.fields.forEach((field)=>{
                                    // console.log('handle Change 44444>>>>>>>>>>> ',field)
                                    const localfields=field.fieldName.split(FIELD_SPLITTER);
                                    localfields.forEach((localfield)=>{
                                        if(localfield!==item?.name){
                                            // console.log('handle Change 55555 >>>>> ',localfield,item?.name)
                                            
                                            if(fluidValues!==undefined && fluidValues!==null){
                                                let mappedField=selectedFluidType.id==6?item?.name.indexOf("Vacuum")!==-1?fluidPropertiesVacuumFA[localfield]:fluid2PhaseProperties[localfield]:item?.name==='FluidName'?fluidProperties[localfield]:selectedFluidType.id==5?fluid2PhaseProperties[localfield]:fluidVacuumProperties[localfield];
                                                // mappedField=selectedWorkflow==21 && selectedFluidType.id==1 && mappedField==='Viscosity'?null:mappedField;
                                                // console.log('handle Change 55555 >>>> In useTabPanel ::: HandleChange 22222 >>>>> ',item?.name,localfield,localfield.indexOf("Vacuum")!==-1,fluidValues,mappedField)
                                                if(mappedField!==undefined && mappedField!==null){
                                                    const localValue=fluidValues[mappedField];
                                                    // if(localValue!==undefined && localValue!==null && localValue!==''){

                                                    localSelectedFields = localSelectedFields.filter(it => it.name !==localfield);
                                                    localSelectedFields.push({name:localfield,value:localValue});

                                                    localPayloadData[localfield]=localValue;
                                                    if(localfield==='Compressibility'){
                                                        handleChange({name:localfield,value:localValue,validatefield:true},localSelectedFields,localPayloadData);
                                                    }else{

                                                        handleChange({name:localfield,value:localValue},localSelectedFields,localPayloadData);
                                                    }
                                                    
                                                }
                                            }

                                        }
                                        if(localfield==='SpGravity' && item?.name==='FluidName' && selectedSizingMethodology.id != 15){
                                            let value;
                                            const spgValue = fluidValues[fluidProperties['SpecificGravity']];
                                            if(spgValue === undefined) {
                                                const propertyKey = fluidtype?.name === "Liquid" ? 'SpecificGravity' : 'MolWeight';
                                                const rawValue = fluidValues[fluidProperties[propertyKey]];
                                                value = parseFloat(rawValue) / (fluidtype?.name === "Liquid" ? 1 : SP_GR_Constant);
                                            }else{
                                                value = spgValue;
                                            }
                                            // console.log('In useTabPanel ::: HandleChange 33333 >>>>> ',localfield,value,spgValue,fluidValues,fluidProperties['SpecificGravity'])
                                            localSelectedFields = localSelectedFields.filter(it => it.name !==localfield);
                                            localSelectedFields.push({name:localfield,value});
                                            
                                            localPayloadData[localfield]=value;
                                            handleChange({ name: localfield, value },localSelectedFields,localPayloadData);
                                        }
                                        
                                        if (['CriticalPressure', 'CriticalTemperature'].includes(localfield) && item?.name === 'FluidName') {
                                            let value = localfield === 'CriticalPressure' ? fluidValues.Pcrit : fluidValues.Tcrit;
                                            // console.log('Fluid Values >>>>>>>>>>>>>>>>>>>>>> ',localfield,value,fluidValues);
                                            
                                            if(localfield==='CriticalPressure'){
                                                let toDim=payloadData['AtmPressureUOM'];
                                                toDim=units['abspressure'].find(u => u.UnitKey===toDim);
                                                let fromDimValue=fluidValues?.PcritUnit;
                                                fromDimValue=fromDimValue!==undefined && fromDimValue!==""?fromDimValue.split(".")[1]:""
                                                const fromDim=units['abspressure'].find(u => u.UnitKey==='abspressure.'+fromDimValue);
                                                value=convertUnitDiffDims(value, fromDim, toDim, units, payloadData);
                                            }else{
                                                let toDim=payloadData['TemperatureUOM'];
                                                toDim=units['temperature'].find(u => u.UnitKey===toDim);
                                                let fromDimValue=fluidValues?.TcritUnit;
                                                // fromDimValue=fromDimValue!==undefined && fromDimValue!==""?fromDimValue.split(".")[1]:""
                                                const fromDim=units['temperature'].find(u => u.UnitKey===fromDimValue);
                                                value=convertUnitDiffDims(value, fromDim, toDim, units, payloadData);
                                            }
                                            handleChange({ name: localfield, value });
                                        }else if(localfield==='SpGravityVacuum' && item?.name==='FluidNameVacuum'){
                                            const newVal=fluidProperties['MolWeightVacuum']
                                            const localValue=fluidValues[newVal];
                                            const spGrav=parseFloat(localValue)/SP_GR_Constant;
                                            handleChange({name:localfield,value:spGrav})
                                        }else if (localfield === 'Viscosity' && item?.name === 'FluidName' && fluidtype?.name === "Liquid") {
                                            let viscosityValue = parseFloat(fluidValues[fluidProperties['Viscosity']]);
                                            const fromDim=units['viscosity'].find(u => u.UnitKey==="viscosity.cp");
                                            let toDimValue=payloadData['ViscosityUOM'];
                                            toDimValue=toDimValue!==undefined && toDimValue!==""?toDimValue.split(".")[0]:""
                                            const toDim=units[toDimValue].find(u => u.UnitKey===payloadData['ViscosityUOM']);
                                            viscosityValue=convertUnitDiffDims(viscosityValue, fromDim, toDim, units, payloadData);
                                            // console.log('In useTabPanel ::: HandleChange 44444 >>>>> ',localfield,viscosityValue,fromDim,toDim)
                                            handleChange({ name: localfield, value: viscosityValue });

                                        } 
                                    })
                                })
                            }
                        }else if(item?.name==='FluidNameLiquid' || item?.name==='FluidNameLiquid2'){
                            const fluidtype=fluids["2"];
                            const fluidValues=fluidtype?.item?.find((it)=>it.Name===item.value);
                            // console.log('handle Change 3333>>>>>>>> ',item,section,fluidValues,fluidtype)
                            // workflowSections.forEach((section)=>{
                            if(fluidValues!==undefined && fluidValues!==null){
                                section.fields.forEach((field)=>{
                                    // console.log('handle Change 44444>>>>>>>>>>> ',field)
                                    if(field?.fieldName.indexOf('Liquid')!==-1){
                                        const localfields=field.fieldName.split(FIELD_SPLITTER);
                                        localfields.forEach((localfield)=>{
                                            // console.log('handle Change 55555 >>>>> ',localfield,item?.name)
                                            if(localfield!==item?.name){
                                                
                                                if(fluidValues!==undefined && fluidValues!==null){
                                                    let mappedField=selectedFluidType.id==5?fluid2PhaseProperties[localfield]:item?.name==='FluidName'?fluidProperties[localfield]:fluidVacuumProperties[localfield];
                                                    // console.log('In useTabPanel ::: HandleChange 22222 >>>>> ',localfield,fluidValues,mappedField)
                                                    if(mappedField!==undefined && mappedField!==null){
                                                        const localValue=fluidValues[mappedField];
                                                        handleChange({name:localfield,value:localValue})
                                                    }
                                                }

                                            }
                                            if((localfield==='SpGravityLiquid' && item?.name==='FluidNameLiquid') || (localfield==='SpGravityLiquid2' && item?.name==='FluidNameLiquid2')){
                                                let value;
                                                const spgValue = fluidValues[fluidProperties['SpecificGravity']];
                                                if(spgValue === undefined) {
                                                    const propertyKey = fluidtype?.name === "Liquid" ? 'SpecificGravity' : 'MolWeight';
                                                    const rawValue = fluidValues[fluidProperties[propertyKey]];
                                                    value = parseFloat(rawValue) / (fluidtype?.name === "Liquid" ? 1 : SP_GR_Constant);
                                                }else{
                                                    value = spgValue;
                                                }
                                                // console.log('In useTabPanel ::: HandleChange 33333 >>>>> ',localfield,value,spgValue,fluidValues,fluidProperties['SpecificGravity'])
                                                handleChange({ name: localfield, value });
                                            }
                                            // if (['CriticalPressure', 'CriticalTemperature'].includes(localfield) && item?.name === 'FluidName') {
                                            //     const value = localfield === 'CriticalPressure' ? fluidValues.Pcrit : fluidValues.Tcrit;
                                            //     handleChange({ name: localfield, value });
                                            // }else if(localfield==='SpGravityVacuum' && item?.name==='FluidNameVacuum'){
                                            //     const newVal=fluidProperties['MolWeightVacuum']
                                            //     const localValue=fluidValues[newVal];
                                            //     const spGrav=parseFloat(localValue)/SP_GR_Constant;
                                            //     handleChange({name:localfield,value:spGrav})
                                            // }else 
                                            if ((localfield === 'ViscosityLiquid' && item?.name === 'FluidNameLiquid') || (localfield === 'ViscosityLiquid2' && item?.name === 'FluidNameLiquid2')) {
                                                let viscosityValue = parseFloat(fluidValues[fluid2PhaseProperties['Viscosity']]);
                                                const fromDim=units['viscosity'].find(u => u.UnitKey==="viscosity.cp");
                                                let toDimValue=payloadData['ViscosityUOM'];
                                                toDimValue=toDimValue!==undefined && toDimValue!==""?toDimValue.split(".")[0]:""
                                                const toDim=units[toDimValue].find(u => u.UnitKey===payloadData['ViscosityUOM']);
                                                viscosityValue=convertUnitDiffDims(viscosityValue, fromDim, toDim, units, payloadData);
                                                // console.log('In useTabPanel ::: HandleChange 44444 >>>>> ',localfield,viscosityValue,fromDim,toDim)
                                                handleChange({ name: localfield, value: viscosityValue });

                                            } 
                                        });
                                    }
                                })
                            }
                        }else if(item?.name==='MolWeightVacuum' ){
                            const fieldCheckFlag=section?.fields.find((field)=> field.fieldName==='SpGravityVacuum');
                            if(fieldCheckFlag!==undefined){
                                const spGrav=parseFloat(item?.value)/SP_GR_Constant;
                                const localItem={name:'SpGravityVacuum',value:spGrav}
                                updateValueInStore(localItem)
                            }

                        }else if(item?.name==='SpGravityVacuum' ){
                            const fieldCheckFlag=section?.fields.find((field)=> field.fieldName==='MolWeightVacuum');
                            if(fieldCheckFlag!==undefined){
                                const Molwt=parseFloat(item?.value)*SP_GR_Constant;
                                const localItem={name:'MolWeightVacuum',value:Molwt}
                                updateValueInStore(localItem)
                            }
                        }
                        // console.log('In useTabPanel :: defaultValue 11111 >>>>>>>>>>>>>> ',localItem.value)
                        if(defaultFieldCheckFlag){
                            defaultValueFields= getTargetFields(section.fields,'defaultValue',localItem.name,localItem.value,selectedFields,payloadData, units,null,focusedFieldName,'useTabPanel',preferences,defaultUnits);
                            // console.log('In useTabPanel :: defaultValueFields >>>>>>> ',defaultValueFields,localItem)
                            defaultValueFields.forEach((field)=>{
                                // console.log('In useTabPanel:::defaultValueFields >>>>>>>>>>> ',field)
                                if(field?.nextRound!==undefined && field?.nextRound!==null && field?.nextRound!=='' && !field?.nextRound){
                                    updateValueInStore({name:field.name,value:field.value})
                                }else{
                                    handleChange({name:field.name,value:field.value})
                                }
                            });
                        }

                    });
                    let validatedData=null;
                    const localtabIndex =getFieldSectionIndex(tabIndex + 1,localItem.name)
                    // console.log('In handleChange >>>>  11111>>>>>>>>>> ',localItem)
                    if(localItem?.validatefield){
                        const disabledFields=fieldValidationResults?.disabledFields ?? {};
                        const mandatoryFields=fieldValidationResults?.mandatoryFields ?? {};
                        const visibleFields=fieldValidationResults?.visibleFields ?? {};
                        const hideFromSideBarFields=fieldValidationResults?.hideFromSideBarFields ?? {};
                        const data={
                                    currentField:{FieldName:item.name,FieldValue:localValue,FieldId:item?.fieldId,actionId:item?.actionId,isFieldActionRequired:item?.isFieldActionRequired,prevValue},
                                    inputs:{...localPayloadData,[item.name]:item.value,userId:userData?.EmailId,workflowId:selectedWorkflow,sectionId:item?.sectionId},
                                    error,
                                    disabledFields,
                                    mandatoryFields,
                                    visibleFields,
                                    hideFromSideBarFields,
                                }
                        // console.log('In handleChange >>>> 2222 >>>>>>>>>> ',data)
                        const config={url:'/validate',method:'POST',data}
                        dispatch(fieldValidationAPI(config)).then((response)=>{
                            // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>> Validation done successfully ',response?.payload?.response?.results)
                            // console.log('In Tool 1111 >>>>>>>>>>>.  44444444 >>>>>>>>>> Validation done successfully ');
                        });
                    }else{
                        const sectionFields = workflowSections.find(section => section.displayOrder === localtabIndex);
                        
                        const calculatedFields= getTargetFields(sectionFields?.fields,'calculateFields',localItem.name,localItem.value,selectedFields,payloadData, units,null,focusedFieldName,"useTabPanel_OnChange",preferences,defaultUnits);
                        // console.log('In useTabPanel:::handle Change :::: calculatedFields 00000 >>>>>>>>>>> ',calculatedFields)
                        if(calculatedFields?.length>0){
                            calculatedFields.forEach((field)=>{
                                // console.log('In useTabPanel:::handle Change :::: calculatedFields 00000 >>>>>>>>>>> ',field)
                                if(field?.ruleType==='COPY_FIELD_DATA'){
                                    field?.rule?.parametersObjects.forEach((param)=>{
                                        const localValue=payloadData[param.from]
                                        if(localValue!==undefined  && localValue!=='' && localValue!==null){
                                            const localItem2={name:param.to,value:localValue}
                                            updateValueInStore(localItem2)
                                        }
                                    });

                                    
                                }else if((copyFlag || field?.value?.actionType==='OnChange') && field?.ruleType==='API_FUNCTION_CALL'){
                                    const config={...field?.value,TemperatureUOM:preferences?.SystemTemperature,checkSuperCritical:field?.checkSuperCritical,
                                                    selectedWorkFlowId:selectedWorkflow,SizingBasis:localItem.name==='SizingBasis'?localItem.value:payloadData['SizingBasis'],TemperatureUOM:payloadData['TemperatureUOM'],Relieving:payloadData['Relieving']}
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
                                                    const SizingBasis=copyFlag?payloadData['SizingBasis']:localItem.value;
                                                    newValue=response.payload.response.data.SaturatedSteam;
                                                    newValue=newValue===null?field?.name!=='Relieving'?'':field?.value===null|| field.value===undefined?'':field.value:field?.name!=='Relieving'?newValue:SizingBasis==='Economizer' || SizingBasis==='Preheater'?'':newValue
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
                                    dispatch(fieldCalculation_ExecFunction(config))
                                    .then((response)=>{
                                        let localPayloadData={...payloadData}
                                        let localSelectedFields=[...selectedFields]
                                        let resultFields=response.payload;
                                        // console.log(' >>>>>>>>>> ',resultFields)
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
                        let validateFlag=true;
                        if(focusedFieldName!=='' && focusedFieldName!==undefined && focusedFieldName!==null){
                            if(focusedFieldName===localItem.name){
                                if(localItem?.onchangevalidation!==undefined){
                                    validateFlag=localItem?.onchangevalidation;
                                }
                            }
                        }
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
                    
                };
                const section = workflowSections.find(section => section.displayOrder === tabIndex + 1);
                // console.log('In UseTabPanel>>>> ',workflowSections,section)
                
                if(section !==undefined){
                    activeTabMenu=UpdateSectionFields(section)
                }
            }
            selectedItem={...payloadData}
            break;
        
    }
    const {heading, items, displayType} = activeTabMenu;
    return {heading, items, displayType, selectedItem, UpdateSectionFields,handleChange,handleBlur,handleFocusedFieldName};
}

export default useTabPanel;