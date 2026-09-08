import { useDispatch, useSelector } from "react-redux";
import {  onSelectFluidType, onSelectSizingMethodology, onSelectValveCategory,  onUpdateSearchSizingModal, searchSizingBySizingId, onUpdateSearchFlag, onUpdateCallResultAPI, onUpdateError, onUpdateMultipleFields } from "../store/slices/workflowSlice";
import { onSelectMenu, updateNavigationMenu } from "../store/slices/navigationSlice";
import { useEffect, useState } from "react";
import { getTargetFields } from "../utils/validation";
// import { setSelectedOrificeArea } from "../store/slices/workflowPayloadSlice";
// import { OrificeDropdownOptions } from "../utils/constants";
import { updateSnakebar } from "../store/slices/preferenceSlice";
const useSearchSizing=(flag=true)=>{
    const dispatch = useDispatch();
   
    const {workflows, searchSizingModal, sizingDetails, SizingIdError, workflowSections, searchFlag, selectedFields, error} = useSelector(state => state.workflow)
    const { payloadData } = useSelector(state => state.workflowPayload);
    const {units} = useSelector(state=> state.uom)
    const {focusedFieldName} = useSelector(state=>state.generic);
    const [errorMsg, setErrorMsg]=useState(null);

    const handleSearchSizing=()=>{
        setErrorMsg()
        dispatch(onUpdateSearchSizingModal(!searchSizingModal))
    }

    const searchSizing = async (sizingId) => {
        if(sizingId.startsWith("PRV")){
            setErrorMsg()
            await dispatch(searchSizingBySizingId(sizingId)).then(response=>{
                // console.log(response.payload.success,'response.payload.success')
                return response.payload.success
            })
        }else{
            setErrorMsg('Please enter a valid sizing Id')
        }
    };

    useEffect(()=>{
    //    console.log('inside UseSearchSizing >>>> ', sizingDetails, SizingIdError , searchSizingModal)
        if(sizingDetails !== null && !SizingIdError && !searchSizingModal && searchFlag && flag){
            let workflow = workflows.find(wf => wf.Id === sizingDetails.WorkFlowId);
            // console.log('sizingDetails >>>>>>>>>> ',sizingDetails)
            dispatch(onSelectValveCategory(workflow.ValveCategoryId))
            dispatch(onSelectFluidType(workflow.FluidTypeId))
            dispatch(onSelectSizingMethodology(workflow.SizingMethodologyId))
            // const newSelectedOrificeArea = OrificeDropdownOptions.find(option => option.value === sizingDetails?.OrificeAreaUOM?.value);
            // dispatch(setSelectedOrificeArea(newSelectedOrificeArea));
            
            let localSizingDetails = {...sizingDetails};
            let tempFields=workflowSections?.find(section=>section.sectionName==='temperatureProperties');
            if(tempFields !==undefined){
                tempFields = tempFields.fields;
                const waterRelievingTempField = tempFields.find(field => field.fieldName === 'WaterRelieving');
                // console.log('sizingDetails >>>>>>>>>> ',tempFields,waterRelievingTempField);
                if(waterRelievingTempField!== undefined ){
                    localSizingDetails['WaterRelieving'] = localSizingDetails['Relieving']
                }
            }
            // console.log('sizingDetails >>>>>>>>>> ',localSizingDetails);
            dispatch(onUpdateMultipleFields(localSizingDetails))
            setTimeout(() => {
                
                if(workflowSections.length>0){
                    let menusArr = []
                    let localErrors = []
                    workflowSections.forEach(sectionFields => {
                        if(sectionFields.fields){
                            let errorType ='';
                            let isCompleted = !sectionFields.fields.some(field => {
                              
                                const validationFields= getTargetFields(sectionFields.fields,'validations',field.fieldName,sizingDetails[field.fieldName],selectedFields,payloadData, units, error,focusedFieldName,"searchSizing");
                                
                                if(validationFields.length>0){
                                    errorType = validationFields.find(
                                        errorItem => errorItem?.value?.error?.type === 'error'
                                      ) ? 'error' : 'warning';

                                    localErrors=[...localErrors, ...validationFields]
                                    dispatch(onUpdateError(localErrors));
                                    return errorType==='error';
                                }else{
                                   return sectionFields.fields.some(field => {
                                        let fieldValue = sizingDetails[field.fieldName];
                                        return (fieldValue === null || fieldValue === undefined || fieldValue === '') && field.mandatory === true;
                                    });
                                   // return false;
                                }
                            });
                            let menuItem = {
                                "id":sectionFields.displayOrder,
                                "name":sectionFields.sectionLabel,
                                "isCompleted":isCompleted,
                                "errorType":errorType
                            }
                            menusArr.push(menuItem)
                        }
                    });
                    let SizingTabIndex = sizingDetails.SizingTabIndex;
                    
                    if(menusArr.length+3 <= SizingTabIndex){
                        SizingTabIndex = SizingTabIndex-1
                       // menusArr.push({ id: sizingDetails.SizingTabIndex+1, name: RESULT_PAGE_TITLE, isCompleted: true })
                        dispatch(onUpdateCallResultAPI(true))
                    }
                    // console.log('inside UseSearchSizing >>>>22111', menusArr)
                    dispatch(updateNavigationMenu(menusArr))
                    dispatch(onSelectMenu(SizingTabIndex?SizingTabIndex:3))
                    dispatch(onUpdateSearchFlag(true));
                    const msg=`Sizing Id ${sizingDetails.SizingId} fetched successfully`
                    dispatch(updateSnakebar({status: true, message: msg, severity: "success"}));
                }
            }, 300);
        }  
        if(SizingIdError){
            setErrorMsg('Sizing Id does not exist') 
        }
    },[sizingDetails, SizingIdError, workflowSections])

    return {
        searchSizing,
        handleSearchSizing,
        errorMsg
    }
}
export default useSearchSizing