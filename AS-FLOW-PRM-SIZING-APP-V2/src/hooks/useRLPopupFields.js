import { useEffect,  useState } from 'react';
import {   getSizingFields} from '../utils/validation';
import { useDispatch, useSelector } from 'react-redux';
import {  getRestrictedLiftModelDetails, onUpdateListOfFields, onUpdatePopupCounter, saveRestrictedLiftPopupDetails, setRLProceedModal } from '../store/slices/workflowSlice';
import { setSelectedResultRows } from '../store/slices/workflowPayloadSlice';
import useSaveSizing from './useSaveSizing';
import useSearchSizing from './useSearchSizing';
import useRLPopupPanel from './useRLPopupPanel';
// import { setFlowCalcPopupSaved } from '../store/slices/workflowPayloadSlice';

function useRLPopupFields(openFlag) {
  const dispatch = useDispatch();
  
  const {focusedFieldName} = useSelector(state=>state.generic);
  const {preferences,userData} = useSelector(state => state.auth);
  // Initialize state as an array to hold objects for each item
  const { heading, items, displayType, handleChange, handleBlur, handleFocusedFieldName } = useRLPopupPanel(openFlag);
  const {updateTcResponse,handleSaveWorkflowData}=useSaveSizing();
  const {searchSizing} =useSearchSizing(false);
  const {units,defaultUnits} = useSelector(state => state.uom);
  const { selectedFields,error,status, popupCounter } = useSelector(state => state.workflow);
  const { selectedResultRows,payloadData } = useSelector(state => state.workflowPayload);
  const [fieldData, setFieldData] = useState([]);
  const [popupFlag,setPopupFlag]=useState(false);
  const [apiHitFlag,setApiHitFlag]=useState(false);
  const [currentFieldData, setCurrentFieldData] = useState([]);
  const [localSelectedFields,setLocalSelectedFields]=useState([...selectedFields]);
  const [localPayloadData,setLocalPayloadData]=useState({...payloadData});
  const [okButtonDisabled,setOkButtonDisabled]=useState(false);
  const [closeButtonDisabled,setCloseButtonDisabled]=useState(false);
  const [RLValveOrifice,setRLValveOrifice]=useState(null);


useEffect(() => {
    // console.log('RL Popup Change 11111 >>>>>>>>>>>>: useEffect:::111111111111 >>>>>>>>>>> ',displayType,displayType === 'form',openFlag)
    if(openFlag){
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
        let updatedData=getSizingFields(localdisplayType,localfieldData,localselectedFields,localpayloadData,defaultUnits,localErrors,focusedFieldName,units,preferences,null);
        
        updatedData=updatedData.map((field)=>{
            if(field?.fieldName==='LiftRestriction'){
                return {
                    ...field,
                    options:localpayloadData['LROptions']!==undefined && localpayloadData['LROptions']!==null ? localpayloadData['LROptions'] : field?.options
                }
            }else{
                return field;
            }
        })
        
        return {updatedData};
    
}

useEffect(() => {
    // console.log('RL Popup Change 11111 >>>>>>>>>>>> 9999999 >>> 9999999 >>> In useFormFields :: useEffect:::444444 >>>>>>>>>>> ',apiHitFlag)
    if (displayType === 'popup' && currentFieldData !== undefined && currentFieldData !== null && currentFieldData.length > 0 ) {
        const selectedResultRow= selectedResultRows[popupCounter];
        const RatedFlowCapacity=selectedResultRow?.RatedFlowCapacity;
        const RequiredCapacity=selectedResultRow?.RequiredCapacity;
        const ModelNumber=selectedResultRow?.ModelNumber;
        const Orifice=selectedResultRow?.Orifice ?? selectedResultRow?.NewOrifice;
        setRLValveOrifice(`${ModelNumber} - ${Orifice}`);
        let localpayload={...payloadData,RatedFlowCapacity,RequiredCapacity};
        let localSelFields=[...selectedFields];
        localSelFields=localSelFields.filter((f1)=>f1.name!=='RatedFlowCapacity');
        localSelFields.push({name:'RatedFlowCapacity',value:RatedFlowCapacity});
        localSelFields=localSelFields.filter((f1)=>f1.name!=='RequiredCapacity');
        localSelFields.push({name:'RequiredCapacity',value:RequiredCapacity});
        const {updatedData}=UpdateFieldData(displayType,currentFieldData,localSelFields,localpayload,error,'Form Type');
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> 9999999 >>> In useFormFields :: useEffect:::33333 >>>>>>>>>>> ',updatedData.length)
        
        let newFieldData=[...updatedData];
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
}, [ currentFieldData,payloadData?.RestrictedLiftCapacity,payloadData?.LROptions]);

 useEffect(() => {
     if(apiHitFlag===true && status!=='loading'){
        // console.log('Popup Change 11111 >>>>>>>>>>>> >>>>>>>> 22222 >>>>> apiHitFlag, status>>>>>>>>>>>>33333 >>>>>>>> ',searchFlag,status,apiHitFlag,EnterTankData,fieldData?.length)
        
        
        setApiHitFlag(false);
        setPopupFlag(false);
        setOkButtonDisabled(false);
        setCloseButtonDisabled(false);
        
        // console.log(`Popup Change 11111 >>>>>>>>>>> :: handle Close >>>>>>>>>>>> apiHitFlag:: ${apiHitFlag}`);
    }
}, [status,fieldData,apiHitFlag]);

const handleGetRestrictedLiftModel=()=>{
    // console.log('Popup Change 11111 >>>>>>>>>>>>In handle Save Restricted Lift Popup >>>>>>>>>>>> ')
    // console.log(payloadData)
    // const data={
    //     "userId":userData?.EmailId,
    //     "SizingId": payloadData['SizingId']
    // };
    // const config={
    //     url:'/restrictedLift-data/get-data',
    //     method:'GET',
    //     data
    // };
    let localSelectedFields=[...selectedFields];
    let localPayloadData={...payloadData};
    const baseValues={
            'RestrictedLift':'FullLift',
            'IFR':'0',
            'DoNotExceedCapacity':'',
            'LiftRestriction':'',
            'RestrictedLiftCapacity':'',
            'LROptions':[],
            'RestrictedLiftErrors':[]
        }
    const baseValueKeys=Object.keys(baseValues);
    baseValueKeys.forEach((key)=>{
        localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==key);
        localSelectedFields.push({name:key,value:baseValues[key]});
        localPayloadData[key]=baseValues[key];
    });
    dispatch(onUpdateListOfFields({selectedFields:localSelectedFields,payloadData:localPayloadData}));
    // dispatch(getRestrictedLiftModelDetails(config))
    // .then((response)=>{
    //     if(response?.data===null){
    //         baseValueKeys.forEach((key)=>{
    //             localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==key);
    //             localSelectedFields.push({name:key,value:baseValues[key]});
    //             localPayloadData[key]=baseValues[key];
    //         });
    //     }else{
    //         const localData=response?.data;
    //         baseValueKeys.forEach((key)=>{
    //             localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==key);
    //             localSelectedFields.push({name:key,value:localData[key]});
    //             localPayloadData[key]=localData[key];
    //         });
    //     }
    //     // dispatch(onUpdateListOfFields({selectedFields:localSelectedFields,payloadData:localPayloadData}));
    // })
    // .catch((error)=>{
    //     console.error('Error fetching Restricted Lift Model Details:', error);
    //     baseValueKeys.forEach((key)=>{
    //             localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==key);
    //             localSelectedFields.push({name:key,value:baseValues[key]});
    //             localPayloadData[key]=baseValues[key];
    //         });
    // }).finally(()=>{
    //     dispatch(onUpdateListOfFields({selectedFields:localSelectedFields,payloadData:localPayloadData}));
    // });
}


const handleClose=(event,reason)=>{
    // console.log(`Popup Change 11111 >>>>>>>>>>>>In handle Close >>>>>>>>>>>> reason:: ${reason}`);
    if (reason && reason === "backdropClick") 
        return;

    handleGetRestrictedLiftModel();
    // let localSelectedFields=[...selectedFields];
    // let localPayloadData={...payloadData};

    // if(localPayloadData['RestrictedLift']!==undefined){
    //     localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='RestrictedLift');
    //     localSelectedFields.push({name:'RestrictedLift',value:'FullLift'});
    //     localPayloadData['RestrictedLift']='FullLift';
    // }

    // if(localPayloadData['IFR']!==undefined){
    //     localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='IFR');
    //     localSelectedFields.push({name:'IFR',value:'0'});
    //     localPayloadData['IFR']='0';
    // }
    // if(localPayloadData['DoNotExceedCapacity']!==undefined){
    //     localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='DoNotExceedCapacity');
    //     localSelectedFields.push({name:'DoNotExceedCapacity',value:''});
    //     localPayloadData['DoNotExceedCapacity']='';
    // }
    // if(localPayloadData['LiftRestriction']!==undefined){
    //     localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='LiftRestriction');
    //     localSelectedFields.push({name:'LiftRestriction',value:''});
    //     localPayloadData['LiftRestriction']='';
    // }
    // if(localPayloadData['RestrictedLiftCapacity']!==undefined){
    //     localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='RestrictedLiftCapacity');
    //     localSelectedFields.push({name:'RestrictedLiftCapacity',value:''});
    //     localPayloadData['RestrictedLiftCapacity']='';
    // }

    // if(localPayloadData['LROptions']!==undefined){
    //     localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='LROptions');
    //     localSelectedFields.push({name:'LROptions',value:[]});
    //     localPayloadData['LROptions']=[];
    // }

    // if(localPayloadData['RestrictedLiftErrors']!==undefined){
    //     localSelectedFields=localSelectedFields.filter((f1)=>f1.name!=='RestrictedLiftErrors');
    //     localSelectedFields.push({name:'RestrictedLiftErrors',value:[]});
    //     localPayloadData['RestrictedLiftErrors']=[];
    // }

    // dispatch(onUpdateListOfFields({selectedFields:localSelectedFields,payloadData:localPayloadData}));
    dispatch(onUpdatePopupCounter(popupCounter + 1));
    dispatch(setRLProceedModal(false));
    
    // console.log(`In Popup :: handle CloseIn handle Close >>>>>>>>>>>> PopupValueChange:: ${payloadData['PopupValueChange']}`);
}

const handleSaveRestrictedLiftPopup=()=>{
    // console.log('Popup Change 11111 >>>>>>>>>>>>In handle Save Restricted Lift Popup >>>>>>>>>>>> ')
    // console.log(payloadData)
    const updatedSelectedResultRows =[];
    selectedResultRows.forEach((row,index)=>{
        if(index===popupCounter){
            const updatedRow={...row};
            updatedRow['RestrictedLift']=payloadData['RestrictedLift'];
            updatedRow['RestrictedLiftCapacityUOM']=payloadData['FlowCapacityUOM'];
            updatedRow['RestrictedLiftCapacity']=payloadData['RestrictedLiftCapacity'];
            updatedSelectedResultRows.push(updatedRow);
        }else{
            updatedSelectedResultRows.push(row);
        }
    });
    dispatch(setSelectedResultRows(updatedSelectedResultRows));
    const data={
        "userId":userData?.EmailId,
        "Id": payloadData['Id'],
        "SizingId": payloadData['SizingId'],
        "ModelNumber": selectedResultRows[popupCounter]?.ModelNumber,
        "Orifice": selectedResultRows[popupCounter]?.Orifice ?? selectedResultRows[popupCounter]?.NewOrifice,
        "RestrictedLift":payloadData['RestrictedLift'],
        "RequiredFlow": payloadData['RequiredCapacity'],
        "RatedFlowCapacity": payloadData['RatedFlowCapacity'],
        "IFR": payloadData['RestrictedLift']=='FullLift'? '0' :payloadData['IFR'],
        "DoNotExceedCapacity": payloadData['RestrictedLift']=='FullLift'?'':payloadData['DoNotExceedCapacity'],
        "LiftRestriction": payloadData['RestrictedLift']=='FullLift'? '1' : payloadData['LiftRestriction'],
        "RestrictedLiftCapacity": payloadData['RestrictedLift']=='FullLift'? payloadData['RatedFlowCapacity'] : payloadData['RestrictedLiftCapacity'],
        "FlowCapacityUOM": payloadData['FlowCapacityUOM']
    };
    const config={
        url:'/restrictedLift-data/save-data',
        method:'POST',
        data
    };
    dispatch(saveRestrictedLiftPopupDetails(config)).then((response)=>{
        // console.log('Popup Change 11111 >>>>>>>>>>>>In handle Save Restricted Lift Popup Response >>>>>>>>>>>> ',response);
        // After saving, fetch the latest data
        // handleGetRestrictedLiftModel();
    }).catch((error)=>{
        console.error('Error saving Restricted Lift Popup Details:', error);
    }).finally(()=>{
        handleGetRestrictedLiftModel();
    });
}

const handleOk=()=>{
    if(!(payloadData['RestrictedLift']=='RestrictedLiftSpecify' && payloadData['RestrictedLiftErrors']?.length>0)){
        // handleSaveWorkflowData(3);
        handleSaveRestrictedLiftPopup();
        dispatch(onUpdatePopupCounter(popupCounter + 1));
        dispatch(setRLProceedModal(false));
    }
}

const handleBlurField=(item)=>{
    // console.log('On Blur >>>>>>>>>>>> 33333',item);
    handleBlur(item);
}

  return {
    heading : `${heading}${RLValveOrifice ? ` : ${RLValveOrifice}` : ''}`,
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

export default useRLPopupFields;