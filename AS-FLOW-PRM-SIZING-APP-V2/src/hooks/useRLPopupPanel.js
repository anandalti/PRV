// import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onUpdateFields, fieldCalculation_ExecAPI } from "../store/slices/workflowSlice";

import {  ApiExecRequiredFields,  getTargetFields } from "../utils/validation";
import {  setFocusedFieldName } from "../store/slices/genericSlice";
import { DIMENSION_SEPARATOR, FIELD_SPLITTER} from "../utils/constants";
import { setOnBlurPayloadData } from "../store/slices/workflowPayloadSlice";

const useRLPopupPanel = (openFlag) => {
    let activeTabMenu = {}
    const dispatch = useDispatch();
    const {focusedFieldName} = useSelector(state=>state.generic);
    const { preferences,userData } = useSelector(state => state.auth);
    // const {menus} = useSelector(state=>state.navigation);
    const {selectedFields, RLPopupDetails, popupCounter} = useSelector(state => state.workflow);
    const { payloadData,onBlurPayloadData,selectedResultRows } = useSelector(state => state.workflowPayload);
    const { units,defaultUnits } = useSelector(state => state.uom);
   
    const UpdateSectionFields=(section)=>{
        
        const updatedSection=section?.fields?.map((field)=>{
            if(field?.fieldName=='LiftRestriction'){
                // // console.log(' >>>>>>>> ',field?.dimensionName,typeof field?.dimensionName)
                let LiftRestriction=field?.LROptions?.length>0?field?.LROptions:[];
                if(LiftRestriction.length===0){
                    LiftRestriction=selectedFields.find((item)=>item.name==='LROptions');
                    LiftRestriction=LiftRestriction!==undefined && LiftRestriction!==null && LiftRestriction?.length>0?LiftRestriction?.value:[];
                }
                return {
                    ...field,
                    options:[...LiftRestriction]
                }
            }else if(field?.type=='inputUom'){
                const uomFieldName=payloadData[field?.uomFieldName];
                const dim=uomFieldName?.split('.')[0];
                const localUomList=units[dim]!==undefined && units[dim]!==null?units[dim]:[];
                // console.log(localUomList);
                let finalUom={};
                //{label:unit.UnitName,value:unit.UnitKey,...unit}
                if(localUomList.length>0 && uomFieldName!==''){
                    finalUom=localUomList.find((unit)=>unit.UnitKey===uomFieldName);
                    finalUom={label:finalUom.UnitName,value:finalUom.UnitKey,...finalUom}
                }
                return {
                    ...field,
                    options:[{...finalUom}]
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
                                    label: field?.fieldGroupLabel??'',
                                    type: field?.type,
                                    defaultValue: field.defaultValue,
                                    disabled: field.disabled,
                                    visible: field?.visible,
                                    defaultUOM: field?.defaultUOM,
                                    grid: field?.grid,
                                    gridDirection: field?.gridDirection ?? field?.style?.gridDirection,  
                                    gridTemplateColumns: field?.gridTemplateColumns ?? field?.style?.gridTemplateColumns,     
                                    gridSection: field?.gridSection,                             
                                    fieldList: [],
                                    fieldGroupType: field.fieldGroupType,
                                    fieldGroupLabel: field.fieldGroupLabel,
                                    defaultSelected: field?.defaultSelected,
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
                    UomFieldName:field?.uomFieldName ?? field?.UomFieldName,

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
        // console.log('RL Popup Change 11111 >>>>>>>>>>>>Items >>>>>>> ',displayItems)
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

    // switch(9) {
        
    //     default:
    if(RLPopupDetails !==undefined && Object?.keys(RLPopupDetails)?.length>0){
        if (RLPopupDetails?.fields?.length) {
            const updateValueInStore = (item) => {
                // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000:: update ValueInStore 111111>>>>>>>> ',item,selectedFields,payloadData)
                if(item?.name!=='%'){
                    dispatch(onUpdateFields({...item,page:"use PopupPanel"}));
                }
            }
            handleBlur=(item)=> {
             
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
                const sectionFields = {...RLPopupDetails};

                const calculatedFields= getTargetFields(sectionFields.fields,'calculateFields',item.name,item.value,selectedFields,payloadData, units,null,focusedFieldName,"useTabPanel_OnBlur",preferences,defaultUnits);
                // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >> calculatedFields:: 222222 >>>>>>>>>>> ',sectionFields.fields,item.name,item.value,calculatedFields)
                if(calculatedFields?.length>0){
                    calculatedFields.forEach((field)=>{
                        // console.log('In use PopupPanel:::calculatedFields:: In Calculate PressureAPI2000 >> config >>>>>>>>>>> ',field,field?.ruleType)
                        if(field?.ruleType==='Exec_API'){
                                                        // console.log('In useTabPanel:::calculatedFields:: field 111111 >>>>>>>>>>> ',selectedResultRows[popupCounter])
                            let config=ApiExecRequiredFields(field?.value,payloadData,preferences,units,defaultUnits,item,selectedResultRows[popupCounter]);
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
                                
                            })
                                                    
                        }
                        
                    });
                }
            }
            handleFocusedFieldName=(fieldName)=>{
                dispatch(setFocusedFieldName(fieldName));
            }
            handleChange = (item) => {
                // console.log('In handleChange >>>>>>> ',item)
                let localItem = {...item};
                let localSelectedFields=[...selectedFields]
                let localPayloadData={...payloadData};
                
                localSelectedFields=localSelectedFields.filter((field)=>field.name!==item.name);
                localSelectedFields.push({name:item.name,value:item.value})
                localPayloadData[item.name]=item.value;

                updateValueInStore(localItem);
                    
                    
                const sectionFields = {...RLPopupDetails};                      
                const calculatedFields= getTargetFields(sectionFields.fields,'calculateFields',localItem.name,localItem.value,localSelectedFields,localPayloadData, units,null,focusedFieldName,"useTabPanel_OnChange",preferences,defaultUnits);
                // console.log('In use PopupPanel:::handle Change :::: calculatedFields 00000 >>>>>>>>>>> ',calculatedFields,localSelectedFields,localPayloadData)
                if(calculatedFields?.length>0){
                    calculatedFields.forEach((field)=>{
                        if(field?.value?.actionType==='OnChange' && field?.ruleType==='Exec_API'){
                                                        // console.log('In useTabPanel:::calculatedFields:: field 111111 >>>>>>>>>>> ',field)
                            let config=ApiExecRequiredFields(field?.value,payloadData,preferences,units,defaultUnits,item,selectedResultRows[popupCounter]);
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
                                
                            })
                                                    
                        }
                    });
                }
                    // console.log('In use PopupPanel::: 111111 >>>> ',localSelectedFields,localPayloadData)
                    
                    
                
                
                // console.log('In use PopupPanel::: 44444 >>>> ',localSelectedFields,localPayloadData)
            };
            // const section = workflowSections.find(section => section.displayOrder === tabIndex + 1);
            
            
            
                
            activeTabMenu=UpdateSectionFields(RLPopupDetails)
            // console.log('RL Popup Change 11111 >>>>>>>>>>>> activeTabMenu >>>>>>>>>> ',activeTabMenu)
            
        }
        selectedItem={...payloadData}
    }
    //         break;
        
    // }
    const {heading, items, displayType} = activeTabMenu;
    // console.log('RL Popup Change 11111 >>>>>>>>>>>> In use PopupPanel 2222>>>>>>>>> ',activeTabMenu,RLPopupDetails)
    return {heading, items, displayType, selectedItem, UpdateSectionFields,handleChange,handleBlur,handleFocusedFieldName};
}

export default useRLPopupPanel;