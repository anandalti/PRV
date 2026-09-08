import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fieldCalculation_ExecFunction, fieldCalculationAPI, onUpdateError, onUpdateFields, onUpdateListOfFields, setEnterTankData, setFieldChangeFlag } from "../store/slices/workflowSlice";
import useFormFields from "./useFormFields";
import { setFocusedFieldName } from "../store/slices/genericSlice";
import { funcExecRequiredFields, getTargetFields } from "../utils/validation";

const useTankDataModal = (tabIndex) => {
    const dispatch = useDispatch();
    // const { focusedFieldName,handleChange, handleBlur, handleFocusedFieldName } = useTabPanel(tabIndex);
    const { payloadData } = useSelector(state => state.workflowPayload);
    const { preferences } = useSelector(state => state.auth);
    const { units,defaultUnits } = useSelector(state => state.uom);
    const {selectedFields,error,selectedWorkflow,EnterTankData,workflowPopup,fieldChangeFlag } = useSelector(state => state.workflow);
    
    const { UpdateFieldData,UpdateSectionFields} = useFormFields(tabIndex);
    const [fieldData, setFieldData] = useState([]);
    const [header,setHeader]=useState('');
    const [popupOpen, setPopupOpen] = useState(EnterTankData);
    const [popupPayloadData, setPopupPayloadData] = useState({});
    const [popupselectedFields, setPopupSelectedFields] = useState([]);
    const [popupErrors, setPopupErrors] = useState([]);
    const [stateChangeFlag, setStateChangeFlag] = useState(false);
    const [popupItems, setPopupItems] = useState([]);
    const [popupDisplayType, setPopupDisplayType] = useState('');
    const [popupFocusedFieldName, setPopupFocusedFieldName] = useState('');
    const [popupWorkflowId, setPopupWorkflowId] = useState(selectedWorkflow);
 

    const updatePopupStateValue = (item,localpayloadData,localselectedFields,saveFlag=0) => {
        if(item?.name!=='%'){
            // dispatch(onUpdateFields({...item,page:"useTankDataModal"}));
            const tempPayload={
                ...localpayloadData,
                [item.name]:item.value
            }
            
            let localFilteredFields=localselectedFields.map((field)=>{
                // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 update PopupStateValue :: 0000 >>',field.name,item.name)
                if(field.name===item.name){
                    return {...field,value:item.value}
                }
                return field;
            });
            setPopupPayloadData({...tempPayload})
            setPopupSelectedFields([...localFilteredFields]);

            if(saveFlag==2){
                dispatch(setEnterTankData(false));
                let localUpdatedFields={
                    selectedFields:localFilteredFields,
                    payloadData:tempPayload
                }
                // fieldData.forEach((field)=>{
                //     const fieldName=Array.isArray(field.fieldName)?field.fieldName[0]:field.fieldName;
                //     localUpdatedFields.push({name:fieldName,value:tempPayload[fieldName],page:"useTankDataModal"});
                //     // dispatch(onUpdateFields({name:fieldName,value:tempPayload[fieldName],page:"useTankDataModal"}));
                // });

                dispatch(onUpdateListOfFields(localUpdatedFields));
                
                setPopupOpen(false);
            }else if(saveFlag==1){
                dispatch(setEnterTankData(false));
                dispatch(onUpdateFields({name:item.name,value:item.value,page:"useTankDataModal"}));
                
                setPopupOpen(false);
            }else{
                dispatch(onUpdateFields({name:item.name,value:item.value,page:"useTankDataModal"}));
            }
        }
    }

    const updateErrors = (validationFields) => {
        if(validationFields.length>0){
            let localErrors=[...validationFields]
            setPopupErrors(localErrors);
        }else{
            setPopupErrors([])
        }
    }

    useEffect(() => {
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>  22222 >>>>>>',workflowPopup?.fields?.length>0 , EnterTankData , payloadData?.EnterTankData,payloadData?.CalculateFlowRate);
        if(workflowPopup?.fields?.length>0 && (EnterTankData || payloadData?.EnterTankData || (payloadData?.CalculateFlowRate && [3,23].indexOf(selectedWorkflow)!==-1)) ){
            const {heading, items, displayType}=UpdateSectionFields(workflowPopup);
            setPopupWorkflowId(selectedWorkflow);
            setPopupItems(items);
            setPopupDisplayType(displayType);
            // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 useTankDataModal :: 3333 >>>>>>',selectedFields,payloadData);
            setPopupSelectedFields([...selectedFields]);
            setPopupPayloadData({...payloadData});
            if (displayType === 'popup' && items !== undefined && items !== null && items.length > 0 ) {
                // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 useTankDataModal :: 444 >>>>>>',displayType,items)
                
                const {updatedData,uomFields}=UpdateFieldData(displayType,items,selectedFields,payloadData,popupErrors,'Popup Fields');
                
                let localPayloadDta={...payloadData};
                let localSelectedFields=[...selectedFields];
                // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 useTankDataModal :: 5555 >>>>>>',updatedData,uomFields,localPayloadDta,localSelectedFields);
                uomFields?.forEach((field)=>{
                    localPayloadDta={...localPayloadDta,[field.name]:field.value}
                    localSelectedFields=localSelectedFields.map((item)=>{
                        if(item.name===field.name){
                            return {...item,value:field.value}
                        }
                        return item;
                    });
                });
                if(localPayloadDta['CalculateFlowRate']!==undefined){
                    localPayloadDta['CalculateFlowRate']=true;
                    localSelectedFields=localSelectedFields.map((field)=>{
                        if(field.name==='CalculateFlowRate'){
                            return {...field,value:true}
                        }
                        return field;
                    });
                }
                setHeader(heading);
                setFieldData(updatedData);
                setPopupOpen(true);
                updatePopupStateValue({name:'EnterTankData',value:true},{...localPayloadDta},[...localSelectedFields]);
            }
            // dispatch(setEnterTankData(true));
        }else{
            // console.log('Popup 22222 >>>>>>>>>>>> useTankDataModal :: 5555 >>>>>>',selectedFields,payloadData);
            setPopupOpen(false);
            dispatch(setEnterTankData(false));
            updatePopupStateValue({name:'EnterTankData',value:false},{...popupPayloadData},[...popupselectedFields]);
        }

    },[workflowPopup,EnterTankData,payloadData?.EnterTankData,payloadData?.CalculateFlowRate]);

    const handleClose = (event,reason) => {
        // console.log('Handle Close >>>>>>>>>>>> ',event,reason);
        if (reason && reason === "backdropClick") 
            return;

        let localSelectedFields=[...popupselectedFields];
        let localPayloadData={...popupPayloadData};

        if(localPayloadData['CalculateFlowRate']!==undefined){
            localPayloadData['CalculateFlowRate']=false;
            localSelectedFields=localSelectedFields.map((field)=>{
                if(field.name==='CalculateFlowRate'){
                    return {...field,value:false}
                }
                return field;
            });
        }
        updatePopupStateValue({name:'EnterTankData',value:false},{...localPayloadData},[...localSelectedFields],1);
        // dispatch(setEnterTankData(false));
        
    };

    const handleOk = () => {
        
        let localSelectedFields=[...popupselectedFields];
        let localPayloadData={...popupPayloadData};

        if(localPayloadData['CalculateFlowRate']!==undefined){
            localPayloadData['CalculateFlowRate']=false;
            localSelectedFields=localSelectedFields.map((field)=>{
                if(field.name==='CalculateFlowRate'){
                    return {...field,value:false}
                }
                return field;
            });
        }

        updatePopupStateValue({name:'EnterTankData',value:false},{...localPayloadData},[...localSelectedFields],2);
    }

    useEffect(() => {
        // console.log(`Popup Change 11111 >>>>>>>>>>>> 9999999 >>>>> 66666 >>>> ${stateChangeFlag} >>>>>>>> `,selectedFields,popupErrors);
        if(stateChangeFlag){
            setPopupSelectedFields([...selectedFields]);
            setPopupPayloadData({...payloadData});
            // console.log('Popup 1111 >>>>>>>>>>>> workflowPopup:: 66666 >>>>>>',popupselectedFields,popupPayloadData);
            const {updatedData,uomFields}=UpdateFieldData(popupDisplayType,popupItems,selectedFields,payloadData,popupErrors,'Popup Fields');
            // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 useTankDataModal :: 77777 >>>>>>',stateChangeFlag,updatedData,uomFields,popupselectedFields,popupPayloadData)
            setFieldData(updatedData);
            setStateChangeFlag(false);
        }

    },[selectedFields,popupErrors]);

    useEffect(() => {
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 useTankDataModal :: 88888 >>>>>>',stateChangeFlag,popupselectedFields,popupPayloadData)
        if(fieldChangeFlag){
            const {updatedData,uomFields}=UpdateFieldData(popupDisplayType,popupItems,selectedFields,payloadData,popupErrors,'Popup Fields');
            // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 useTankDataModal :: 99999 >>>>>>',stateChangeFlag,updatedData,uomFields,popupselectedFields,popupPayloadData)
            setFieldData(updatedData);
            dispatch(setFieldChangeFlag(false));
        }

    },[selectedFields])

    

    const handlePopupChange = (item) => {
        let localItem = {...item};
        let localSelectedFields=selectedFields.map((field)=>{
            if(field.name===item.name){
                return {...field,value:item.value}
            }
            return field;
        });
        let localPayloadData={...payloadData,[item.name]:item.value}
        setStateChangeFlag(true);
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>>>>> :: handlePopupChange >>>>> ',localItem,popupselectedFields);
        updatePopupStateValue(item,{...localPayloadData},[...localSelectedFields]);   
        
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 11111 ::: 11111 >>>>>>>>>>>> ',popupselectedFields,localSelectedFields,popupPayloadData,localPayloadData);
        

        const defaultValueFields= getTargetFields(workflowPopup.fields,'defaultValue',localItem.name,localItem.value,localSelectedFields,localPayloadData, units,null,popupFocusedFieldName,'useTankDataModal_OnChange',preferences,defaultUnits);
                        // console.log('In useTabPanel :: defaultValueFields >>>>>>> ',defaultValueFields,localItem)
        defaultValueFields.forEach((field)=>{
            // console.log('In useTabPanel:::defaultValueFields >>>>>>>>>>> ',field)
            if(field?.nextRound!==undefined && field?.nextRound!==null && field?.nextRound!=='' && !field?.nextRound){
                localSelectedFields=localSelectedFields.map((field)=>{
                    if(field.name===item.name){
                        return {...field,value:item.value}
                    }
                    return field;
                });
                localPayloadData={...localPayloadData,[item.name]:item.value}
                updatePopupStateValue({name:field.name,value:field.value},{...localPayloadData},[...localSelectedFields]);
            }else{
                handlePopupChange({name:field.name,value:field.value})
            }
        });

        const calculatedFields= getTargetFields(workflowPopup.fields,'calculateFields',localItem.name,localItem.value,localSelectedFields,localPayloadData, units,null,popupFocusedFieldName,"useTankDataModal_OnChange",preferences,defaultUnits);
        // console.log('In useTabPanel:::handle Change :::: calculatedFields 00000 >>>>>>>>>>> ',calculatedFields)
        if(calculatedFields?.length>0){
            calculatedFields.forEach((field)=>{
                if(field?.ruleType==='Exec_Function_OnChange'){
                    let config=funcExecRequiredFields(field?.value,localPayloadData,preferences,units,defaultUnits,item);
                    dispatch(fieldCalculation_ExecFunction(config))
                    .then((res)=>{
                        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> On Change :: fieldCalculation_ExecFunction :: response >>>>>>>>>> ',res)
                        let resultFields=res.payload;
                        
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
                        const validationFields= getTargetFields(workflowPopup.fields,'validations',item.name,item.value,localSelectedFields,localPayloadData, units, error,popupFocusedFieldName,"useTankDataModal_OnChange",null,defaultUnits);
                        // console.log('On Blur ::::  validations 11111>>>>>>> ',focusedFieldName,validationFields,response,localSelectedFields,localPayloadData)
                        updateErrors(validationFields);

                        setPopupPayloadData({...localPayloadData});
                        setPopupSelectedFields([...localSelectedFields]);
                    })
                
                }
                
            });
        }

        let validateFlag=true;
        if(popupFocusedFieldName!=='' && popupFocusedFieldName!==undefined && popupFocusedFieldName!==null){
            if(popupFocusedFieldName===localItem.name){
                if(localItem?.onchangevalidation!==undefined){
                    validateFlag=localItem?.onchangevalidation;
                }
            }
        }

        if(localItem?.type==='checkbox'){
            handlePopupBlur(localItem);
        }else if(validateFlag){
            const validationFields= getTargetFields(workflowPopup.fields,'validations',localItem.name,localItem.value,localSelectedFields,localPayloadData, units, error,popupFocusedFieldName,"useTankDataModal_OnChange",null,defaultUnits);
            // console.log(' validations 11111>>>>>>> ',localItem,validationFields.length,validationFields)
            updateErrors(validationFields);
        }
        
        // const {heading, items, displayType}=UpdateSectionFields(workflowPopup);
    }

    const handlePopupBlur = (item) => {
        // console.log('Popup Change 22222>>>>>>>>>>>> ',item,fieldData);
        setStateChangeFlag(true);
        let localSelectedFields=selectedFields.map((field)=>{
            if(field.name===item.name){
                return {...field,value:item.value}
            }
            return field;
        });
        let localPayloadData={...payloadData,[item.name]:item.value}
        setPopupFocusedFieldName("");
        dispatch(setFocusedFieldName(""));
        updatePopupStateValue(item,{...localPayloadData},[...localSelectedFields]);
        // let localSelectedFields=[...popupselectedFields,item]
        // let localPayloadData={...popupPayloadData,[item.name]:item.value}
        const calculatedFields= getTargetFields(workflowPopup.fields,'calculateFields',item.name,item.value,localSelectedFields,localPayloadData, units,null,popupFocusedFieldName,"useTankDataModal_OnBlur",preferences,defaultUnits);
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 :: In useTabPanel:::calculatedFields:: 00000 >>>>>>>>>>> ',calculatedFields)
        if(calculatedFields?.length>0){
            calculatedFields.forEach((field)=>{
                // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 :::calculatedFields:: field 00000 >>>>>>>>>>> ',field?.ruleType,item)
                if(field?.ruleType==='API_FUNCTION_CALL'){
                    const config={...field?.value,TemperatureUOM:preferences?.SystemTemperature,checkSuperCritical:field?.checkSuperCritical}
                    dispatch(fieldCalculationAPI(config)).then((response)=>{
                        // console.log('API_FUNCTION_CALL: Response >>>>>>>>>>>>>>>> ',response,localSelectedFields,localPayloadData)
                        let newPayloadData={...localPayloadData}
                        const newSelectFields=localSelectedFields.map((field)=>{
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
                        
                        const validationFields= getTargetFields(workflowPopup.fields,'validations',item.name,item.value,newSelectFields,newPayloadData, units, error,popupFocusedFieldName,"useTankDataModal_OnBlur",null,defaultUnits);
                        
                        updateErrors(validationFields);
                        
                    })
                }else if(field?.ruleType==='Exec_Function'){
                    let config=funcExecRequiredFields(field?.value,localPayloadData,preferences,units,defaultUnits,item);
                    dispatch(fieldCalculation_ExecFunction(config))
                    .then((res)=>{
                        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> OnBlur :::  fieldCalculation_ExecFunction ::: Response>>>>>>>>>> ',res)
                        let resultFields=res.payload;
                        
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
                        });
                        
                        const validationFields= getTargetFields(workflowPopup.fields,'validations',item.name,item.value,localSelectedFields,localPayloadData, units, error,popupFocusedFieldName,"useTankDataModal_OnBlur",null,defaultUnits);
                        // console.log('On Blur ::::  validations 11111>>>>>>> ',popupFocusedFieldName,validationFields,response,localSelectedFields,localPayloadData)
                        updateErrors(validationFields);

                        setPopupPayloadData({...localPayloadData});
                        setPopupSelectedFields([...localSelectedFields]);
                        
                    })
                }else{
                    const validationFields= getTargetFields(workflowPopup.fields,'validations',item.name,item.value,localSelectedFields,localPayloadData, units, error,popupFocusedFieldName,"useTankDataModal_OnBlur",null,defaultUnits);
                    updateErrors(validationFields);
                }
                
            });
        }else{
            
            const validationFields= getTargetFields(workflowPopup.fields,'validations',item.name,item.value,localSelectedFields,localPayloadData, units, error,popupFocusedFieldName,"useTankDataModal_OnBlur",null,defaultUnits);
            updateErrors(validationFields);
           
        }
        setStateChangeFlag(true);
    }

    const handlePopupFocusedFieldName = (item) => {
        // console.log('Popup Change 33333 :: handlePopupFocusedFieldName>>>>>>>>>>>> ',item,fieldData);
        // handleFocusedFieldName(item);
        setPopupFocusedFieldName(item);
        dispatch(setFocusedFieldName(item));
    }
    // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>>>>>  ',popupOpen,EnterTankData);
  return {
    header,
    popupErrors,
    fieldData,
    popupOpen,
    popupFocusedFieldName,
    popupselectedFields,
    popupPayloadData,
    popupWorkflowId,
    handleOk,
    handleClose,
    handlePopupChange, 
    handlePopupBlur, 
    handlePopupFocusedFieldName
  }
}

export default useTankDataModal