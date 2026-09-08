import { useDispatch, useSelector } from "react-redux";
import { onUpdateFields } from "../store/slices/workflowSlice";
import { convertUnitDiffDims } from "../utils/convertUnit";

const useTabUpdateUomValues =()=>{
    const dispatch = useDispatch();
    const {selectedFields, workflowSections,workflowPopup,selectedWorkflow} = useSelector(state=> state.workflow)
    const {payloadData} = useSelector(state=> state.workflowPayload)
    const {units, defaultUnits} = useSelector(state=> state.uom)
    const updateUomValue=(DisplayUnitSystem)=>{
        // console.log('In useTabUpdateUomValues >>>>>>> inside use TabUpdateUomValues >>> ', DisplayUnitSystem, payloadData['DisplayUnitSystem'])
        let fromDisplayUnitSystem = ['All', 'English'].includes(payloadData['DisplayUnitSystem'])?'English':'Metric';
        let toDisplayUnitSystem = ['All', 'English'].includes(DisplayUnitSystem)?'English':'Metric';
        // console.log('In useTabUpdateUomValues >>>>>>> ', DisplayUnitSystem, fromDisplayUnitSystem, toDisplayUnitSystem)
        
            if(workflowSections.length){
                workflowSections.forEach(section=>{
                    if(section.fields){
                        section.fields.forEach(field=>{
                            if(field.UomFieldName!=='' && field.UomFieldName!==null && field.UomFieldName!==undefined && field.dimensionName!==undefined){
                               // console.log('inside use TabUpdateUomValues >>1',field.dimensionName, field.UomFieldName, field.fieldName)
                                //if(payloadData[field.UomFieldName]){
                                    let dimensionName = field.dimensionName;
                                    if(dimensionName!==null && dimensionName!==undefined && dimensionName[0]!=='%'){
                                        let dimensionUnits=[]
                                        if(Array.isArray(dimensionName)){
                                          dimensionName.forEach((item)=>{
                                            const dimensionUnit=units[item];
                                            dimensionUnits=[...dimensionUnits,...dimensionUnit]
                                          })
                                        }else{
                                          dimensionUnits=units[dimensionName];
                                        }
                                        const uomValue=Array.isArray(field?.dimensionName)?field?.dimensionName[0]:field?.dimensionName;
                                        let unitValue = payloadData[field.UomFieldName];
                                        if(unitValue===undefined || unitValue===null || unitValue===''){
                                            unitValue = defaultUnits[fromDisplayUnitSystem][uomValue]
                                        }
                                        //console.log('inside use TabUpdateUomValues >>11',toDisplayUnitSystem, fromDisplayUnitSystem, uomValue, field.fieldName)
                                        
                                        const newUnitValue=defaultUnits[toDisplayUnitSystem][uomValue];
                                        //const newUomobject=dimensionUnits.find(unit => unit.UnitKey===newUnitValue);
                                        //const exitingUom=dimensionUnits.find(unit => unit.UnitKey===payloadData[field.UomFieldName]);
                                        
                                        //console.log('inside use TabUpdateUomValues >>>>1111',unitValue, newUnitValue, field.fieldName)
                                        if(unitValue !== newUnitValue && newUnitValue){
                                            if(unitValue!==undefined && unitValue!==null){
                                                //let newunitValue=defaultUnits[DisplayUnitSystem][dimensionUoms];
                                                const oldUom=dimensionUnits.find(unit => unit.UnitKey===unitValue);
                                                const newUom=dimensionUnits.find(unit => unit.UnitKey===newUnitValue);
                                                let localValue=selectedFields.find((item)=>item.name===field.fieldName);
                                                if(localValue===undefined){
                                                    if(field.fieldName.includes("|")){
                                                        localValue = field.fieldName.split("|").reduce((acc, curr) => {
                                                            let field = selectedFields.find((item)=>item.name===curr);
                                                            acc.push(field);
                                                            return acc;
                                                        }, []);
                                                    } else {
                                                        localValue='';
                                                    }
                                                }else{
                                                    localValue=localValue.value;
                                                }
                                                //console.log('inside use TabUpdateUomValues ===>', localValue, payloadData[field.UomFieldName], payloadData[field.fieldName])
                                                if(Array.isArray(localValue)){
                                                    localValue.forEach((item)=>{
                                                        if(!isNaN(item.value)){
                                                            const newValue=convertUnitDiffDims(item.value, oldUom, newUom,units,payloadData)
                                                            let itemVal = {name:item.name, value:newValue}
                                                            dispatch(onUpdateFields(itemVal))
                                                        }
                                                    })
                                                } else {
                                                    if(!!localValue && !isNaN(localValue)){
                                                        const newValue=convertUnitDiffDims(localValue, oldUom, newUom,units,payloadData)
                                                        let item = {name:field.fieldName, value:newValue}
                                                        dispatch(onUpdateFields(item))
                                                    }
                                                }
                                                let uomitem = {name:field.UomFieldName, value:newUnitValue}
                                                dispatch(onUpdateFields(uomitem))
                                            }
                                        }
                                    }
                               // }
                            }
                        })
                    }
                })
            }
            if([12,3,23,24].indexOf(selectedWorkflow)!==-1){
                if(workflowPopup.fields){
                    workflowPopup.fields.forEach(field=>{
                        if(field.UomFieldName!=='' && field.UomFieldName!==null && field.UomFieldName!==undefined && field.dimensionName!==undefined){
                            // console.log('inside use TabUpdateUomValues >>1',field.dimensionName, field.UomFieldName, field.fieldName)
                            //if(payloadData[field.UomFieldName]){
                                let dimensionName = field.dimensionName;
                                if(dimensionName!==null && dimensionName!==undefined && dimensionName[0]!=='%'){
                                    let dimensionUnits=[]
                                    if(Array.isArray(dimensionName)){
                                        dimensionName.forEach((item)=>{
                                        const dimensionUnit=units[item];
                                        dimensionUnits=[...dimensionUnits,...dimensionUnit]
                                        })
                                    }else{
                                        dimensionUnits=units[dimensionName];
                                    }
                                    const uomValue=Array.isArray(field?.dimensionName)?field?.dimensionName[0]:field?.dimensionName;
                                    let unitValue = payloadData[field.UomFieldName];
                                    if(unitValue===undefined || unitValue===null || unitValue===''){
                                        unitValue = defaultUnits[fromDisplayUnitSystem][uomValue]
                                    }
                                    //console.log('inside use TabUpdateUomValues >>11',toDisplayUnitSystem, fromDisplayUnitSystem, uomValue, field.fieldName)
                                    
                                    const newUnitValue=defaultUnits[toDisplayUnitSystem][uomValue];
                                    //const newUomobject=dimensionUnits.find(unit => unit.UnitKey===newUnitValue);
                                    //const exitingUom=dimensionUnits.find(unit => unit.UnitKey===payloadData[field.UomFieldName]);
                                    
                                    //console.log('inside use TabUpdateUomValues >>>>1111',unitValue, newUnitValue, field.fieldName)
                                    if(unitValue !== newUnitValue && newUnitValue){
                                        if(unitValue!==undefined && unitValue!==null){
                                            //let newunitValue=defaultUnits[DisplayUnitSystem][dimensionUoms];
                                            const oldUom=dimensionUnits.find(unit => unit.UnitKey===unitValue);
                                            const newUom=dimensionUnits.find(unit => unit.UnitKey===newUnitValue);
                                            let localValue=selectedFields.find((item)=>item.name===field.fieldName);
                                            if(localValue===undefined){
                                                localValue=''
                                            }else{
                                                localValue=localValue.value;
                                            }
                                            //console.log('inside use TabUpdateUomValues ===>', localValue, payloadData[field.UomFieldName], payloadData[field.fieldName])
                                            
                                            if(!!localValue && !isNaN(localValue)){
                                                const newValue=convertUnitDiffDims(localValue, oldUom, newUom,units,payloadData)
                                                let item = {name:field.fieldName, value:newValue}
                                                dispatch(onUpdateFields(item))
                                            }
                                            let uomitem = {name:field.UomFieldName, value:newUnitValue}
                                            dispatch(onUpdateFields(uomitem))
                                        }
                                    }
                                }
                            // }
                        }
                    })
                }
            }
        }
        
    return{
        updateUomValue
    }
}

export default useTabUpdateUomValues;