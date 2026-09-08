import { useDispatch, useSelector } from "react-redux";
import { onUpdateFields } from "../store/slices/workflowSlice";
import { filterDimensionUnits } from "../utils/validation";
import { getConvertedValue } from "../utils/convertUnit";

const useUpdateFieldUOM = () => {
    const dispatch = useDispatch();
    const {selectedFields, workflowSections,workflowPopup } = useSelector(state => state.workflow);
    const { payloadData } = useSelector(state => state.workflowPayload);
    const { units,defaultUnits } = useSelector(state => state.uom);
    const { activeMenu } = useSelector(state => state.navigation);
    const { isAdvanced } = useSelector((state) => state.layout);

    const updateFieldUOM = (item,popupflag=false,mirrorId=undefined,UomFieldName=undefined) => {
        const oldUomValue = payloadData[item.name];
        
        // const sectionFields = workflowSections.find(section => section.displayOrder === activeMenu + 1);
        // console.log('In useUnitConverter :: Popup Change 11111 >>>>>>>>>>>> 9999999 >>>>>>> In useUpdateFieldUOM::: updateFieldUOM :: item 11111>>>>>>>>>>>>>>> ',popupflag,payloadData['UomFieldName'],UomFieldName,oldUomValue,item,activeMenu,selectedFields)
        dispatch(onUpdateFields({name:`prev${item.name}`,value:oldUomValue,page:"updateFieldUOM 1"}));
        dispatch(onUpdateFields({name:item.name,value:item.value,page:"updateFieldUOM 1"}));
        if(popupflag){
            // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>>>>> In useUpdateFieldUOM :: newVal 111111 ::: ',workflowPopup?.fields)
            workflowPopup?.fields.forEach((field) => {
                // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>>>>> In useUpdateFieldUOM :: newVal 22222 ::: ',field?.fieldName,field.UomFieldName === item.name , field?.dimensionName[0]!=="%")
                if(UomFieldName===field?.UomFieldName && field?.dimensionName[0]!=="%"){
                    // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>>>>> In useUpdateFieldUOM :: newVal 33333 ::: ',payloadData[field.fieldName])
                    const fieldValue = payloadData[field.fieldName];
                    if(fieldValue!==undefined && fieldValue!==null && fieldValue!=='' && !isNaN(fieldValue)){
                        const {dimensionUnits,unitValue}=filterDimensionUnits(defaultUnits,selectedFields,field.UomFieldName,item.value,oldUomValue,field?.dimensionName,units)
                        if(unitValue!==undefined && unitValue!==null){
                            const newValue=getConvertedValue(fieldValue,oldUomValue,field.fieldName,item.value,dimensionUnits,units,selectedFields,payloadData)
                            // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>>>>> In useUpdateFieldUOM :: newVal 66666 ::: ',field.fieldName,newValue)
                            if(field.fieldName!==undefined && field.fieldName!==null && field.fieldName!=='' &&  field.fieldName!=='%'){
                                dispatch(onUpdateFields({name:field.fieldName,value:newValue,page:"updateFieldUOM 2"}))
                            }
                        }
                    }
                }
                // update DBUomFieldName 
                if(field.DbUomFieldName !==undefined && field.UomFieldName === item.name && field?.dimensionName[0]!=="%"){
                    // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>>>>> In useUpdateFieldUOM :: newVal 77777 ::: ',field.DbUomFieldName, field.UomFieldName, item)
                    dispatch(onUpdateFields({name:field.DbUomFieldName,value:item.value,page:"updateFieldUOM 5"}))
                }
            })
        }else{
            // const isPressureOnly=payloadData['IsPressureOnly'];
            // const isVacuumOnly=payloadData['IsVacuumOnly'];
            // const checkUOmflag=isPressureOnly===true || isVacuumOnly===true?false:true;
            workflowSections.forEach((section) => {
                // console.log('In useUnitConverter :: In useUpdateFieldUOM::: updateFieldUOM :: checkUOmflag 22222>>>>>>>>>>>>>>> ',isPressureOnly,isVacuumOnly,checkUOmflag,section.displayOrder, activeMenu + 1)
                if(!isAdvanced && 
                    section.displayOrder !== activeMenu + 1){
                    // console.log('In useUnitConverter :: In useUpdateFieldUOM::: updateFieldUOM :: section.fields 333333>>>>>>>>>>>>>>> ',oldUomValue,item.value,UomFieldName)
                    section.fields.forEach((field) => {
                        // console.log('In useUnitConverter ::: section fields 44444 ::: ',field.fieldName,UomFieldName,field?.UomFieldName,field?.dimensionName[0] )
                        if(UomFieldName===field?.UomFieldName && field?.dimensionName[0]!=="%"){
                            const fieldValue = payloadData[field.fieldName];
                            // console.log('In useUnitConverter ::: section fields 5555 ::: ',field.fieldName,fieldValue,oldUomValue,item.value,UomFieldName)
                            if(fieldValue!==undefined && fieldValue!==null && fieldValue!=='' && !isNaN(fieldValue)){
                                const {dimensionUnits,unitValue}=filterDimensionUnits(defaultUnits,selectedFields,field.UomFieldName,item.value,oldUomValue,field?.dimensionName,units)
                                // console.log('In useUnitConverter : 66666 >>>>>>>>>>>>>>> useUnitConvertor 2>>>> 11111>>>>> ',field.fieldName,dimensionUnits,unitValue);
                                if(unitValue!==undefined && unitValue!==null){
                                    const newValue=getConvertedValue(fieldValue,oldUomValue,field.fieldName,item.value,dimensionUnits,units,selectedFields,payloadData)
                                    // console.log('In useUnitConverter : 77777 >>>>>>>>>>>>>>> useUnitConvertor 2>>>> 22222>>>>> ',field.fieldName,newValue,fieldValue)
                                    if(field.fieldName!==undefined && field.fieldName!==null && field.fieldName!=='' &&  field.fieldName!=='%'){
                                        dispatch(onUpdateFields({name:field.fieldName,value:newValue,page:"updateFieldUOM 2",mirrorId:mirrorId}))
                                    }
                                }
                            }
                        }
                        // update DBUomFieldName 
                        if(field.DbUomFieldName !==undefined && UomFieldName===field?.UomFieldName &&field?.dimensionName[0]!=="%"){
                            // console.log('In useUpdateFieldUOM :: newVal 111111 :::55 ',field.DbUomFieldName, field.UomFieldName, item)
                            dispatch(onUpdateFields({name:field.DbUomFieldName,value:item.value,page:"updateFieldUOM 5"}))
                        }
                    })
                }else{
                    section.fields.forEach((field) => {
                        // const field = section.fields.find((field) => field.UomFieldName === item.name);
                        if(field.fieldDisplayOrder==1  && UomFieldName===field?.UomFieldName && field?.dimensionName[0]!=="%"){
                            // console.log('In useUpdateFieldUOM :: newVal 111111 ::: ',payloadData,payloadData[field.fieldName])
                            const fieldValue = payloadData[field.fieldName];
                            if(fieldValue!==undefined && fieldValue!==null && fieldValue!=='' && !isNaN(fieldValue)){
                                const {dimensionUnits,unitValue}=filterDimensionUnits(defaultUnits,selectedFields,field.UomFieldName,item.value,fieldValue,field?.dimensionName,units)
                                if(unitValue!==undefined && unitValue!==null){
                                    // console.log('Popup Change 11111 >>>>>>>>>>>>>>> useUnitConvertor 3>>>> 11111>>>>> ',dimensionUnits,unitValue)
                                    const newValue=getConvertedValue(fieldValue,oldUomValue,field.fieldName,item.value,dimensionUnits,units,selectedFields,payloadData)
                                    // console.log('Popup Change 11111 >>>>>>>>>>>>>>> useUnitConvertor 3>>>> 22222 >>>>',field.fieldName,newValue,fieldValue)
                                    if(field.fieldName!==undefined && field.fieldName!==null && field.fieldName!=='' &&  field.fieldName!=='%'){
                                        dispatch(onUpdateFields({name:field.fieldName,value:newValue,page:"updateFieldUOM 3",mirrorId:mirrorId}))
                                    }
                                }
                            }
                        }
                        // update DBUomFieldName 
                        // console.log('In useUpdateFieldUOM :: newVal 111111 ::: 00',field.DbUomFieldName, field.UomFieldName, item, field?.dimensionName)
                        if(field.DbUomFieldName !==undefined && UomFieldName===field?.UomFieldName && field?.dimensionName[0]!=="%"){
                            // console.log('In useUpdateFieldUOM :: newVal 111111 ::: 44',field.DbUomFieldName, field.UomFieldName, item)
                            dispatch(onUpdateFields({name:field.DbUomFieldName,value:item.value,page:"updateFieldUOM 4"}))
                        }
                    })
                }
            });
        }
    }
  return {
    updateFieldUOM
  }
}

export default useUpdateFieldUOM;