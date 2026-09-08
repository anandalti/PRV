import {  FIELD_SPLITTER,  FIELDLIST_DISPLAY_OPTIONS, IGNORE_FIELDS, IGNORE_FIELDS_FOR_ZEROS, types, CONVERT_TOFIXED_DECIMALS, FIELD_GROUPS, BIGNUMBER_DECIMALS, BIGNUMBER_ROUNDING_MODE, WF_BACKEND_CONFIGURATION_FLAG } from "./constants";
import { globalFunction } from "./globalFunctions";
import { ValidationForTemperature } from "./temperatureValidations";
import {  getUserPreference } from "./utility";
import { convertUnit } from './convertUnit';
import {evaluateExpression} from './parse';
import { e } from "mathjs";


export const apiFunctionCall = (target,fieldName,fieldValue,payloadData) => {
    const apiParameters=target?.apiParameters;
    let reqVariables={};
    let config={
        url:target?.api ?? target?.url,     // REST path: present in REST JSON
        query:target?.query,                // GQL path:  present in GQL JSON
        actionType:target?.actionType,
        currentFields:target?.currentFields??target?.selectedFields ?? target?.functionReqFields,
        requiredUnits:target?.requiredUnits,
        requiredDimensions:target?.requiredDimensions,
        method:target?.method,
        responseParams:target?.apiResponseParams
    }
    if(Array.isArray(apiParameters)){
        apiParameters.forEach(field => {
            let fieldData=field===fieldName?fieldValue:payloadData[field];
            // const localVal=fieldData!==undefined && fieldData!==""?Number(fieldData):0;
            const localVal=fieldData!==undefined?fieldData:"";
            reqVariables[field]=localVal;
        })
    }
    config.data=reqVariables;
    return config
}
 
export const ExecuteFunction = (functionName, ...args) => {
    const func = globalFunction[functionName];
    if (typeof func === 'function') {
        const funcOut= func(...args);
        return funcOut;
    } else {
        throw new Error(`Function ${functionName} not found`);
    }
};

const checkDefaultRule1=(rule,inputFields,data,fieldName,payloadData,dimensionName, units)=>{
    let localValue;
    const targetFlag=rule?.target
    const id=targetFlag ? rule?.target?.id:rule?.id;
    const value=targetFlag ? rule?.target?.value:rule?.value;
    const expressionFlag=rule?.target?.expression;
    const apiFlag=rule?.target?.api;
    const functionFlag=rule?.target?.symbol==='Exec_Function';
    //console.log('In check DefaultRule1:: 1111111 >>>>>>>> ',rule,inputFields,data,fieldName,functionFlag)
    if(apiFlag){
        return apiFunctionCall(rule?.target,'','',payloadData);
    }else if(functionFlag){
        return ExecuteFunction(rule?.target?.functionName,rule,payloadData,units,fieldName);
    }else if(expressionFlag){
        const expValue=calculateExpressionValue(rule,fieldName,data?.value,payloadData,dimensionName, units,"checkDefaultRule1")
        return expValue
    }
    const targetField = inputFields?.find(fl => fl.name === id);
    // const targetField = inputFields?.find(fl => fl.name === rule?.target?.id);

    if (targetField && data===undefined) {
        if(targetField!==undefined && targetField?.name===id){
            if(targetFlag){
                if(targetField?.value===value){
                    localValue = rule.value;
                }
            }else{
                localValue = targetField?.value
            }
        }else if(value===false){
            localValue = rule.value;
        }
    }else if ((targetField ===undefined || Object.keys(targetField).length===0) && (data===undefined || Object.keys(data).length===0)) {
        localValue = rule.value;
    }else if(targetField!==undefined && targetField?.name===id){
        if(targetField!==undefined && targetField?.name===id){
            if(targetFlag){
                if(targetField?.value===value){
                    localValue = rule.value;
                }
            }else{
                localValue = targetField?.value
            }
        }else if(value===false){
            localValue = rule.value;
        }
        // if(targetField?.value===value){
        //     localValue = rule.value;
        // }
    
    }else if( value===data[id]){
        localValue = rule.value;
    }
    return localValue
}


const checkDefaultRule=(rule,inputFields,data)=>{
    let localValue;
    const targetFlag=rule?.target
    const id=targetFlag ? rule?.target?.id:rule?.id;
    const value=targetFlag ? rule?.target?.value:rule?.value;
    const targetField = inputFields?.find(fl => fl.name === id);
    if (targetField && data===undefined) {
        if(targetField!==undefined && targetField?.name===id){
            if(targetField?.value===value){
                localValue = rule.value;
            }
            // localValue = targetField.value;
        }else {
            localValue = rule.value;
        }
    }else if ((targetField ===undefined || Object.keys(targetField).length===0) && (data===undefined || Object.keys(data).length===0)) {
        localValue = rule.value;
    }else if(targetField!==undefined && targetField?.name===id){
        if(!targetField?.value){
            localValue = rule.value;
        }else if(targetField?.value!==value){
            localValue = rule.value;
        // }else{
        //     localValue=targetField?.value
        }
    
    }else if(value===data[id]){
        localValue = rule.value;
    }
    return localValue
}

export const checkDefaultValue1 = (defaultValue,inputFields,field,fieldName,data) => {
    let value;
    if(typeof defaultValue==='object'){
        if (Array.isArray(defaultValue)){
            //console.log('>>>>>> check DefaultValue::1111 >>>>>>>>. ',defaultValue,inputFields,field,data)
            if(FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1){
                let inputValues={};
                field?.fieldList?.forEach(item => {
                    //console.log('radio Input:: item >>>>>>>> ',item,inputFields);
                    item?.defaultValue.forEach(rule => {
                        const targetField = inputFields?.find(fl => fl.fieldName === rule?.target.id);
                        // const localData = inputFields?.find(fl => fl.fieldName === field?.fieldName);
                        //console.log('radio Input:: rule >>> ',rule,item?.fieldName,rule?.target.id,targetField,data[item?.fieldName])
                        if (targetField && data===undefined) {
                            if(!rule?.target.value){
                                value = rule.value;
                            }
                        }else if(rule?.target.value==data?.value){
                            value = rule.value;
                        }
                    }) 
                    inputValues[item.fieldName]=value
                })
                value=inputValues;
            }else{
                
                value={};
                defaultValue.forEach(rule => {
                    //console.log('In default Value::::11111111 >>>> ',rule,field,data)
                    const localValue=checkDefaultRule(rule,inputFields,data)
                    // const targetField = inputFields?.find(fl => fl.name === rule?.target?.id);
                    //console.log('In default Value::::2222222 >>>> ',targetField)
                    // if (targetField && data===undefined) {
                    //     if(targetField!==undefined && targetField?.name===rule?.target?.id){
                    //         if(targetField?.value===rule?.target?.value){
                    //             localValue = rule.value;
                    //         }
                    //         // localValue = targetField.value;
                    //     }else {
                    //         localValue = rule.value;
                    //     }
                    // }else if ((targetField ===undefined || Object.keys(targetField).length===0) && (data===undefined || Object.keys(data).length===0)) {
                    //     localValue = rule.value;
                    // }else if(targetField!==undefined && targetField?.name===rule?.target.id){
                    //     if(targetField?.value===rule?.target.value){
                    //         localValue = rule.value;
                    //     }
                    
                    // }else if( rule?.target?.value===data[rule?.target.id]){
                    //     localValue = rule.value;
                    // }
                    if(localValue!==undefined){
                        const localFieldName=rule?.target ? field?.fieldName:rule?.id;
                        value[localFieldName]=localValue;
                    }
                })
            }
        }else{
            value = defaultValue.value;
        }
    }else{
        value = defaultValue;
    }
    return value;   
}

export function ValidateExpression(expression, object, funcArgs=[],funcNames=[],callingfunction='') {
    let result = false;
    try{        
        const reqVariables={...object,CONVERT_TOFIXED_DECIMALS}
        // console.log('Validate expr22', {expression, reqVariables});
        result = evaluateExpression(expression, reqVariables);
        // console.log('Validate expr22 result', {result});

    }catch (e) {
        console.log(e,expression,{object});
    }
            
    return result;
}

export const calculateExpressionValue=(rule,fieldName,fieldValue,payload,dimensionName,units,callingfunction)=>{
    let value;
    const expFields=rule?.target?.expressionReqFields;
    const currentId=rule?.target?.currentId;
    const uom=rule?.target?.uom;
    const ignoreZeroFields=rule?.target?.ignoreZeroFields;
    const uomObjectFlag=typeof uom==='object'?true:false
    let uomFieldFlag=uom!==undefined && uom!==null && uom!==""?true:false;
    let dimensionPerFlag=dimensionName?.length>0?dimensionName[0]==='%'?true:false:false;

    let localDimensionName=uomObjectFlag?'':dimensionName?.length>0?dimensionName[0]==='%'?['pressure']:dimensionName:uom!==undefined?[uom?.split(".")[0]]:dimensionName;
    let selectedUOM=uomObjectFlag?{}:'';
    let reqVariables={}
    // if((fieldName==='SetVacuum' || fieldName==='UnderPressure' || fieldName==='UnderPressurePer')){
    //     //console.log('calculate ExpressionValue :::: fieldNamefieldName >>> ',fieldValue, fieldName,uom,uomFieldFlag,selectedUOM,localDimensionName,payload)
    // }
    if(expFields!==undefined){
        if(Array.isArray(expFields)){
            expFields.forEach(field => {
                let localVal=field===fieldName?fieldValue:payload[field];
                //console.log('field,val?ue >>>>>>>>>>>>> ',field,localVal,typeof localVal)
                localVal=localVal===undefined || localVal===null? field.indexOf('UOM')!==-1 || IGNORE_FIELDS_FOR_ZEROS.indexOf(field)!==-1?'':0:localVal;
                //console.log('field,value >>>>>>>>>>>>> ',field,localVal,typeof localVal)
                if(typeof localVal==='string'){
                    if(isNaN(localVal)) {
                        if(localVal!=='' && localVal!==undefined){
                            
                            if(uomObjectFlag){
                                selectedUOM[field]=localVal;
                            }else{
                                selectedUOM=localVal;
                            }
                            
                        }
                    }
                }
                //console.log('In calculateExpression:: 111111 :: Calculate >>>>>>>> ',uomFieldFlag,selectedUOM,rule?.target?.expression,field.indexOf('UOM')!==-1, field,localVal,fieldName,fieldValue,payload[field],isNaN(localVal));
                reqVariables[field]=localVal===''?'':typeof localVal==='string'?!isNaN(localVal)?Number(localVal):uomFieldFlag?localVal:localVal!=='' && localVal!==undefined && localVal!==null?localVal:'':localVal;
            })
        }else if(typeof expFields==='object'){
            Object.keys(expFields).forEach(field => {
                let localVal=field===fieldName?fieldValue:payload[field];
                localVal=localVal===undefined || localVal===null?0:localVal;
                reqVariables[field]=localVal===''?'':typeof localVal==='string'?isNaN(localVal)?'' :(localVal):localVal;
                //reqVariables[field]=localVal===''?'':typeof localVal==='string' && !isNaN(localVal)?localVal:localVal; //makechangeforexpressionCalculation
            })
        }else{
            let localVal=expFields===fieldName?fieldValue:payload[expFields];
            localVal=localVal===undefined || localVal===null?0:localVal;
            reqVariables[expFields]=localVal===''?'':typeof localVal==='string'?isNaN(localVal)?'' :(localVal):localVal;
            //reqVariables[expFields]=localVal ===''?'':(typeof localVal === 'string'?(isNaN(localVal)?'':localVal):localVal); //makechangeforexpressionCalculation
        }
    }else{
        let localVal=fieldValue===undefined || fieldValue===null?0:fieldValue;
        reqVariables[fieldName]=localVal===''?'':typeof fieldValue==='string'?isNaN(localVal)?'' :(localVal):localVal;
        //reqVariables[fieldName]=localVal===''?'':(typeof fieldValue==='string'?(isNaN(localVal)?'':localVal):localVal); //makechangeforexpressionCalculation
    }

    if(uomFieldFlag && units !==undefined){
        let localReqVal={...reqVariables};
        
        //console.log('localReqVal >>>>>>>>>>>>>>>>>>> ',currentId,uomFieldFlag,localReqVal,Object(localReqVal));

        for (const key in localReqVal) {
            //console.log('key >>>>>>>>>> ',currentId,key,uomObjectFlag,IGNORE_FIELDS.indexOf(key)===-1);
            if(IGNORE_FIELDS.indexOf(key.toUpperCase())===-1){
                const localVal=localReqVal[key];
                if(!isNaN(parseFloat(localVal))){
                    if(uomObjectFlag){
                        if(Object.keys(selectedUOM).length>0 && uom[key]!==undefined){
                            const fromUnit=selectedUOM[uom[key][0]]
                            if(fromUnit!==undefined){
                                const toUnit=uom[key][1];
                                let dimName=fromUnit.split(".")[0]==='temp'?'temperature':fromUnit.split(".")[0];
                                const converted_Value=convertValue(localVal, fromUnit, toUnit, [dimName], units)
                                reqVariables[key]=converted_Value;
                            
                            }
                        }
                    }else if(selectedUOM!=='' && selectedUOM!==undefined){
                        
                        const dimName=localDimensionName.map(item => item==='temp'?'temperature':item);
                        reqVariables[key]=convertValue(localVal, selectedUOM, uom, dimName, units);
                    }
                } else {
                    reqVariables[key]=localVal;
                }
            }
        }
    }
    
    const expfuncFlag=rule?.target?.expressionfuncs!==undefined?true:false;

    let functionList=[];
    let funcNameList=[]
    // if(expfuncFlag){
    //     funcNameList=rule?.target?.expressionfuncs;
    //     if(funcNameList?.length>0){
    //         funcNameList.forEach(item => {
    //             //console.log('first item 11111 >>>>>>>>>>>>>>>> ',funcNameList,rule?.target?.expression,item,expFunctions.hasOwnProperty(item),typeof expFunctions,expFunctions['abc'],expFunctions[item]);
    //             if(expFunctions.hasOwnProperty(item)){
    //                 functionList.push(expFunctions[item]);
    //                 //console.log('first item 222222 >>>>>>>>>>>>>>>> ',rule?.target?.expression,item,expFunctions.hasOwnProperty(item),functionList);
    //             }
    //         })
    //     }
    // }
    let expValue=ValidateExpression(rule?.target?.expression, reqVariables,functionList,funcNameList,callingfunction);
    

    if(typeof expValue !=='boolean'  && !isNaN(parseFloat(expValue))){
        if(uomFieldFlag && typeof Number(expValue)==='number'  && units !==undefined && currentId!==undefined){
            if(IGNORE_FIELDS.indexOf(currentId.toUpperCase())===-1 && selectedUOM!=='' && selectedUOM!==undefined){
                if(uomObjectFlag){
                    if(Object.keys(selectedUOM).length>0 && uom[rule?.target?.currentId]!==undefined){
                        const toUnit=selectedUOM[uom[rule?.target?.currentId][0]]
                        if(toUnit!==undefined){
                            const fromUnit=uom[rule?.target?.currentId][1];
                            let dimName=fromUnit.split(".")[0]==='temp'?'temperature':fromUnit.split(".")[0];
                            // console.log('In calculateExpression:: 222222 :: Calculate >>>>>>>> ',expValue, fromUnit, toUnit, dimName, units);
                            expValue=convertValue(expValue, fromUnit,toUnit, [dimName], units);
                        
                        }
                    }
                }else if(selectedUOM!=='' && selectedUOM!==undefined){
                    const dimName=localDimensionName.map(item => item==='temp'?'temperature':item);
                    expValue=convertValue(expValue, rule?.target?.uom,selectedUOM, dimName, units);
                }
            }
        }
    }
    if( (expValue===0 || expValue==='' || expValue || typeof expValue==='boolean')){
        value =expValue 
    }else{
        value =rule?.value
    }
    // console.log('result', {expValue});
    return value
}


export const checkDefaultValue = (defaultValue,inputFields,field,fieldName,payload,units) => {
    let value;
    if(typeof defaultValue==='object'){
        if (Array.isArray(defaultValue)){
            value={};
            if(FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1){
                let inputValues={};
                //console.log('>>>>>> check DefaultValue::222222 >>>>>>>>. ',defaultValue,inputFields,field,fieldName)
                if(field.type==='multiInputUom'){
                    //console.log('In check DefaultValue::: multiInputUom1111112222  :: Calculate >>>>>>>> ',field,fieldName,inputFields,defaultValue,field?.fieldList)
                    return {[fieldName]:''}
                }
                if(field?.fieldList!==undefined){
                    field?.fieldList?.forEach(item => {
                        //console.log('radio Input:: item >>>>>>>> ',item,inputFields,item?.defaultValue);
                        if (Array.isArray(item?.defaultValue)){
                            item?.defaultValue.forEach(rule => {
                                if(rule?.target!==undefined){
                                    const targetField = inputFields?.find(fl => fl.name === rule?.target.id);
                                    const data= inputFields?.find(fl => fl.name === fieldName);
                                    //console.log('In check DefaultValue::: calculateExpression:: 111111  :: Calculate >>>>>>>> ',rule,targetField,fieldName,rule?.target?.id,data,rule?.target?.expression)
                                    const expFlag=rule?.target?.expression;
                                    if(targetField && expFlag){
                                        if(targetField.value!==""){
                                            value=calculateExpressionValue(rule,targetField.name,targetField.value,payload,field?.dimensionName, units,"checkDefaultValue");
                                        }else if(data!==undefined){
                                            value = data?.value;
                                        }else{
                                            value = rule.value;
                                        }
                                    }else if (targetField && data===undefined) {
                                        if(!rule?.target.value){
                                            value = rule.value;
                                        }
                                    }else if(data!==undefined){
                                        value = data?.value;
                                    }else if(rule?.target.value==data?.value){
                                        value = rule.value;
                                    }
                                }
                            }) 
                        }else if(typeof item?.defaultValue==='object'){
                            value=item?.defaultValue.value
                        }else{
                            value=item?.defaultValue
                        }
                        inputValues[item.fieldName]=value
                    })
                }else{
                    //console.log('>>>>>> check DefaultValue::3333333 >>>>>>>>. ',Array.isArray(field?.defaultValue))
                    if (Array.isArray(field?.defaultValue)){
                        field?.defaultValue.forEach(rule => {
                            if(rule?.target!==undefined){
                                const targetField = inputFields?.find(fl => fl.name === rule?.target.id);
                                const data= inputFields?.find(fl => fl.name === fieldName);
                                //console.log('In check DefaultValue::: calculateExpression:: 3333 111111  :: Calculate >>>>>>>> ',rule,targetField,fieldName,rule?.target?.id,data,rule?.target?.expression)
                                const expFlag=rule?.target?.expression;
                                if(targetField && expFlag){
                                    if(targetField.value!==""){
                                        value=calculateExpressionValue(rule,targetField.name,targetField.value,payload,field?.dimensionName, units,"checkDefaultValue");
                                    }else if(data!==undefined){
                                        value = data?.value;
                                    }else{
                                        value = rule.value;
                                    }
                                }else if (targetField && data===undefined) {
                                    if(!rule?.target.value){
                                        value = rule.value;
                                    }
                                }else if(data!==undefined){
                                    value = data?.value;
                                }else if(data===undefined && expFlag){
                                    //console.log('444444444444 >>>>>>>>>>>>>>> ',rule,fieldName,field?.value,payload,field?.dimensionName)
                                    value=calculateExpressionValue(rule,fieldName,field?.value,payload,field?.dimensionName, units,"checkDefaultValue");
                                }else if(rule?.target.value==data?.value){
                                    value = rule.value;
                                }
                            }
                        }) 
                    }else if(typeof field?.defaultValue==='object'){
                        value=field?.defaultValue.value
                    }else{
                        value=field?.defaultValue
                    }
                    inputValues[field.fieldName]=value
                }
                value=inputValues;
            }else{
                defaultValue.forEach(rule => {
                    if(fieldName!==undefined){
                        if(rule?.target!==undefined){
                            const data= inputFields?.find(fl => fl.name === fieldName);
                            let dimensionName = field?.dimensionName;
                            try {
                                if(!dimensionName || dimensionName.length===0){
                                    if(typeof rule.target?.uom==='string'){
                                        dimensionName = [rule?.target?.uom.split(".")[0]];
                                    } else if(typeof rule.target?.uom === 'object' && rule.target?.uom[rule.target.currentId] !== undefined) {
                                        dimensionName = rule?.target?.uom[rule.target.currentId][1].split(".")[0];
                                    }
                                }
                                let localValue=checkDefaultRule1(rule,inputFields,data,fieldName,payload,dimensionName, units)
                                let targetUomName = rule?.target?.expressionReqFields.find(fieldName=>fieldName.includes("UOM"))
                                if(dimensionName && targetUomName && payload[targetUomName] !== rule?.target?.uom){
                                    localValue = convertValue(localValue, payload[targetUomName], rule?.target?.uom, dimensionName, units)
                                    // if(fieldName==='Diameter_d' || fieldName==='TankVolume'){
                                    //     //console.log('In :: get DefaultsValues >> checkDefaultValue:: 2222222 >>>>> ',fieldName, localValue)
                                    // }
                                }
                                if(rule?.target?.defaultUomUnit && rule?.target?.defaultUomUnit!==payload[field.UomFieldName]){
                                    // if(fieldName==='Diameter_d' || fieldName==='TankVolume'){
                                    //     //console.log('In :: get DefaultsValues >> checkDefaultValue:: 333333 >>>>> ',fieldName, localValue, payload[field.UomFieldName])
                                    // }
                                    localValue = convertValue(localValue, rule?.target?.defaultUomUnit, payload[field.UomFieldName] , field?.dimensionName, units)
                                }
                                ////console.log('field.defaultValue::111111 >>>> ',rule,fieldName,data,localValue)
                                if(localValue!==undefined){
                                    const targetFlag=rule?.target
                                    //console.log('In check DefaultValue::2222 >>>> ',rule,fieldName)
                                    if(targetFlag){
                                        if(rule?.target?.api){
                                            value[fieldName]=localValue;
                                        }else if(rule?.target?.expression){
                                            value[fieldName]=localValue;
                                            ////console.log('In check DefaultValue::2222 >>>> ',rule,fieldName, value)
                                        }else if(rule?.target?.currentId===fieldName){
                                            value[fieldName]=localValue;
                                        }
                                    }else if(rule?.id===fieldName){
                                        value[fieldName]=localValue;
                                    }
                                }
                            } catch (error) {
                                console.error('Error in checkDefaultRule1:', error, rule, inputFields, data, fieldName, payload, dimensionName, units);
                                value[fieldName] = rule.value; // Fallback to rule value in case of error
                            }
                        }else{
                            //console.log(' In DefaultValue Check >>>> ',rule,fieldName)
                            // const data= inputFields?.find(fl => fl.name === fieldName);
                            // if(data!==undefined){
                                if(fieldName===rule?.id){
                                    value[fieldName]=rule.value;
                                }
                            // }
                        }
                    }
                    
                })
            }
        }else if(payload[fieldName]===undefined){
            //console.log('In validation:: check default value::11111 >>> ',field.fieldName,defaultValue)
            value = defaultValue.value;
        }
    }else if(payload[fieldName]===undefined){
        //console.log('In validation:: check default value::777777 >>> ',field.fieldName,defaultValue)
        value = defaultValue;
    }else{
        value=payload[fieldName]
    }
    //console.log('field.defaultValue ::: check default value::888888 >>> ',fieldName,value)
    return value;   
}

export const checkDefaultValue2 = (defaultValue,inputFields,field,fieldName,data) => {
    let value;
    if(typeof defaultValue==='object'){
        if (Array.isArray(defaultValue)){
            //console.log('>>>>>> check DefaultValue::1111 >>>>>>>>. ',defaultValue,inputFields,field,data)
            if(FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1){
                let inputValues={};
                field?.fieldList?.forEach(item => {
                    //console.log('radio Input:: item >>>>>>>> ',item,inputFields);
                    item?.defaultValue.forEach(rule => {
                        const targetField = inputFields?.find(fl => fl.fieldName === rule?.target.id);
                        // const localData = inputFields?.find(fl => fl.fieldName === field?.fieldName);
                        //console.log('radio Input:: rule >>> ',rule,item?.fieldName,rule?.target.id,targetField,data[item?.fieldName])
                        if (targetField && data===undefined) {
                            if(!rule?.target.value){
                                value = rule.value;
                            }
                        }else if(rule?.target.value==data?.value){
                            value = rule.value;
                        }
                    }) 
                    inputValues[item.fieldName]=value
                })
                value=inputValues;
            }else{
                let targetField=[]
                defaultValue.forEach(rule => {
                    if(typeof rule?.target.id==='object'){
                        if(Array.isArray(rule?.target.id)){
                            rule?.target.id.forEach(item => {
                                const localItem=inputFields?.find(fl => fl.name === item)
                                if(localItem!==undefined){
                                    targetField.push(localItem)
                                }
                            })
                        }
                    }else{
                        targetField = inputFields?.filter(fl => fl.name === rule?.target.id);
                    }
                    
                    if (targetField && data===undefined) {
                        if(targetField!==undefined && targetField?.name===rule?.target?.id){
                            if(targetField?.value===rule?.target?.value){
                                value = rule.value;
                            }
                        }else if(!rule?.target?.value){
                            value = rule.value;
                        }
                    }else if ((targetField ===undefined || Object.keys(targetField).length===0) && (data===undefined || Object.keys(data).length===0)) {
                        if(!rule?.target?.value){
                            value = rule.value;
                        }                    
                    }else if( rule?.target.value===data[rule?.target.id]){
                        //console.log('>>>>>> check DefaultValue::6666666 >>>>>>>>>>>>> ',field?.fieldName,data,rule)
                        value = rule.value;
                    }
                })
            }
        }else{
            //console.log('In validation:: check default value::11111 >>> ',field.fieldName,defaultValue)
            value = defaultValue.value;
        }
    }else{
        //console.log('In validation:: check default value::777777 >>> ',field.fieldName,defaultValue)
        value = defaultValue;
    }
    //console.log('In validation:: check default value::888888 >>> ',field.fieldName,value)
    return value;   
}

const validateRule=(rule,targetFlag,inputFields,data,fields)=>{
    let fieldValue={}
    const id=targetFlag ? rule?.target?.id:rule?.id;
    const value=targetFlag ? rule?.target?.value:rule?.value;
    const targetField = inputFields.find(field => field?.name === id);
    
    //console.log('In check Mandatory:::validate Rule::2222 >>>>>>>>. ',targetField,rule,data,data[targetField?.name],value)
    if (targetField && data[targetField?.name] !==undefined) {
        if(targetFlag){
            //console.log('validate Rule::2222 11111 >>>>>>>>. ',targetField,targetField.value,value)
            if(targetField.value===value){
                fieldValue = rule.value;
            }else{
                fieldValue=!rule.value;
            }
            //console.log('validate Rule::2222 222222 >>>>>>>>. ',targetField,fieldValue)
        }else if(id==='IsVacuumOnly'){
            fieldValue = data[targetField?.name];
        }else{
            fieldValue= value;
        }
        //console.log('validate Rule::2222 33333 >>>>>>>>. ',targetField,fieldValue)
    }else if (targetField ===undefined){
        const field = fields.find(fl => fl.fieldName.indexOf(id)!==-1);
        //console.log('In check Mandatory::: 333333 >>>>>>>> ',id,field,field?.defaultValue)
        if(field!==undefined){
            if(Array.isArray(field.defaultValue)){
                const localValue=field?.defaultValue?.find(fl => fl?.id===id);
                //console.log('In validate Rule::: 444444 >>>>>>>> ',localValue)
                if(localValue!==undefined){
                    if(localValue.value){
                        fieldValue = rule.value;
                    }else{
                        fieldValue = false;
                    }
                }
            }else{
                fieldValue = false;
            }
        }else{
            fieldValue = false;
        }
    }else{
        //console.log('validate Rule::666666 >>>>>>>>. ',targetField,rule,data,data[targetField?.name])
    }
    //console.log('validate Rule::555555 >>>>>>>>. ',fieldValue)
    return fieldValue
}

export const checkDisability = (disabled,inputFields,data,fields=null,field,units,disabledFields,fieldName) => {
    
    let disabledFlag = false;
    if (typeof disabled !== 'object') {
        disabledFlag = disabled;
    }else{
        const currentFieldName=field?.fieldName
        disabledFlag={}
        // console.log('disabled >>>>>>>>>>>>>>>>>> In check Disability::: 1111 >>>>>>>>. ',typeof disabled,disabled,inputFields,data)
        disabled?.forEach(rule => {
            const targetFlag=rule?.target;
            // const flag=validate Rule(rule,targetFlag,inputFields,data,fields)
            let fieldValue={}
            const id=targetFlag ? rule?.target?.id:rule?.id;
            const value=targetFlag ? rule?.target?.value:rule?.value;
            const expressionFlag=rule?.target?.expression;
            let currentId
            if(expressionFlag){
                currentId=rule?.target?.currentId ?? currentFieldName;
                //console.log('In check Disability :::expValue:: 00000 >>>> ',data,rule,id,data[id])
                fieldValue=calculateExpressionValue(rule,id,data[id],data,field?.dimensionName,units,"checkDisability")
                // console.log('In check Disability :::expValue:: 1111111 >>>> ',currentId,fieldValue,expressionFlag)
                // return expValue
            }else if(WF_BACKEND_CONFIGURATION_FLAG){
                currentId=id;
                // console.log('disabled >>>>>>>>>>>>>>>>>> In check Disability::: 22222 >>>>>>>>. ',typeof disabled,disabled,id,Array.isArray(field?.fieldName),field?.fieldName)
                if(Array.isArray(field?.fieldName)){
                    const localFieldName=field?.fieldName.find(fn => fn===id);
                    if(localFieldName!==undefined){
                        fieldValue=rule.value;
                    }
                }else{
                    fieldValue=rule.value;
                }
                
            }else{
                const targetField = inputFields.find(field => field?.name === id);
                currentId= targetFlag?rule?.target?.currentId:rule?.currentId;
                //console.log('In check Disability::: 2222 >>>>>>>>. ',targetField,rule,data,data[targetField?.name],currentFieldName)
                if (targetField && data[targetField?.name] !==undefined) {
                    if(targetFlag){
                        //console.log('In check Disability::: 2222333333 >>>>>>>>. ',targetField,rule,data,data[targetField?.name],currentFieldName)
                        if(targetField.value===value){
                            fieldValue = rule.value;
                        }else if(currentFieldName==='RuptureDiscKcFd'){
                            if(targetField.value===value){
                                fieldValue=true
                            }else{
                                fieldValue=false
                            }
                        }else{
                            fieldValue=!rule.value;
                        }
                    }else if(currentFieldName==='RuptureDiscKcFd'){
                        //console.log('In check Disability::: 222244444 >>>>>>>>. ',targetField,rule,data,data[targetField?.name],currentFieldName)
                        if(targetField.value===value){
                            fieldValue=true
                        }else{
                            fieldValue=false
                        }
                    }else{
                        //console.log('In check Disability::: 222255555 >>>>>>>>. ',targetField,rule,data,data[targetField?.name],currentFieldName)
                        fieldValue= value;
                    }
                }else if (targetField ===undefined){
                    const field = fields.find(fl => fl.fieldName.indexOf(id)!==-1);
                    //console.log('In check Disability::: 333333 >>>>>>>> ',id,field,field?.defaultValue,currentFieldName)
                    if(field!==undefined){
                        if(typeof field.defaultValue==='object'){
                            const localValue=field?.defaultValue?.find(fl => fl?.id===id);
                            //console.log('In check Disability:: 444444 >>>>>>>> ',localValue,currentFieldName)
                            if(localValue!==undefined){
                                if(!localValue.value){
                                    fieldValue = rule.value;
                                }else if(currentFieldName==='RuptureDiscKcFd'){
                                    fieldValue=true
                                }else{
                                    fieldValue = false;
                                }
                            }
                        }else if(currentFieldName==='RuptureDiscKcFd'){
                            fieldValue=true
                        }else{
                            //console.log('In check Disability:: 5555555 >>>>>>>> ',currentFieldName)
                            fieldValue=field?.defaultValue
                        }
                    }else if(currentFieldName==='RuptureDiscKcFd'){
                        fieldValue=true
                    }else{
                        //console.log('In check Disability:: 666666 >>>>>>>> ',currentFieldName)
                        fieldValue = false;
                    }
                }
            }

            disabledFlag[currentId]=fieldValue;
            
        })
        //console.log('In check Disability:: 3333 >>>>>>>>. ',disabledFlag)
    
    }
    // console.log('disabled >>>>>>>>>>>>>>>>>> In check Disability::: 33333 >>>>>>>>. ',disabledFlag)
    return disabledFlag;   
}

export const checkHideinSidebar = (hidefromSidebar,inputFields,data,fields,field) => {
    //console.log('In check hidefromSidebar::: 1111 >>>>>>>>. ',typeof hidefromSidebar !== 'object',field)
    let hidefromSidebarFlag=false;
    if (typeof hidefromSidebar !== 'object') {
        hidefromSidebarFlag = hidefromSidebar;
    }else if (Array.isArray(hidefromSidebar)){
        //console.log('check hidefromSidebar::1111 >>>>>>>>. ',typeof hidefromSidebar,hidefromSidebar,inputFields)
        
        hidefromSidebar?.forEach(rule => {
            const targetFlag=rule?.target;
            let flag=false;
            let currentId;
            if(targetFlag){
                currentId=rule?.target?.currentId;
            }else{
                currentId=rule?.currentId;
            }
            if(rule?.target?.symbol==='Calculate'){
                const id= rule?.target ? rule?.target?.id:rule?.id;
                flag=calculateExpressionValue(rule,id,data[id],data)
                hidefromSidebarFlag=flag;
            }
        })
        //console.log('check Mandatory::3333 >>>>>>>>. ',hidefromSidebarFlag)
    }else{
        //console.log('check Mandatory::44444 >>>>>>>>. ',hidefromSidebarFlag)
        hidefromSidebarFlag = hidefromSidebar?.value;
    }
    //console.log('check hidefromSidebar::5555 >>>>>>>>. ',field?.fieldName,hidefromSidebarFlag)
    return hidefromSidebarFlag;   
}

export const checkLabelValue = (label,inputFields,data,fields,field,splitter=FIELD_SPLITTER) => {
    // console.log('In check label::: 1111 >>>>>>>>. ',typeof label !== 'object',label)
    const multiFieldName=Array.isArray(label)?false:field?.label?.split(splitter)?.length>1?true:false;
    //console.log('In check label::: 1111 >>>>>>>>. ',typeof label !== 'object',field,multiFieldName)
    let labelValue="";
    if (typeof label !== 'object') {
        labelValue = label;
    }else if(multiFieldName){
        labelValue={}
        const fieldNames=field.label.split(splitter);
        if(label.length===field.label.split(splitter)?.length){
            fieldNames.forEach((item,index) => {
                labelValue[item]=label[index].value;
            })
        }else{
            fieldNames.forEach((item) => {
                labelValue[item]=label.value;
            })
        }
        
    }else if (Array.isArray(label)){
        //console.log('check label::1111 >>>>>>>>. ',typeof label,label,inputFields)
        labelValue=[]
        label?.forEach(rule => {
            const targetFlag=rule?.target;
            let currentId;
            if(targetFlag){
                currentId=rule?.target?.currentId;
            }else{
                currentId=rule?.currentId;
            }
            if(rule?.target?.symbol==='Calculate'){
                const id= rule?.target ? rule?.target?.id:rule?.id;
                const value=calculateExpressionValue(rule,id,data[id],data)
                labelValue.push(value)
            }else{
                const value=validateRule(rule,targetFlag,inputFields,data,fields);
                labelValue.push(value)
            }
        })
        //console.log('check labelValue::3333 >>>>>>>>. ',labelValue)
    }else{
        //console.log('check labelValue::44444 >>>>>>>>. ',labelValue)
        labelValue = label;
    }
    //console.log('check labelValue::5555 >>>>>>>>. ',labelValue)
    return labelValue;   
}

export const checkMandatory = (mandatory,inputFields,data,fields,field,mandatoryFields={}) => {
    //console.log('In check Mandatory::: 1111 >>>>>>>>. ',typeof mandatory !== 'object',field)
    const multiFieldName=Array.isArray(mandatory)?Array.isArray(field.fieldName)?true:field.fieldName?.split(FIELD_SPLITTER)?.length>1?true:false:Array.isArray(field.fieldName)?true:field.fieldName?.split(FIELD_SPLITTER)?.length>1?true:false;
    // console.log('inputUOM Change 11111 >>>>>>>>>>>> 22222 In check Mandatory::: 1111 >>>>>>>>. ',mandatory,typeof mandatory !== 'object',field.fieldName,multiFieldName)
    let mandatoryFlag=false;
    
    if (typeof mandatory !== 'object') {
        if(multiFieldName){
            mandatoryFlag={}
            const fieldNames=Array.isArray(field.fieldName)?field.fieldName:field.fieldName.split(FIELD_SPLITTER);
            fieldNames.forEach((item) => {
                mandatoryFlag[item]=mandatory;
            })
        }else{
            mandatoryFlag = mandatory;
        }
        // if(field.type==='radioInput'){
        //     console.log('radioInput Change 11111 >>>>>>>>>>>> 000000>>>>>>>>> Validation >>>>>>  get SizingFields >>>>>>>>> Mandatory >>>>>>>>>> ',field.fieldName,multiFieldName,mandatory,field)
        // }
    }else if(multiFieldName){
        mandatoryFlag={}
        const fieldNames=Array.isArray(field.fieldName)?field.fieldName:field.fieldName.split(FIELD_SPLITTER);
        // if(field.type==='radioInput'){
            // console.log('inputUOM Change 11111 >>>>>>>>>>>> 33333 000000111111>>>>>>>>> Validation >>>>>>  get SizingFields >>>>>>>>> Mandatory >>>>>>>>>> ',field.fieldName,fieldNames,mandatory)
        // }
        // fieldNames.forEach((item,index) => {
        //         const localMandatory=mandatory?.find(md => md?.currentId===item);
        //         mandatoryFlag[item]=mandatoryFields[item] ?? mandatory[index].value;
        //         // console.log('inputUOM Change 11111 >>>>>>>>>>>> 444444 000000111111>>>>>>>>> Validation >>>>>>  get SizingFields >>>>>>>>> Mandatory >>>>>>>>>> ',field.fieldName,item,fieldNames,mandatory,data[item])
        //     })
        
            fieldNames.forEach((item,index) => {
                if(mandatoryFields[item]!==undefined){
                    mandatoryFlag[item]=mandatoryFields[item];
                }else{

                    const localMandatory=mandatory?.find(md => md?.currentId===item || md?.id===item);
                    mandatoryFlag[item]=localMandatory?.value;
                }
                // console.log('inputUOM Change 11111 >>>>>>>>>>>> 444444 000000111111>>>>>>>>> Validation >>>>>>  get SizingFields >>>>>>>>> Mandatory >>>>>>>>>> ',field.fieldName,item,fieldNames,mandatory,data[item])
            })
        
        
    }else if (Array.isArray(mandatory)){
        // console.log('In Popup >>>>>>>>>>>> In check Mandatory::: 22222 >>>>>>>>. ',typeof mandatory,mandatory,inputFields)
        
        mandatoryFlag={}
        mandatory?.forEach(rule => {
            const targetFlag=rule?.target;
            let flag=false;
            let currentId;
            if(targetFlag){
                currentId=rule?.target?.currentId;
            }else{
                currentId=rule?.currentId;
            }
            if(rule?.target?.symbol==='Calculate'){
                const id= rule?.target ? rule?.target?.id:rule?.id;
                flag=calculateExpressionValue(rule,id,data[id],data)
                mandatoryFlag[currentId]=flag;
            }else{
                flag=validateRule(rule,targetFlag,inputFields,data,fields);
                mandatoryFlag[currentId]=flag;
            }
        })
        // if(field.type==='inputUom'){
        //     console.log('inputUOM Change 11111 >>>>>>>>>>>> 111111>>>>>>>>> Validation >>>>>>  get SizingFields >>>>>>>>> Mandatory >>>>>>>>>> ',field.fieldName,mandatoryFlag)
        // }
        //console.log('check Mandatory::3333 >>>>>>>>. ',mandatoryFlag)
    }else{
        //console.log('check Mandatory::44444 >>>>>>>>. ',mandatoryFlag)
        mandatoryFlag = mandatory?.value;
    }
    // console.log('In Popup >>>>>>>>>>>> In check Mandatory::: 5555 >>>>>>>>. ',mandatoryFlag)
    // if(field.type==='radioInput'){
    //     console.log('radioInput Change 11111 >>>>>>>>>>>> 222222>>>>>>>>> Validation >>>>>>  get SizingFields >>>>>>>>> Mandatory >>>>>>>>>> ',field.fieldName,mandatoryFlag)
    // }
    return mandatoryFlag;   
}

export const checkVisibility = (visibility,inputFields,data,fieldName) => {
    let visibilityFlag=false;
    // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>>>>check Visibility::1111 >>>>>>>>. ',fieldName,typeof visibility,visibility,Array.isArray(visibility),inputFields)
    if (typeof visibility !== 'object') {
        visibilityFlag = visibility;
    }else if (Array.isArray(visibility)){
        //console.log('check Visibility::2222 >>>>>>>>. ',typeof visibility,visibility,inputFields)
        visibilityFlag={}
        visibility?.forEach((rule) => {
            if(rule?.target?.symbol==='Calculate'){
                const id= rule?.target ? rule?.target?.id:rule?.id;
                visibilityFlag=calculateExpressionValue(rule,id,data[id],data)
                //console.log(visibilityFlag, fieldName, '==check Visibility::2222==', rule,data[id],id)
            }else if(rule?.id!==undefined){
                const localValue=inputFields.find(fl => fl.name === rule?.id);
                // console.log('check Visibility::33333 >>>>>>>>. ',fieldName,rule,localValue)
                if(localValue!==undefined){
                    if(rule.value===localValue.value){
                        visibilityFlag = true;
                    }else{
                        visibilityFlag = rule.value;
                    }
                }else{
                    visibilityFlag = rule?.value;
                }
            }else{
                visibilityFlag = rule?.value;
            }
            
        })
        //console.log('check Visibility::3333 >>>>>>>>. ',visibilityFlag)
    }else{
        visibilityFlag = visibility?.value;
        //console.log('check Visibility::44444 >>>>>>>>. ',visibilityFlag)
    }
    return visibilityFlag; 
}


export const checkValidations = (values,fieldName,currFieldValue,fieldData,mandatory,payloadData,field, units, callingFunction="checkValidations") => {
    // if(!mandatory){
    //     if(fieldData.value===""){
    //         return 
    //     }
    // }
    
    let ValueList=[];
    if(typeof values==='object' && values!==null){
        if (Array.isArray(values)){
            values.forEach(rule => {
                    //console.log('In check Validations ::: rule >>> ',rule,currFieldValue,fieldName,rule?.target?.id,ValueList,payloadData)
                if(rule?.target!==undefined){
                    
                    if(rule?.target?.symbol==='Calculate'){
                        const expFlag=rule?.target?.expression;
                        if(expFlag){
                            //console.log('Validation expression :: Calculate >>>>>>>> ',fieldName,currFieldValue,rule?.target?.id,rule)
                            if((payloadData[rule?.target?.id]!==undefined && payloadData[rule?.target?.id]!=="") || rule?.target?.id===fieldName){
                                const expValue=calculateExpressionValue(rule,fieldName,currFieldValue,payloadData,field?.dimensionName, units,callingFunction)
                                if(expValue) {
                                    //console.log(2222, {fieldName,currFieldValue,rule,fieldData,mandatory,payloadData,field, units, callingFunction, expValue})
                                }
                                // if(expValue){
                                //     //console.log('In CheckVariables 0000000>>>>>>>>>>>',fieldName,currFieldValue,expValue,rule?.target?.expression)
                                // }
                                if(rule?.target?.dynamicMessage !==undefined && rule?.target?.dynamicMessage===true){
                                    // if(expValue===rule?.target?.value){
                                    let expressionList=rule?.target?.expectedValue;
                                    let reqVariables={}
                                    const displayUnitSysytem=fieldName==="DisplayUnitSystem"?currFieldValue:payloadData["DisplayUnitSystem"];
                                    rule?.target?.expressionReqFields.forEach(field => {
                                        if(field?.indexOf('UOM')!==-1){
                                            reqVariables[field]=payloadData[field];
                                        }
                                    });
                                    let fromUnit=reqVariables['PressureUOM'];
                                    if(fromUnit!==undefined){
                                        fromUnit=units['pressure']?.find(unit => unit.UnitKey===fromUnit)
                                        let toUnit=displayUnitSysytem==="Metric"?"pressure.barg":rule?.target?.uom 
                                        toUnit=units['pressure']?.find(unit => unit.UnitKey===rule?.target?.uom);

                                        rule?.target?.expressionReqFields.forEach(field => {
                                            if(field?.indexOf('UOM')===-1){
                                                const localVal=convertUnit(payloadData[field],fromUnit,toUnit,units);
                                                // console.log("6090",fieldName, {fieldName, field, localVal, fromUnit, toUnit, units});
                                                reqVariables[field]=localVal;
                                            }
                                        })

                                        // if(expValue){
                                        //     //console.log('In CheckVariables 1111111>>>>>>>>>>> ',reqVariables)
                                        // }
                                        let data={}
                                        // let nanExpindex={};
                                        expressionList?.forEach((exp,index) => {
                                            let value;
                                            if(index!==0){
                                                value=ValidateExpression(exp, reqVariables);
                                                data[index]=value;
                                            }else{
                                                data[index]=rule?.target?.uom;
                                            }
                                        });
                                        let targetUom = displayUnitSysytem==="Metric"?"barg":rule?.target?.uom.split(".")[1];
                                        Object.keys(data).forEach((key) => {
                                            if(key>0){
                                                const localDim=data[0]?.split(".")[0];
                                                        
                                                const fromUnit=units[localDim]?.find(unit => unit?.UnitKey===data[0]);
                                                const localToUniyKey=displayUnitSysytem==="Metric"?"pressure.barg":rule?.target?.uom; //payloadData['PressureUOM'];
                                                const toUnit=units[localDim]?.find(unit => unit?.UnitKey===localToUniyKey);
                                                if(fromUnit!==undefined && toUnit!==undefined){
                                                    const localVal=convertUnit(data[key],fromUnit,toUnit,units);
                                                    if(key==1){
                                                        data[key]=Math.ceil(parseFloat(localVal) * 1000) / 1000;
                                                    }else{
                                                        data[key]=Math.floor(parseFloat(localVal) * 1000) / 1000;
                                                    }
                                                }
                                            }
                                        })
                                        data[0]=targetUom;
                                        // if(expValue){
                                        //     console.log('In CheckVariables 444444>>>>>>>>>> ',data)
                                        // }
                                        if(data){
                                            rule?.target?.expressionReqFields.forEach(field => {
                                                ValueList.push({name:field,value: {"error":rule?.message,"data":data,dynamicFlag:rule?.target?.dynamicMessage} ,flag:expValue});
                                            })
                                        }
                                    }
                                }else{
                                    //console.log('Validation expression :: expValue >>>>>>>> ',expValue,rule?.message)
                                    //console.log({expressionReqFields: rule?.target?.expressionReqFields, message: rule?.message, flag: expValue});
                                    rule?.target?.expressionReqFields.forEach(field => {
                                        // const localMessage=MetricFlag?rule?.message_Metric!==undefined?rule?.message_Metric:rule?.message:rule?.message;
                                        ValueList.push({name:field,value: {"error":rule?.message},flag:expValue});
                                    })
                                }
                                // }
                            }
                        }
                        //console.log('Validation expression :: expValue :: ValueList :: message 1111 222222 >>>>>>>>>> ',ValueList)
                    }else if(rule?.target?.symbol==='Validation_function'){
                        const validateFlag=rule?.target?.validateFor;
                        if(validateFlag){
                            //console.log('Validation expression :: Calculate >>>>>>>> ',fieldName,currFieldValue,rule?.target?.id,rule)
                            if(payloadData[rule?.target?.id]!==undefined && payloadData[rule?.target?.id]!==""){
                                const expValue= validation_function(rule,fieldName,currFieldValue,payloadData, units)
                                //console.log('Error_Validation expression :: expValue >>>>>>>> ',fieldName,rule?.target?.id,expValue,)
                                //if(expValue===rule?.target?.value){
                                    //console.log('Error_Validation expression :: expValue >>>>>>>> ',expValue)
                                    if(typeof expValue === 'object'){
                                        expValue?.expressionReqFields.forEach(field => {
                                            ValueList.push({name:field.name, value: {"error":field.message}, flag:field.error});
                                        })
                                    }else{
                                        rule?.target?.expressionReqFields.forEach(field => {
                                            ValueList.push({name:field,value: {"error":rule?.message}, flag:expValue});
                                        })
                                    }
                                // }
                            }
                        }
                    }

                }else if(rule?.id!== undefined && (rule?.minValue!==undefined || rule?.maxValue!==undefined)){
                //    //console.log(fieldName, 'fieldName UOM srkkk', field.UomFieldName)
                    if(fieldName===rule?.id || fieldName===field.UomFieldName){
                    //    //console.log('In check Validations ::: rule 111111 >>> srk ',rule,currFieldValue,Number(rule?.minValue),rule?.maxValue,Number(rule?.maxValue),rule?.symbol==='lte' && Number(currFieldValue)<=Number(rule?.minValue),Number(currFieldValue)<Number(rule?.minValue))
                        if(rule?.uom!==undefined){
                            //console.log('In UOm >>>>>>>>>>>>>>>>>>>>>>>>. ')
                            currFieldValue = fieldName===rule?.id ? currFieldValue : payloadData[field.fieldName]
                            let currentConvertedValue = convertValue(currFieldValue, payloadData[field.UomFieldName], rule?.uom, field?.dimensionName, units) 
                            if((currentConvertedValue)<rule?.minValue){
                                ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:true});
                            }else if((currFieldValue)>=rule?.maxValue){
                                //console.log('In check Validations ::: rule 111111 >>> ',rule,currFieldValue,rule?.minValue,Number(currFieldValue)<rule?.minValue)
                                ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:true});
                            }else{
                                ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:false});
                            }
                        }else if(rule?.symbol==='between' && (Number(currFieldValue)<=Number(rule?.minValue) || Number(currFieldValue)>=Number(rule?.maxValue))){
                            //console.log('In between >>>>>>>>>>>>>>>>>>>>>>>>. ')
                            ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:true})
                        }else if(rule?.symbol==='min_lt_max_lt' && (Number(currFieldValue)<Number(rule?.minValue) || Number(currFieldValue)>Number(rule?.maxValue))){
                            //console.log('In min_lt_max_lt >>>>>>>>>>>>>>>>>>>>>>>>. ')
                            ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:true})
                        }else if(rule?.symbol==='min_lte_max_lt' && (Number(currFieldValue)<=Number(rule?.minValue) || Number(currFieldValue)>Number(rule?.maxValue))){
                            //console.log('In min_lte_max_lt >>>>>>>>>>>>>>>>>>>>>>>>. ')
                            ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:true})
                        }else if(rule?.symbol==='min_lt_max_lte' && (Number(currFieldValue)<Number(rule?.minValue) || Number(currFieldValue)>=Number(rule?.maxValue))){
                            //console.log('In min_lt_max_lte >>>>>>>>>>>>>>>>>>>>>>>>. ')
                            ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:true})
                        }else if(rule?.symbol==='lte' && Number(currFieldValue)<=Number(rule?.minValue)){
                            //console.log('In lte >>>>>>>>>>>>>>>>>>>>>>>>. ')
                            ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:true})
                        }else if(rule?.symbol==='lt' && Number(currFieldValue)<Number(rule?.minValue)){
                            //console.log('In lt >>>>>>>>>>>>>>>>>>>>>>>>. ')
                            ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:true})
                        }else if(rule?.symbol==='gte' && Number(currFieldValue)>=Number(rule?.maxValue)){
                            //console.log('In gte >>>>>>>>>>>>>>>>>>>>>>>>. ')
                            ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:true})
                        }else if(rule?.symbol==='gt' && Number(currFieldValue)>Number(rule?.maxValue)){
                            //console.log('In gt >>>>>>>>>>>>>>>>>>>>>>>>. ')
                            ValueList.push({name:rule?.id,value:{"error":rule?.message}, flag:true})
                        }else if (rule?.symbol === undefined) {
                          //console.log('In symbol undefined >>>>>>>>>>>>>>>>>>>>>>>>. ',Number(currFieldValue),Number(rule?.minValue),Number(rule?.maxValue),Number(currFieldValue)<Number(rule?.minValue),Number(currFieldValue)>=Number(rule?.maxValue))
                          // if(currFieldValue=='' || Number(currFieldValue)<Number(rule?.minValue)){
                          if (Number(currFieldValue) < Number(rule?.minValue)) {
                            ValueList.push({
                              name: rule?.id,
                              value: { error: rule?.message },
                              flag: true,
                            });
                            // }else if(Number(currFieldValue)>=Number(rule?.maxValue)){
                          } else if (Number(currFieldValue) > Number(rule?.maxValue)) {
                            ValueList.push({
                              name: rule?.id,
                              value: { error: rule?.message },
                              flag: true,
                            });
                          } else {
                            ValueList.push({
                              name: rule?.id,
                              value: { error: rule?.message },
                              flag: false,
                            });
                          }
                        }
                    }
                }else if(rule?.type === 'required'){
                    //console.log('In check Validations ::: rule 22222 >>>>>>>>', fieldName, currFieldValue)
                    if(currFieldValue==='' || currFieldValue===undefined || currFieldValue===null){
                        ValueList.push({name:fieldName,value:{"error":rule?.message}, flag:true});
                    }else{
                        ValueList.push({name:fieldName,value:{"error":rule?.message}, flag:false});
                    }
                }
            })
        }
    }
    //console.log('Validation expression :: expValue :: In check Validations ::: rule 22222 >>>>>>>> ',fieldName,ValueList)
    return ValueList;   
}


// export const checkValidationsOld = (values,fieldName,currFieldValue,fieldData,mandatory,payloadData) => {
//     if(!mandatory){
//         if(fieldData.value===""){
//             return 
//         }
//     }
//     let value;
//     let ValueList=[];
//     if(typeof values==='object' && values!==null){
//         if (Array.isArray(values)){
//             values.forEach(rule => {
//                     //console.log('In check Validations ::: rule >>> ',rule,currFieldValue,fieldName,rule?.target?.id)
//                     if(rule?.target!==undefined){
//                         if(fieldName===rule?.target?.id){
//                             const fieldValue=parseInt(fieldData.value)
//                             switch(rule?.target?.symbol){
//                                 case '<':{
//                                         if (fieldValue<currFieldValue) {
//                                             value = rule.value;
//                                         }else{
//                                             value = {"error":rule?.message};
//                                         }
//                                         break;
//                                     }
//                                 case '<=':{
//                                     //console.log('in Validation 2020202 >>>>>>>> ',fieldValue,currFieldValue)
//                                         if (fieldValue<=currFieldValue) {
//                                             value = rule.value;
//                                         }else{
//                                             value = {"error":rule?.message};
//                                         }
//                                         break;
//                                     }
//                                 case '>':{
//                                         if (fieldValue>currFieldValue) {
//                                             value = rule.value;
//                                         }else{
//                                             value = {"error":rule?.message};
//                                         }
//                                         break;
//                                     }
//                                 case '>=':{
                                
//                                         if (fieldValue>=currFieldValue) {
//                                             value = rule.value;
//                                         }else{
//                                             value = {"error":rule?.message};
//                                         }
//                                         break;
//                                     }
//                                 case '===':{
//                                         if (currFieldValue===fieldValue) {
//                                             value = rule.value;
//                                         }
//                                         break;
//                                     }
//                                 case '!==':{
//                                         if (currFieldValue!==fieldValue) {
//                                             value = rule.value;
//                                         }
//                                         break;
//                                     }
//                                 case 'Calculate':{
//                                     const expFlag=rule?.target?.expression;
//                                     if(expFlag){
//                                         if(payloadData[rule?.target?.id]!==undefined && payloadData[rule?.target?.id]!==""){
//                                             const expValue=calculateExpressionValue(rule,fieldName,currFieldValue,payloadData)
//                                             if(expValue===rule?.target?.value){
//                                                 ValueList.push({name:fieldName,value: {"error":rule?.message}});
//                                             // }else if(!expValue){
//                                             //     ValueList.push({name:fieldName,value: {"error":rule?.message}});
//                                             }
//                                         }
//                                     }
//                                     break;
//                                 }
//                                 default:{
//                                         value = rule.value;
//                                 }
                                
//                             }
//                         }
//                     }else if(rule?.id=== fieldName && rule?.minValue!==undefined){
//                         if(currFieldValue<rule?.minValue){
//                             ValueList.push({name:fieldName,value:{"error":rule?.message}});
//                         }
//                     }else if(rule?.type === 'required'){
//                         if(currFieldValue==='' || currFieldValue===undefined || currFieldValue===null){
//                             value = {"error":rule?.message};
//                         }
//                     }   
//                 })
//         }
//     }
//     //console.log('Validation expression :: final Value >>>>>>>> ',fieldName,ValueList)
//     return ValueList;   
// }


const checkDimension=(values,fieldName,currFieldValue,fieldData,selectedFields)=>{
    if(typeof values==='object'){
        if (Array.isArray(values)){
            return values[0]
            // values.forEach(dimension => {
            //     //console.log('check Dimension::1111 >>>>>>>> ',dimension,fieldName,currFieldValue,fieldData)
            //     // const displayUnit=getDisplayUnit(selectedFields);
            //     // const unitValue=defaultUnits[displayUnit][field?.dimensionName];
            //     return dimension
            // })
        }
    }else if(values!==""){
        if(fieldName==='SetPressure'){
            //console.log('check Dimension:::22222>>>>>>>> ',values,fieldName,currFieldValue,fieldData,selectedFields)
        }
        
    }
}

export const checkValues = (values,fieldName,fieldValue,field,payloadData,currField,focusedFieldName,units,callingFunction,preferences=null,defaultUnits=null) => {
    let value;
    if(typeof values==='object' && values!==null){
        //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 33333 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ',values,fieldName,fieldValue)
        if (Array.isArray(values)){
            //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 44444 >>>>>>>>> ',values,fieldName,fieldValue)
            values.forEach(rule => {
                    
                    
                const targetFlag=rule?.target;
                const targetId=targetFlag ? rule?.target?.id:rule?.id;
                const targetVal=targetFlag ? rule?.target?.value:rule?.value;
                const targetCurrentId=rule?.target?.currentId
                const fieldNameLen=field?.fieldName.split(FIELD_SPLITTER).length;
                const fieldNameArr=field?.fieldName.split(FIELD_SPLITTER);
                //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 555555 >>>>>>>>> ',values,fieldName,fieldValue,rule,focusedFieldName,fieldName===targetId,fieldValue===targetVal,rule?.target?.currentId===field?.fieldName)
                // if(rule?.target?.focusedField===undefined ||rule?.target?.focusedField===focusedFieldName || rule?.target?.focusedField===fieldName){
                // if(rule?.target?.focusedField===focusedFieldName){
                if(targetFlag){
                    //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 666666 >>>>>>>>>>>>>>>>>> ',targetId,fieldName,field.type,fieldName===targetId,fieldValue===targetVal,rule?.target?.currentId===field?.fieldName)
                    const apiflag=rule?.target?.api??rule?.target?.url??rule?.target?.query;
                    const functionFlag=rule?.target?.symbol==='Exec_Function' || rule?.target?.symbol==='Exec_Function_OnChange';
                    if(fieldName===targetId){
                        //console.log('In useTabPanel :: in check values:: 2222 22222 >>>>>>>>> ',targetId,fieldName,fieldName===targetId)
                        const expflag=rule?.target?.expression;
                        
                        if(expflag){
                            //console.log('In check values:: 2222 33333 >>>>>>>>> ',fieldValue)
                            if(fieldNameLen===1){
                                value=calculateExpressionValue(rule,fieldName,fieldValue,payloadData,field?.dimensionName,units,callingFunction);
                                //console.log('In check values:: 2222 444444 >>>>>>>>> ',field?.fieldName,targetId,fieldName,fieldValue,value,payloadData[field?.fieldName],rule)
                                if(rule?.target?.symbol==='COPY_FIELD_DATA' && value===true){
                                    value = {value:value,nextRound:rule?.target?.nextRound,ruleType:rule?.target?.symbol,rule:rule?.target};
                                    //console.log('In check values:: 2222 4444 1111s >>>>>>>>> ',field?.fieldName,value,rule)
                                }else{
                                    value = {value:value,nextRound:rule?.target?.nextRound};
                                }
                                
                            }else if(targetCurrentId===currField){
                                value=calculateExpressionValue(rule,fieldName,fieldValue,payloadData,field?.dimensionName,units,`${callingFunction} 2`);
                                //console.log('In check values:: 22222 55555 >>>>>>>>> ',field?.fieldName,targetId,fieldName,fieldValue,value,payloadData[field?.fieldName])
                                value = {value:value,nextRound:rule?.target?.nextRound};
                            }
                        }else if (fieldValue===targetVal) {
                            //console.log('In check values:: 333333 >>>>>>>>> ',value,rule)
                            if(rule?.target?.currentId===field?.fieldName){
                                value = rule.value;
                            }
                        }
                    }else if(functionFlag){
                        if(field.type =='multiInputUom'){
                            //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 7777777 >>>>>>>>>>>>>>>>>> ',values,fieldName,fieldValue,field,currField,fieldNameArr, rule?.target?.functionReqFields)
                            if(rule?.target?.functionReqFields.includes(fieldName) && fieldNameArr.includes(currField) && field.type =='multiInputUom' && preferences!==null){
                                const config={functionName:rule?.target?.functionName,functionFields:rule?.target?.functionReqFields,requiredUnits:rule?.target?.requiredUnits}
                                //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 888888 >>>>>>>>>>>>>>>>>> ',values,fieldName,fieldValue,field,currField,fieldNameArr, rule?.target?.functionReqFields)
                                let item = {name:fieldName,value:fieldValue,for:'multiInputUom'}
                                let config1=funcExecRequiredFields(config,payloadData,preferences,units,defaultUnits,item);
                                let result=ExecuteFunction(rule?.target?.functionName,config1)
                                //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 9999999 >>>>>>>>>>>>>>>>>> ', result,config1)
                                value={value:result,nextRound:rule?.target?.nextRound,ruleType:"SAVE_CALCULATED_VALUES",rule:rule}
                                // if(currField === fieldNameArr[0]){
                                //     value={value:21,nextRound:rule?.target?.nextRound}
                                // }else{
                                //     value={value:22,nextRound:rule?.target?.nextRound}
                                // }
                            }
                       }else if(field?.fieldName===fieldName || field?.fieldName.indexOf(fieldName)!==-1){
                            //console.log('In use PopupPanel:::calculatedFields:: multiInputUom:: 5555555 >>>>>>>>>>>>>>>>>> ',values,fieldName,fieldValue,field,currField,fieldNameArr, rule?.target?.functionReqFields)
                            //value=ExecuteFunction(rule?.target?.functionName,rule,payloadData,units,fieldName,fieldValue)
                            const config={functionName:rule?.target?.functionName,functionFields:rule?.target?.functionReqFields,requiredUnits:rule?.target?.requiredUnits}
                            value={value:config,functionFields:rule?.target?.functionReqFields,nextRound:rule?.target?.nextRound,ruleType:rule?.target?.symbol,rule:rule}
                            ////console.log('In useTabPanel :: In checkValue ::function excution::  defaultValue >>>>>> ',value)
                       }
                    }else if(apiflag){
                        
                        const config=apiFunctionCall(rule?.target,fieldName,fieldValue,payloadData)
                        
                        value={value:config,nextRound:rule?.target?.nextRound,ruleType:rule?.target?.symbol,checkSuperCritical:rule?.target?.checkSuperCritical}
                        //console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 :: In check values:: 444444 >>>>>>>>> ',value,rule)
                    }
                    //console.log(' in check values:: 555555 >>>>>>>>> ',targetId,value,fieldName,fieldValue,rule)
                }else if(fieldName===targetId){
                    if (fieldValue===targetVal) {
                        if(rule?.target?.currentId===field?.fieldName){
                            value = !rule.value;
                        }
                    }
                }
                // }
            })
        }
    }
    //console.log('In useTabPanel :: check Values:: 666666 >>>>>>>> ',value)
    return value;   
}

export const checkValuesUnitConversion = (values,fieldName,fieldValue,field,payloadData,currField,focusedFieldName,units) => {
    let value;
    if(typeof values==='object' && values!==null){
        //console.log('In check values:::: 111111 >>>>>>>>>>>>>>>>>> ',values,fieldName,fieldValue)
        if (Array.isArray(values)){
            //console.log(' in check values:: 11111 22222 >>>>>>>>> ',values,fieldName,fieldValue)
            values.forEach(rule => {
                    //console.log(' check ValuesUnitConversion:: 222222 >>>>>>>>> ',values,fieldName,fieldValue,rule,focusedFieldName)
                    
                    const targetFlag=rule?.target;
                    const targetId=targetFlag ? rule?.target?.id:rule?.id;
                    const targetVal=targetFlag ? rule?.target?.value:rule?.value;
                    const targetCurrentId=rule?.target?.currentId
                    const fieldNameLen=field?.fieldName.split(FIELD_SPLITTER).length;
                    // if(rule?.target?.focusedField===undefined ||rule?.target?.focusedField===focusedFieldName || rule?.target?.focusedField===fieldName){
                    if(((rule?.target?.focusedField===undefined || rule?.target?.focusedField==="") && IGNORE_FIELDS.indexOf(field?.fieldName)===-1) ||rule?.target?.focusedField===focusedFieldName){
                        if(targetFlag){
                            //console.log(' check ValuesUnitConversion:: 22221111 >>>>>>>>> ',targetId,fieldName,fieldName===targetId)
                            const apiflag=rule?.target?.api;
                            if(fieldName===targetId){
                                //console.log(' check ValuesUnitConversion:: 2222 22222 >>>>>>>>> ',targetId,fieldName,fieldName===targetId)
                                const expflag=rule?.target?.expression;
                                
                                if(expflag){
                                    //console.log('Icheck ValuesUnitConversion:: 2222 33333 >>>>>>>>> ',fieldValue)
                                    if(fieldNameLen===1){
                                        value=calculateExpressionValue(rule,fieldName,fieldValue,payloadData,field?.dimensionName,units,"check_ValuesUnitConversion");
                                        //console.log('In check values:: 2222 444444 >>>>>>>>> ',field?.fieldName,targetId,fieldName,fieldValue,value,payloadData[field?.fieldName])
                                        value = {value:value,nextRound:rule?.target?.nextRound};
                                    }else if(targetCurrentId===currField){
                                        value=calculateExpressionValue(rule,fieldName,fieldValue,payloadData,field?.dimensionName,units,"check_ValuesUnitConversion 2");
                                        //console.log('In check values:: 22222 55555 >>>>>>>>> ',field?.fieldName,targetId,fieldName,fieldValue,value,payloadData[field?.fieldName])
                                        value = {value:value,nextRound:rule?.target?.nextRound};
                                    }
                                }else if (fieldValue===targetVal) {
                                    //console.log('In check values:: 333333 >>>>>>>>> ',value,rule)
                                    if(rule?.target?.currentId===field?.fieldName){
                                        value = rule.value;
                                    }
                                }
                            }else if(apiflag){
                                
                                const config=apiFunctionCall(rule?.target,fieldName,fieldValue,payloadData)
                                
                                value={value:config,nextRound:rule?.target?.nextRound,ruleType:rule?.target?.symbol}
                                //console.log('In check values:: 444444 >>>>>>>>> ',value,rule)
                            }
                            //console.log(' in check values:: 555555 >>>>>>>>> ',targetId,value,fieldName,fieldValue,rule)
                        }else if(fieldName===targetId){
                            if (fieldValue===targetVal) {
                                if(rule?.target?.currentId===field?.fieldName){
                                    value = !rule.value;
                                }
                            }
                        }
                    }
                })
        }
    }
    //console.log('check Values:: 666666 >>>>>>>> ',value)
    return value;   
}



export const calculateExpression=(expArray,fieldName,fieldValue,payload)=>{
    let value;
    if(typeof expArray==='object' && expArray!==null){
        if (Array.isArray(expArray)){
            expArray.forEach(rule => {
                //console.log('In calculateExpression:: 000000:: rule >>> ',rule,fieldValue,fieldName,rule?.target?.id)
                if(rule?.target!==undefined){
                    //console.log('In calculateExpression:: 111111  :: Calculate >>>>>>>> ',rule,fieldValue,fieldName,rule?.target?.id)
                    const expFlag=rule?.target?.expression;
                    if(expFlag){
                        
                        value=calculateExpressionValue(rule,fieldName,fieldValue,payload);
                    }
                }
            })
        }
    }
    return value;
}

export const getTargetFields = (fields,reqFieldName,fieldName,fieldValue,selectedFields=null,payloadData=null, units=null, error=null,focusedFieldName=null,callingFunction='getTargetFields',preferences=null,defaultUnits=null) => {
    //console.log('checkValidation ====> srk', reqFieldName, error, 'fields', fields, fieldName,selectedFields,payloadData)
    let valueList=[];
    fields.forEach(field => {
        
        const localFieldNames=field.fieldName.split(FIELD_SPLITTER)
        //console.log('In use PopupPanel:::Popup Change 11111 >>>>>>>>>>>> 9999999 ::In get TargetFields:: 111>>>>>>>>>> ',field,fieldName,fieldValue,field.fieldName,reqFieldName,field[reqFieldName],field.fieldName!==fieldName,field[reqFieldName]!==undefined,field.fieldName!==fieldName && field[reqFieldName]!==undefined,localFieldNames)
        if(field.fieldName!==fieldName && field[reqFieldName]!==undefined){
            let value;
            localFieldNames.forEach(localfield => {
                if(reqFieldName==='validations'){
                    let mandatory;
                    if (field.mandatory !== undefined) {
                        mandatory = checkMandatory(field.mandatory, selectedFields,payloadData,fields,field);
                        mandatory=typeof mandatory==='object'?mandatory[field.fieldName]:mandatory;
                    }
                    //console.log('In   ::: check Validations ::: 0000 >>>>>>>>>> ',field.fieldName, localfield)
                    //const fieldData=selectedFields.find(selectedField => selectedField.name === field.fieldName);
                    let fieldData=selectedFields.find(selectedField => selectedField.name === localfield);
                    // if(fieldData===undefined || fieldData===null || fieldData.value===undefined || fieldData.value===null || fieldData.value===""){
                    //     fieldData=currUpdatedFields?.find(selectedField => selectedField.name === localfield);
                    // }
                    //console.log('In get TargetFields :::validations: fieldData 11111111>>>>>>>>>> ',field[reqFieldName],field,field.fieldName,fieldName,fieldValue,fieldData)
                    if(fieldData!==undefined){
                        value=checkValidations(field[reqFieldName],fieldName,fieldValue ?? 0,fieldData,mandatory,payloadData,field, units,callingFunction);
                    //    console.log('In Popup >>>>>>>>>>>> In get TargetFields ::: check Validations ::: 1111111111111 >>>>>>>>>> ',reqFieldName,field.fieldName,fieldName,value)
                        
                    }
                    if(value!==undefined && value.length>0){
                        // let fieldError=[]
                        // value.forEach(item => {
                        //     fieldError.push({name:field.fieldName,value:item.value});
                        // })
                        valueList.push(...value);
                    }
                }else if(reqFieldName==='dimensionName'){
                    //console.log('dimensionName >>>>>> >>>>>>>>>>>. ',localFieldNames)
                    const fieldData=selectedFields.find(selectedField => selectedField.name === field?.UomFieldName);
                    if(fieldData===undefined){
                        value=checkDimension(field[reqFieldName],fieldName,fieldValue ?? 0,fieldData,selectedFields);

                    }
                    if(value!==undefined){
                        const localValueField=valueList?.length>0? valueList.find(item => item.name===field?.UomFieldName):undefined;
                        if(localValueField===undefined){
                            valueList.push({name:field?.UomFieldName,value:value,mandatory:field.mandatory});
                            
                        }
                    }
                    //console.log('In get TargetFields:::check DefaultValue  >>>>>>>>>> ',value,field[reqFieldName],fieldName,fieldValue,selectedFields)
                }else{
                    value=checkValues(field[reqFieldName],fieldName,fieldValue,field,payloadData,localfield,focusedFieldName,units,callingFunction,preferences,defaultUnits);
                    if(value!==undefined){
                        //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 10 10 10 10 >>>>>>>> ',field.fieldName,value,fieldName,fieldValue,reqFieldName,field.type)
                        if(reqFieldName === 'calculateFields' && field.type==='multiInputUom'){
                            //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 11 11 11 11 >>>>>>>> ',field.fieldName,value,fieldName,fieldValue)
                            field.fieldName.split(FIELD_SPLITTER).forEach(fd => {
                                if(fd===fieldName){
                                    if(value!==undefined){
                                        valueList.push({name:fieldName,value:value.value,nextRound:value?.nextRound,ruleType:value?.ruleType,rule:value?.rule});
                                    }
                                }
                            })
                        }
                    }
                }
                //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 12 12 12 12 >>>>>>>>>> ',valueList)
                if(value!==undefined && reqFieldName!=='validations' && reqFieldName!=='calculateFields' 
                    && reqFieldName!=='dimensionName'){
                    // valueList.push({name:fieldName,value:value});
                    if(typeof value==='object'){
                        if(value.nextRound!==undefined){
                            valueList.push({name:localfield,value:value.value,mandatory:field.mandatory,nextRound:value.nextRound});
                        // }else if(Object.keys(value).length>1){
                        //     Object.keys(value).forEach(key => {
                        //         const localValueList=valueList.filter(item => item.name!==key);
                        //         valueList=[...localValueList,{name:key,value:value[key]}];
                        //     })
                                
                        }else{
                            valueList.push({name:localfield,value:value.value,mandatory:field.mandatory});
                        }
                    }else{
                        valueList.push({name:localfield,value:value,mandatory:field.mandatory});
                    }
                }
                // if(reqFieldName === 'defaultValue'){
                //     //console.log('In useTabPanel :: In taget fields::: 7777 >>>>>>>> ',valueList)
                // }
            })
        }else if(field.fieldName===fieldName){
            let value;
            if(reqFieldName==='dimensionName'){
                //console.log('In dimension 222222>>>>> ',selectedFields,field,fields)
                const fieldData=selectedFields.find(selectedField => selectedField.name === field?.UomFieldName);
                if(fieldData===undefined){
                    value=checkDimension(field[reqFieldName],fieldName,fieldValue ?? 0,fieldData,selectedFields);
                }
                if(value!==undefined){
                    valueList.push({name:field?.UomFieldName,value:value,mandatory:field.mandatory});
                }
            }else if(reqFieldName==='validations'){
                let mandatory;
                if (field.mandatory !== undefined) {
                    mandatory = checkMandatory(field.mandatory, selectedFields,payloadData,fields,field);
                    mandatory=typeof mandatory==='object'?mandatory[field.fieldName]:mandatory;
                }
                const fieldData=selectedFields.find(selectedField => selectedField.name === field.fieldName);
                //console.log('In get TargetFields :::validations 2222>>>>>>>>>> ',field[reqFieldName],field,field.fieldName,fieldName,fieldValue,fieldData)
                if(fieldData!==undefined){
                    value=checkValidations(field[reqFieldName],fieldName,fieldValue ?? 0,fieldData,mandatory,payloadData,field, units);
                    //console.log('In get TargetFields ::: check Validations ::: 22222 :: value >>>>>>>>>> ',reqFieldName,field.fieldName,value)
                    // return value
                }
                if(value!==undefined && value.length>0){
                    valueList.push(...value);
                }
            }else if(reqFieldName==='calculateFields'){
                //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 22222 :: >>>>>>>>>> ',field.fieldName,value,field[reqFieldName],fieldName,fieldValue)
                value=checkValues(field[reqFieldName],fieldName,fieldValue,field,payloadData,field?.fieldName,focusedFieldName,units,callingFunction,preferences,defaultUnits);
                //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 10 10 10 :: >>>>>>>>>> ',field.fieldName,value,field[reqFieldName],fieldName,fieldValue)
                if(value!==undefined){
                    valueList.push({name:field.fieldName,value:value.value,nextRound:value?.nextRound,ruleType:value?.ruleType,rule:value?.rule});
                }
            }else if(reqFieldName==='defaultValue'){
                //console.log('In get TargetFields:::check DefaultValue::::222222  >>>>>>>>>> ',field.fieldName,value,field[reqFieldName],fieldName,fieldValue,selectedFields)
                value=checkValues(field[reqFieldName],fieldName,fieldValue,field,payloadData,field?.fieldName,focusedFieldName,units,callingFunction,preferences,defaultUnits);
                
                if(value!==undefined){
                    valueList.push({name:field.fieldName,value:value.value,mandatory:field.mandatory,nextRound:value?.nextRound});
                }
            }else{
                value=checkValues(field[reqFieldName],fieldName,fieldValue,field,payloadData,field?.fieldName,focusedFieldName,units,callingFunction,preferences);
                if(value!==undefined){
                    valueList.push({name:field.fieldName,value:value,mandatory:field.mandatory});
                }
            }
            
        }else if(field[reqFieldName]!==undefined){
            if(reqFieldName==='validations'){
                let mandatory;
                if (field.mandatory !== undefined) {
                    mandatory = checkMandatory(field.mandatory, selectedFields,payloadData,fields,field);
                    //console.log('In get TargetFields::validations::mandatory >>>>>>>>>>> ',field.fieldName,mandatory)
                }
                const fieldData=selectedFields.find(selectedField => selectedField.name === field.fieldName);
                //console.log(' 4444>>>>>>>>>> ',field[reqFieldName],fieldName,fieldValue)
                let value=checkValidations(field[reqFieldName],fieldName,fieldValue??0,fieldData,mandatory,payloadData,field, units,callingFunction);
                //console.log('In get TargetFields ::: check Validations 5555>>>>>>>>>> ',reqFieldName,field.fieldName,value)
                if(value!==undefined){
                    valueList.push({name:field.fieldName,value:value,mandatory:field.mandatory});
                }
            }else if(reqFieldName==='dimensionName'){
                //console.log('In dimension 333333 >>>>> ',selectedFields,field,fields)
            }
        }else if(reqFieldName==='dimensionName'){
                //console.log('In dimension 44444 >>>>> ',selectedFields,field,fields)
        }
    });
    // if(reqFieldName === 'calculateFields'){
    //     //console.log('In use PopupPanel:::calculatedFields:: In CalculatePressureAPI2000 >> 13 13 13 13 >>>>> ',reqFieldName,valueList)
    // }
    if(reqFieldName === 'validations'){
       
            let errorList = error!==null?JSON.parse(JSON.stringify(error)):[];
            return updateErrorList(errorList, valueList);
    }
    return valueList;
}

function updateErrorList(errorList, updateErrors) {
    updateErrors.forEach(({ name, value, flag }) => {
        // Find the index of the error with the same name and message
        const errorIndex = errorList.findIndex(
            error => error.name === name && error.value.error.message === value.error.message
        );

        if (flag) {
            // Add the error if it doesn't exist, or update if it does
            if (errorIndex === -1) {
                errorList.push({ name, value });
            } else {
                // Optionally update the existing error if needed
                errorList[errorIndex] = { name, value };
            }
        } else {
            // Remove the error if it exists
            if (errorIndex !== -1) {
                errorList.splice(errorIndex, 1);
            }
        }
    });

//console.log('updateError List', errorList);
    return errorList;
}


export const getUOMKey=(dimensionName,UOMFieldName=null)=>{
    if(dimensionName==='pressure' && UOMFieldName==='PressureUOM'){
        return `PressureUOM`;
    }else if(dimensionName==='pressure' && UOMFieldName==='PressureUOMVacuum'){
        return `PressureUOMVacuum`
    }else if(dimensionName==='abspressure'){
        return `AtmPressureUOM`
    }else if(dimensionName==='temperature'){
        return `TemperatureUOM`
    }else if(dimensionName==='viscosity' || dimensionName==='viscositykin'){
        return `ViscosityUOM`
    }else if(dimensionName==='specificvolume'){
        return `SpecificVolumeUOM`
    }else if(dimensionName==='density'){
        return `DensityUOM`
    }else if(dimensionName==='%'){
        return `%`
    }else if(dimensionName==='volume'){
        return `VolumeUOM`
    }else if(dimensionName==='liquidvolflow'){
        return `LiquidvolFlowUOM`
    }else if(dimensionName==='latentheat'){
        return `LatentHeatUOM`
    }else if(dimensionName==='area'){
        return `AreaUOM`
    }else if(dimensionName==='length'){
        return `LengthUOM`
    }else if(dimensionName==='thermalconductivity'){
        return `ThermalconductivityUOM`
    // }else if(dimensionName==='gasvolflow'){
    //     return `GasvolflowUOM`
    }else if(dimensionName==='heattransfer'){
        return `HeattransferUOM`
    }else if(dimensionName==="gasvolflow" || 
            dimensionName==="gasvolflowact" || 
            dimensionName==="massflow" || 
            dimensionName==="liquidvolflow"){
        return `FlowCapacityUOM`
    }else{
        //console.log('getUomKey >>>>>>>>>>', dimensionName)
    }
}

export const getDisplayUnit=(selectedFields)=>{
    let displayUnit=selectedFields.find((item)=>item.name==='DisplayUnitSystem')?.value;
    displayUnit=displayUnit===undefined?'English':displayUnit==='Metric'?displayUnit:'English';

    return displayUnit
}

export const getDefaultValue=(item,selectedFields,fieldName,payloadData,focusedFieldName,units)=>{
    if(fieldName==='Diameter_d' || fieldName==='TankVolume'){
        ////console.log('In :: get DefaultsValues >> getDefaultValue:: 000000 >>>>> ',fieldName, focusedFieldName)
    }
    let localValue;
    if(typeof item.defaultValue==='object'){
        if(Array.isArray(item.defaultValue)){
            
            item?.defaultValue.forEach(rule => {
                
                if(rule?.target!==undefined){
                    const targetField = selectedFields?.find(fl => fl.name === rule?.target.id);
                    const data= selectedFields?.find(fl => fl.name === fieldName);
                    const functionFlag=rule?.target?.symbol==='Exec_Function';

                    if(functionFlag){
                        
                        const outputValue= ExecuteFunction(rule?.target?.functionName,rule,payloadData,units);
                        //console.log('get DefaultValue function call>>>>>>>>>>>>>>>>>>>>>>> ',rule,fieldName, focusedFieldName,outputValue)
                        localValue=outputValue
                    }else{
                        const expFlag=rule?.target?.expression;
                        const targetCurrentId=rule?.target?.currentId;
                        //console.log('In get SizingFields :: get DefaultValue :: 111111  :: Calculate >>>>>>>> ',rule,fieldName,targetCurrentId,expFlag,data,targetField,focusedFieldName,rule?.target?.focusedField,targetField.value!=="" , fieldName===targetCurrentId , !isNaN(Number(targetField.value)))
                        if(targetField && expFlag  && (rule?.target?.focusedField===focusedFieldName || focusedFieldName===undefined || focusedFieldName==='')){
                            if(targetField.value!=="" && fieldName===targetCurrentId && !isNaN(targetField.value)){
                                localValue=calculateExpressionValue(rule,targetField.name,targetField.value,payloadData,item?.dimensionName,units,"getDefaultValue");
                                //console.log('In get SizingFields :: get DefaultValue :: 111111 2222222  :: Calculate >>>>>>>> ',fieldName,localValue)
                            }else if(data!==undefined && data?.value!==undefined){
                                localValue = data?.value;  
                                //console.log('In get SizingFields :: get DefaultValue :: 111111 333333  :: Calculate >>>>>>>> ',fieldName,localValue)  
                            }else{
                            // localValue=undefined 
                                localValue=rule?.value 
                                //console.log('In get SizingFields :: get DefaultValue :: 111111 444444  :: Calculate >>>>>>>> ',fieldName,localValue)
                            }
                            //console.log('In get SizingFields :: get DefaultValue :: 2222222  :: Calculate >>>>>>>> ',rule,fieldName,localValue)
                        }else if (targetField && data===undefined) {
                            if(!rule?.target.value){
                                localValue = rule.value;
                            }else if(rule?.target?.value ===undefined){
                                localValue = rule.value;
                            }
                        }else if(data!==undefined && data?.value!==undefined){
                            localValue = data?.value;    
                        }else if(rule?.target?.value==data?.value || data?.value===undefined || data?.value===''){
                            localValue = rule.value;
                        }
                    }
                }
            }) 
        }else{
            localValue=item.defaultValue.value
            if(fieldName==='Diameter_d' || fieldName==='TankVolume'){
               //console.log('In :: get DefaultsValues >> getDefaultValue:: 999999  >>>>> ',fieldName,localValue)
            }
        }
    }else if(FIELDLIST_DISPLAY_OPTIONS.indexOf(item.type) !==-1){
        if((item.type==='radio' || (item.type==='radioInput' && FIELD_GROUPS.indexOf(item.fieldGroupName)!==-1)) && payloadData[item.fieldGroupName]!==undefined){
            localValue=payloadData[item.fieldGroupName]===item.fieldName?true:false;
        }else{
            localValue=item.defaultValue
        }
    }else{
        localValue=item.defaultValue
    }
    //console.log('first localValue >>>>>>>>>>>>>>>>>>>>>>> ',localValue)
    return localValue
}

export const checkDefaults=(field,fieldName,selectedFields,payloadData,focusedFieldName,units,inputs)=>{
    let defaultValue={};
    // console.log('In defaultValue >>>>>>>>>. ',field.defaultValue,fieldName,focusedFieldName)
    if(field.defaultValue !== undefined){
        // console.log('In defaultValue 111111111 >>>>>>>>>. ',field.defaultValue,fieldName,focusedFieldName,Array.isArray(fieldName),FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1)
        if(Array.isArray(fieldName)){
            fieldName.forEach(localItem => {
                const localdefaultValue=inputs[localItem] ?? checkDefaultValue(field.defaultValue,selectedFields,field,localItem,payloadData,units);
                //console.log('In get SizingFields ::: field.defaultValue111 33333>>>>>>>>>>>>>>>>>. ',localItem,localdefaultValue)
                if(typeof localdefaultValue==='object'){
                    defaultValue[localItem]=localdefaultValue[localItem]
                }else{
                    defaultValue[localItem]=localdefaultValue
                }
                
                //console.log('In get SizingFields ::::::: ::::defaultValue ::: 444444 >>>>>>>>>>> ',fieldName,localdefaultValue)
            })
        }else if(FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1){
            // console.log('In defaultValue 111111111 >>>>>>>>>. ',field.defaultValue,fieldName,field?.fieldList?.length)
            field?.fieldList?.forEach(item => {
                // console.log('In get SizingFields ::: radio Input:: item >>>>>>>> ',item.fieldName,Array.isArray(item.fieldName),payloadData[item.fieldName],item);
                if(Array.isArray(item.fieldName)){
                    item.fieldName.forEach(localItem => {
                        let localValue=inputs[localItem] ?? getDefaultValue(item,selectedFields,localItem,payloadData,focusedFieldName,units);
                        // console.log('In get SizingFields ::: radio Input:: item >>>>>>>> ',localItem,payloadData[localItem],localValue,typeof localValue==='object');
                        if(typeof localValue==='object'){
                            defaultValue[localItem]=localValue[localItem]!==undefined && localValue[localItem]!==null && localValue[localItem]!==''?localValue[localItem]:payloadData[localItem]
                        }else{
                            defaultValue[localItem]=localValue!==undefined && localValue!==null && localValue!==''?localValue:payloadData[localItem]
                        }
                    })
                }else{
                    let localValue=inputs[item.fieldName] ?? getDefaultValue(item,selectedFields,item.fieldName,payloadData,focusedFieldName,units);
                    // if(item.type==='radioInput'){
                    //     //console.log('Popup 1111 >>>>>>>>>>>> In get SizingFields :-:: radioInput Input1122:: item >>>>>>>> ',item.fieldName,item.type, localValue);
                    // }
                    defaultValue[item.fieldName]=localValue===undefined?'':localValue
                }

            })
            //console.log('In get SizingFields ::: radio Input:: item:: defaultValue >>>>>>>> ',defaultValue);
        }else if(field?.type==='inputUom'){   
            if(field.fieldName.split(FIELD_SPLITTER).length>1){
                field.fieldName.split(FIELD_SPLITTER).forEach(localItem => {
                    let localValue=inputs[localItem] ?? getDefaultValue(field,selectedFields,localItem,payloadData,focusedFieldName,units);
                    defaultValue[localItem]=localValue
                })
            }else{
                let localValue=inputs[field.fieldName] ?? getDefaultValue(field,selectedFields,field.fieldName,payloadData,focusedFieldName,units);
                defaultValue[field.fieldName]=localValue
            }
            //console.log('In get SizingFields ::: field.defaultValue 8888888>>>>>>>>>>>>>>>>>. ',defaultValue,localValue)
        }else{
            //console.log('In defaultValue 5555555>>>>>>>>>. ',field.defaultValue,fieldName,focusedFieldName)
           defaultValue=inputs[fieldName] ?? checkDefaultValue(field.defaultValue,selectedFields,field,fieldName,payloadData,units);
        }
    }
    return defaultValue
}


function assignDefaultIfInvalid(value, defaultValue) {
    // Check each key in the value object
    //console.log('In assign DefaultIfInvalid >>>>>>>>>>>>>>>>>>',value,defaultValue)
    for (const key in value) {
        //console.log('In assign DefaultIfInvalid >>>>>>>>>>>>>>>>>>',value,defaultValue,value?.hasOwnProperty(key) && (isNaN(value[key]) || value[key] === ''),value?.hasOwnProperty(key) && (isNaN(value[key])) || value[key] === '')
      if (value?.hasOwnProperty(key) && (isNaN(value[key]) || value[key] === '')) {
        return defaultValue;
      }
    }
    return value;
  }

export const CheckUsCustomary=(fieldName,value)=>{
    return (fieldName==='DisplayUnitSystem' || fieldName==='CalculationMethod') && value==='English'?'US Customary' :value
}

export const getSizingFields=(displayType,items,selectedFields,payloadData,defaultUnits,error,focusedFieldName,units,preference,validationResults)=>{
    if ((displayType === 'form' || displayType === 'popup') && items !== undefined && items !== null && items.length > 0) {
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> get SizingFields >>>>>>>>>>>>>>>>> ',validationResults,items,payloadData)
        let disabledFields={};
        let mandatoryFields={};
        let visibleFields={};
        let inputs={};
        if(validationResults!==null){
            disabledFields=validationResults?.disabledFields ?? {};
            mandatoryFields=validationResults?.mandatoryFields ?? {};
            visibleFields=validationResults?.visibleFields ?? {};
            inputs=validationResults?.inputs ?? {};
        }
        const popupFlowChangeFlag=payloadData['FlowRatePopupFlag'] && payloadData['API2000WreqChangeWarningFlag']!==true?true:false;
        const popupFlowVacuumChangeFlag=payloadData['FlowRateVacuumPopupFlag'] && payloadData['API2000WreqVChangeWarningFlag']!==true?true:false;
        const updatedItems = items?.map((field,index) => {
            let funcExecResultFields=[];
            let disabled = false;
            let fieldList=field?.fieldList===undefined?[]:[...field?.fieldList]
            let defaultValue={};
            let componentError=null;
            let mandatory;
            let unitValue;
            let visible=true;
            let fieldName = types.indexOf(field.type) !==-1?field?.fieldName?.split(FIELD_SPLITTER):field?.fieldName;
            fieldName=fieldName!==undefined && fieldName!==null?fieldName?.indexOf(FIELD_SPLITTER)!==-1?fieldName?.split(FIELD_SPLITTER):fieldName:fieldName;
            // if(field?.type==='radioInput'){
            //     console.log('Popup Change 11111 >>>>>>>>>>>> FIELD_SPLITTER >>>>>>>>>>>>>>>>>>>> ',field,fieldName,field.type,fieldList,visibleFields)
            // }
            // fieldName= types.indexOf(field.type) !==-1? fieldName:fieldName?.length===1?fieldName[0]:fieldName;
            let label=field.type==='checkbox' || field.type==='label'?field?.label.split(FIELD_SPLITTER):checkLabelValue(field?.label,selectedFields,payloadData,field);
 
            let dimensionName;
            if (field.visible !== undefined) {
                if(Array.isArray(fieldName)){
                    visible={};
                    fieldName.forEach(localItem => {
                        let localvisible = visibleFields[localItem] ?? checkVisibility(field.visible, selectedFields,payloadData,field);
                        // console.log('Popup Change 11111 >>>>>>>>>>>> 111111In getSizingDataL visible >>>>>>>>>>>>> ',localItem,localvisible,visibleFields[localItem])
                        if(typeof localvisible==='object'){
                            visible[localItem]=localvisible[localItem]
                        }else{
                            visible[localItem]=localvisible
                        }
                        
                    })
                    // console.log('Popup Change 11111 >>>>>>>>>>>> 222222 >>>>> In getSizingDataL visible >>>>>>>>>>>>> ',visible)
                }else if(FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1){
                    visible={};
                    fieldList?.forEach(item => {
                        // console.log('In get SizingFields ::: field.visible 4444::: radio Input:: item >>>>>>>> ',item);
                        if(Array.isArray(item.fieldName)){
                            item.fieldName.forEach(localItem => {
                                let localValue = visibleFields[localItem] ??checkVisibility(item.visible, selectedFields,payloadData,localItem,visibleFields);
                                if(typeof localValue==='object'){
                                    visible[localItem]=localValue[localItem]
                                }else{
                                    visible[localItem]=localValue
                                }
                            })
                        }else{
                            let localValue = visibleFields[item.fieldName] ??checkVisibility(item.visible, selectedFields,payloadData,item.fieldName,visibleFields);
                            visible[item.fieldName]=localValue===undefined?'':localValue
                            // console.log('In get SizingFields ::: radioInput:: localValue >>>>>>>> ',localValue, visible);
                        }
        
                    })
                    // console.log('Popup Change 11111 >>>>>>>>>>>> 4444 >>>>> In getSizingDataL visible >>>>>>>>>>>>> ',field?.fieldName,fieldName,field.visible,visible)
                }else{
                    visible = visibleFields[fieldName] ?? checkVisibility(field.visible, selectedFields,payloadData,field);
                    // console.log('Popup Change 11111 >>>>>>>>>>>> 55555 >>>>> In getSizingDataL visible >>>>>>>>>>>>> ',fieldName,visibleFields[fieldName],field.visible,visible)
                }
            }
            let localFlag=false;
            // if(field?.type==='radioInput'){
            //     console.log('Popup Change 11111 >>>>>>>>>>>> 222222 visible::: >>>>>>> ',field?.fieldName,visible,fieldList,field.mandatory,field?.type)
            // }
            if (field.mandatory !== undefined) {
                if(field?.type==='radioInput'){
                    // console.log('Popup Change 11111 >>>>>>>>>>>> 333333 localDisabledValue::: >>>>>>> ',field?.fieldName,mandatory,Array.isArray(fieldName),fieldName,payloadData,field)
                }
                if(Array.isArray(fieldName)){
                    mandatory={};
                    // console.log('In get SizingFields ::: field.visible 33333::: radio Input:: item 1111111111 >>>>>>>> ',fieldName,FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1,Array.isArray(fieldName),payloadData,field);
                    fieldName.forEach(localItem => {
                        let localmandatory = mandatoryFields[localItem] ?? checkMandatory(field.mandatory, selectedFields,payloadData,items,field,mandatoryFields);
                        if(typeof localmandatory==='object'){
                            mandatory[localItem]=localmandatory[localItem]
                        }else{
                            mandatory[localItem]=localmandatory
                        }
                    })
                }else if(FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1){
                    mandatory={};
                    // console.log('In get SizingFields ::: field.visible 4444::: radio Input:: item 222222222 >>>>>>>> ',field?.fieldName,FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1,fieldList)
                    fieldList?.forEach(item => {
                        // console.log('In get SizingFields ::: field.visible 4444::: radio Input:: item >>>>>>>> ',item,Array.isArray(item.fieldName),payloadData);
                        if(Array.isArray(item.fieldName)){
                            item.fieldName.forEach(localItem => {
                                let localValue = mandatoryFields[localItem] ??checkMandatory(item.mandatory, selectedFields,payloadData,localItem,visibleFields);
                                if(typeof localValue==='object'){
                                    mandatory[localItem]=localValue[localItem]
                                }else{
                                    mandatory[localItem]=localValue
                                }
                            })
                        }else{
                            let localValue = mandatoryFields[item.fieldName] ??checkMandatory(item.mandatory, selectedFields,payloadData,item.fieldName,visibleFields);
                            mandatory[item.fieldName]=localValue===undefined?'':localValue
                            // console.log('In get SizingFields ::: radioInput:: localValue >>>>>>>> ',localValue, visible);
                        }
        
                    })
                    // console.log('In get SizingFields ::: field.visible 4444::: radio Input:: item >>>>>>>> ',field?.fieldName,mandatory);
                }else {
                    // console.log('In get SizingFields ::: field.visible 4444::: radio Input:: item 222222222 >>>>>>>> ',field?.fieldName,FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1,fieldList)
                    mandatory = mandatoryFields[field?.fieldName] ?? checkMandatory(field.mandatory, selectedFields,payloadData,items,field,mandatoryFields);
                }
            }else if(field.type==='radioInput'){
                // if(field?.type==='radioInput'){
                    // console.log('Popup Change 11111 >>>>>>>>>>>> 222222 >>>> 33333 localDisabledValue::: >>>>>>> ',field?.fieldName,visible,fieldList,mandatoryFields)
                // }
                mandatory={};
                fieldList=fieldList?.map(item => {
                        let localmandatory=false;
                        let fieldGroupName=null;
                        // console.log('Popup Change 11111 >>>>>>>>>>>> 222222 >>>> 33333 localDisabledValue::: >>>>>>> ',item?.fieldName,visible,fieldList,mandatoryFields)
                        if(item?.fieldName?.length>1){
                            localmandatory={}
                            if(Array.isArray(item.fieldName)) {
                                
                                item?.fieldName?.forEach(localField =>{
                                    fieldGroupName=payloadData[item.fieldGroupName]===null || payloadData[item.fieldGroupName]===undefined || payloadData[item.fieldGroupName]===''?fieldList[0].fieldGroup:payloadData[item.fieldGroupName];
                                    const localValue = mandatoryFields[localField] ??checkMandatory(item.mandatory, selectedFields,payloadData,items,item,mandatoryFields);
                                    // console.log('Popup Change 11111 >>>>>>>>>>>> 222222 >>>> 33333 localDisabledValue::: >>>>>>> ',trueCounter,localField,field,mandatory,fieldList,localValue,fieldGroupName,payloadData[item.fieldGroupName],item.fieldGroup,fieldList[0].fieldGroup)
                                    if(typeof localValue==='object'){
                                        localmandatory[localField]=item.fieldGroup===fieldGroupName?mandatoryFields[localField]===undefined || mandatoryFields[localField]?true:mandatoryFields[localField]:localValue[localField]?false:localValue[localField];
                                    }else{
                                        localmandatory[localField]=item.fieldGroup===fieldGroupName?mandatoryFields[localField]===undefined || mandatoryFields[localField]?true:mandatoryFields[localField]:localValue?false:localValue;
                                    }
                                })
                            } else {
                                const localValue = mandatoryFields[item.fieldName] ??checkMandatory(item.mandatory, selectedFields,payloadData,items,item,mandatoryFields);
                                if(typeof localValue==='object'){
                                    localmandatory=localValue[item.fieldName];
                                }else{
                                    localmandatory[item.fieldName]=localValue
                                }
                                // localmandatory[item.fieldName]=localValue;
                            }
                            localFlag=true;
                            mandatory={...mandatory,...localmandatory};
                        }else{

                            localmandatory = mandatoryFields[item?.fieldName] ??checkMandatory(item.mandatory, selectedFields,payloadData,items,item,mandatoryFields);
                        }
                        
                        // if(item?.fieldName?.length>1){
                        //     localFlag=true;
                        //     mandatory={...mandatory,...localmandatory};
                        // }
                        return {
                            ...item,
                            mandatory: localmandatory,
                        }
                    
                    
                });
                if(!localFlag){
                    mandatory=localmandatory;
                }
                
            }
            // if(field?.type==='radioInput'){
            //     console.log('Popup Change 11111 >>>>>>>>>>>> 444444 mandatory::: >>>>>>> ',field?.fieldName,mandatory,fieldList)
            // }
            if(FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1){
                disabled={}
                fieldList=fieldList?.map(item => {
                    const newItem = {...item};
                    
                    
                    if(Array.isArray(item.fieldName)){
                        let trueCounter=0;
                        item?.fieldName?.forEach(localField =>{
                            if(disabledFields[localField]===true){
                                trueCounter++;
                            }
                        });
                        item.fieldName.forEach(localItem => {
                            let fieldGroupName=payloadData[item.fieldGroupName]===null || payloadData[item.fieldGroupName]===undefined || payloadData[item.fieldGroupName]===''?fieldList[0].fieldGroup:payloadData[item.fieldGroupName];
                            let localValue = disabledFields[localItem] ??checkDisability(item.disabled, selectedFields,payloadData,items,item,units,disabledFields,localItem);
                            // console.log('disabled >>>>>>>>>>>>>>>>>> ',trueCounter,localItem,disabledFields[localItem],localValue,item.fieldGroup,fieldGroupName )
                            if(typeof localValue==='object'){
                                disabled[localItem]=item.fieldGroup===fieldGroupName?disabledFields[localItem]===undefined || disabledFields[localItem]?disabledFields[localItem]:false:localValue[localItem]?false:localValue[localItem];
                            }else{
                                disabled[localItem]=item.fieldGroup===fieldGroupName?disabledFields[localItem]===undefined || disabledFields[localItem]?disabledFields[localItem]:false:localValue?false:localValue;
                            }
                        });
                        // console.log('disabled >>>>>>>>>>>>>>>>>> ',{disabled,mandatory} )
                        newItem['disabled'] = disabled;
                    }else{
                        
                        const localDisabledValue=disabledFields[item?.fieldName] ?? checkDisability(item.disabled, selectedFields,payloadData,items,item,units,disabledFields,item?.fieldName)
                        let localdisabled=typeof localDisabledValue==='object'?item?.fieldName?.length>1?localDisabledValue:localDisabledValue[item?.fieldName]:localDisabledValue;
                        newItem['disabled'] = localdisabled;
                        disabled[item?.fieldName]=localdisabled;
                        if(item?.disabledRadio!==undefined && item?.type==='radioInput'){
                            const localDisabledRadioValue=disabledFields[item?.fieldName] ?? checkDisability(item.disabledRadio, selectedFields,payloadData,items,item,units,disabledFields,item?.fieldName)
                            let localdisabledRadio=typeof localDisabledRadioValue==='object'?item?.fieldName?.length>1?localDisabledRadioValue:localDisabledRadioValue[item?.fieldName]:localDisabledRadioValue;
                            newItem['disabledRadio'] = localdisabledRadio;
                        }
                        
                    };
                    return newItem;
                })
            }else if (field.disabled !== undefined) {
                if(Array.isArray(fieldName)){
                    disabled={};
                    fieldName.forEach(localItem => {
                        let localdisabled = disabledFields[localItem] ?? checkDisability(field.disabled, selectedFields,payloadData,items,field?.fieldName,units,disabledFields,localItem);
                        if(typeof localdisabled==='object'){
                            disabled[localItem]=localdisabled[localItem]
                        }else{
                            disabled[localItem]=localdisabled
                        }
                    })
                }else {
                    disabled = disabledFields[field?.fieldName] !==undefined ? disabledFields[field?.fieldName] : checkDisability(field.disabled, selectedFields,payloadData,items,field?.fieldName,units,disabledFields,field?.fieldName);
                }
            }
            // console.log('In get SizingFields 7777 ::: field.disabled >>>>>>>> ',field.fieldName,disabled,fieldList,disabledFields[field?.fieldName]);
            // if(field?.type==='radioInput'){
            //     console.log('Popup Change 11111 >>>>>>>>>>>> 555555 disabled::: >>>>>>> ',field?.fieldName,disabled,fieldList)
            // }
            defaultValue=checkDefaults(field,fieldName,selectedFields,payloadData,focusedFieldName,units,inputs);
            if(field?.type==='radioInput'){
                // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> In get SizingFields :::::::defaultValue >>>>>>>>>>> ',fieldName,defaultValue,inputs[fieldName],validationResults?.inputs);
            }
            if(typeof defaultValue==='object'){
                if(Array.isArray(fieldName)){
                    fieldName?.forEach(localField => {
                        const localDefaultValue=defaultValue[localField]
                        if(typeof localDefaultValue==='object'){
                            funcExecResultFields= {...localDefaultValue}
                        }
                    })
                }else{
                    const localDefaultValue=defaultValue[field.fieldName]
                    if(typeof localDefaultValue==='object'){
                        funcExecResultFields= {...localDefaultValue}
                    }
                }
            }

            if(error!==null && error!==undefined && error?.length>0){
                componentError={}
                if(FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1 || field.type==='radioInputUOM'){
                    componentError=[]
                    fieldList?.forEach(item => {
                        if(Array.isArray(item.fieldName)){
                            item.fieldName.forEach(localItem => {
                                const localError=error?.filter((it)=>it.name===localItem)
                                if(localError!==undefined){
                                    componentError.push(...localError)
                                }
                            })
                        }else if(Array.isArray(error)){
                            //componentError=[]
                            error?.forEach(it => {
                                if(it.name===item?.fieldName){
                                    const localError=componentError.find((localItem)=>localItem.name===it.name && localItem.value?.error===it?.value?.error);
                                    if(localError===undefined){
                                        componentError.push(it)
                                    }
                                    
                                }
                            })
                        }else{
                            const localError=error!==null?error?.filter((it)=>it.name===item.fieldName):[]
                            componentError[item.fieldName]=localError
                        }
                    })
                }else if(Array.isArray(fieldName)){
                    componentError=[]
                    fieldName?.forEach(item => {
                        //console.log(' >>>>>>>>>>>>> ',item,error)
                        const localError=error !== undefined && error !== null && error?.length > 0? error?.filter((it)=>it.name===item):[]
                        
                        if(localError!==undefined){
                            componentError.push(...localError)
                        }
                    })
                    //console.log('In componentError Array >>>>> ',fieldName,componentError)
                }else if(Array.isArray(error)){
                    componentError=[]
                    error?.forEach(it => {
                        if(it.name===fieldName){
                            const localError=componentError.find((localItem)=>localItem.name===it.name && localItem.value?.error===it?.value?.error);
                            if(localError===undefined){
                                componentError.push(it)
                            }
                            
                        }
                    })
                    //console.log('In componentError Array >>>>> ',fieldName,componentError)
                }else{
                    const localError=error!==null?error?.find((it)=>it.name===fieldName):[];
                    //console.log('In get SizingFields :::::::componentError >>>>>>>>>>> ',fieldName,localError)
                    componentError=localError
                }
        
            }
            
            if(field?.dimensionName!=="" && field?.dimensionName!==undefined){
                dimensionName=Array.isArray(field?.dimensionName)?field?.dimensionName[0]:field?.dimensionName;
                const uomKey=dimensionName!=='%'?field?.UomFieldName!==undefined?field?.UomFieldName:getUOMKey(dimensionName,field?.UomFieldName):dimensionName;
                // const uomKey=dimensionName!=='%'?field?.DbUomFieldName!==undefined?field?.DbUomFieldName:field?.UomFieldName!==undefined?field?.UomFieldName:getUOMKey(dimensionName):dimensionName;

                unitValue=dimensionName!=='%'?selectedFields.find((item)=>item.name===uomKey):dimensionName;
                if( dimensionName!=='%'){
                    if(unitValue===undefined || unitValue?.value===undefined){
                        let displayUnit=getDisplayUnit(selectedFields)
                        unitValue=defaultUnits[displayUnit][dimensionName];
                    }
                    //console.log('In useFormFields :: get SizingFields::: dimensionName::: 1111 >>>>>>>>>> ',field.fieldName,dimensionName,unitValue)
                    unitValue=unitValue?.value===undefined?unitValue:unitValue?.value;
                }
            }

            let value={};
            if(FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1 ){
                value={};
                unitValue={}
                let radioUnitValue={};
                dimensionName={};
                // if(field?.type==='radioInput'){
                //     console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> In get SizingFields :::::::defaultValue >>>>>>>>>>> ',fieldName,defaultValue,fieldList);
                // }
                fieldList?.forEach(item => {
                    if(Array.isArray(item.fieldName)){
                        item.fieldName.forEach(localItem => {
                            const findField = selectedFields?.find(selectedField => selectedField.name === localItem);
                            // if(field?.type==='multiInputUom'){
                            //     console.log(`Popup Change 11111 >>>>>>>>>>>> 9999999 ::: multiInputUom>>> ${localItem} ===> ${JSON.stringify(findField)} >>>>>> `,payloadData[localItem],defaultValue[localItem]);
                            // }
                            if(findField){
                                const localVal=findField?.value===undefined || findField?.value===null?defaultValue[localItem]:findField?.value;
                                value[findField.name] = localVal 
                                //console.log('In form field ::: radio Input:: findField ::: 3333 >>>>>>>>>> ',findField,value,defaultValue)
                            }else{
                                value[localItem]=defaultValue[localItem];
                            }
                            // if(field?.type==='radioInput'){
                            //     //console.log('Popup Change 11111 >>>>>>>>>>>> default Value::: 11111>>>>>>> ',item?.fieldName,value)
                            // }
                            //console.log('In form field ::: radio Input:: findField ::: 4444 >>>>>>>>>> ',findField,value,defaultValue)
                            if(item?.dimensionName!==""){
                                
                                const localdimensionName=Array.isArray(item?.dimensionName)?item?.dimensionName[0]:item?.dimensionName;
                                const uomKey=item?.UomFieldName!==undefined?item?.UomFieldName:getUOMKey(localdimensionName,item?.UomFieldName);
                                // const uomKey=field?.DbUomFieldName!==undefined?field?.DbUomFieldName:item?.UomFieldName!==undefined?item?.UomFieldName:getUOMKey(localdimensionName);
                                radioUnitValue=selectedFields.find((t1)=>t1.name===uomKey)
                                // console.log('Popup Change 11111 >>>>>>>>>>>> default Value:: 11111 >>>>>>>>>>>> ',radioUnitValue,payloadData[uomKey],localdimensionName,uomKey)
                                if( localdimensionName!=='%'){
                                    if(radioUnitValue===undefined){
                                        let displayUnit=getDisplayUnit(selectedFields)
                                        radioUnitValue=defaultUnits[displayUnit][localdimensionName];
                                    }
                                    radioUnitValue=radioUnitValue?.value===undefined?radioUnitValue:radioUnitValue?.value;
                                }else{
                                    radioUnitValue='%';
                                    // value[item.fieldName]=item?.defaultValue?.value
                                }
                                dimensionName[localItem]=localdimensionName
                                unitValue[localItem]=radioUnitValue
                                //console.log('In form field ::: radio Input::: dimensionName::: 4444 >>>>>>>>>> ',item.fieldName,localdimensionName,unitValue)
                            }
                        })
                    }else{
                        const findField = selectedFields?.find(selectedField => selectedField.name === item.fieldName);
                        if(findField){
                            const localVal=findField?.value===undefined || findField?.value===null?defaultValue[item.fieldName]:findField?.value;
                            value[findField.name] = localVal 
                            //console.log('In form field ::: radio Input:: findField ::: 3333 >>>>>>>>>> ',findField,value,defaultValue)
                        }else{
                            value[item.fieldName]=defaultValue[item.fieldName];
                        }
                        if(item.type==='radio'){
                            value={...defaultValue}
                            //console.log('Popup 1111 >>>>>>>>>>>> In form field ::: radio Input:: findField ::: 4444 >>>>>>>>>> ',findField,value,defaultValue)
                        }
                        // if(field?.type==='radioInput'){
                        //     //console.log('Popup Change 11111 >>>>>>>>>>>> default Value::: 2222222>>>>>>> ',item?.fieldName,value)
                        // }
                        if(item?.dimensionName!==""){
                            
                            const localdimensionName=Array.isArray(item?.dimensionName)?item?.dimensionName[0]:item?.dimensionName;
                            const uomKey=item?.UomFieldName!==undefined?item?.UomFieldName:getUOMKey(localdimensionName,item?.UomFieldName);
                            // const uomKey=field?.DbUomFieldName!==undefined?field?.DbUomFieldName:item?.UomFieldName!==undefined?item?.UomFieldName:getUOMKey(localdimensionName);
                            radioUnitValue=selectedFields.find((t1)=>t1.name===uomKey);
                            // console.log('Popup Change 11111 >>>>>>>>>>>> default Value:: 22222 >>>>>>>>>>>> ',radioUnitValue,payloadData[uomKey],localdimensionName,uomKey)
                            if( localdimensionName!=='%'){
                                if(radioUnitValue===undefined){
                                    let displayUnit=getDisplayUnit(selectedFields)
                                    radioUnitValue=defaultUnits[displayUnit][localdimensionName];
                                }
                                radioUnitValue=radioUnitValue?.value===undefined?radioUnitValue:radioUnitValue?.value;
                            }else{
                                radioUnitValue='%';
                                // value[item.fieldName]=item?.defaultValue?.value
                            }
                            dimensionName[item?.fieldName]=localdimensionName
                            unitValue[item?.fieldName]=radioUnitValue
                            //console.log('In form field ::: radio Input::: dimensionName::: 4444 >>>>>>>>>> ',item.fieldName,localdimensionName,unitValue)
                        }
                    }
                })
                //console.log('In form field ::: radio Input::: dimensionName::: 5555 >>>>>>>>>> ',field.fieldName,value,' defaultValue  ',defaultValue,fieldList)
                
            //    value = value ? value : defaultValue;
            // if(field?.type==='radioInput'){
                //console.log('Popup Change 11111 >>>>>>>>>>>> default Value::: 3333>>>>>>> ',field?.fieldName,value,defaultValue)
            // }
                if(displayType==='form'){
                    value = assignDefaultIfInvalid(value, defaultValue);
                }
                // if(field?.type==='radioInput'){
                //     console.log('Popup Change 11111 >>>>>>>>>>>> default Value::: 444444>>>>>>> ',field?.fieldName,value,unitValue)
                // }
            }else if(field?.type==='inputUom'){
                // console.log('fieldName 111111111111 >>>>>>>>>>>>>>>>>>>>>> ',fieldName,fieldName?.length)
                // if(fieldName?.split(FIELD_SPLITTER)?.length>1){
                if(Array.isArray(fieldName) && fieldName?.length>1){
                    value= {};
                    // const localFieldNames=fieldName;//?.split(FIELD_SPLITTER);
                    // console.log(localFieldNames)
                    fieldName?.forEach(item => {
                        const findField = selectedFields?.find(selectedField => selectedField.name === item);
                        // console.log('In validation >>>>>>>>>>>> ',item,findField,defaultValue,typeof findField.value);
                        // value[item] = findField?.value;
                        value[item] = findField ? findField.value!=='' && findField.value !==undefined && findField.value !==null? typeof findField.value==='number'? isNaN(findField?.value)? '':findField.value:findField.value: defaultValue[item]===undefined?'': defaultValue[item]: defaultValue[item];
                    
                        value[item]=CheckUsCustomary(item,value[item])
                    });
                }else{
                    value=null;
                    const findField = selectedFields?.find(selectedField => selectedField.name === fieldName);
                    //console.log('findField >>>>>>>>>>>>>>> ',fieldName,findField,defaultValue,disabled)
                    if(popupFlowChangeFlag && fieldName==='Wreq'){
                        value=payloadData['prevWreq']
                    }else if(popupFlowVacuumChangeFlag && fieldName==='WreqV'){
                        value=payloadData['prevWreqV']
                    }else if(findField){
                        if(findField.value!=="" && findField.value !== null && findField.value!==undefined){
                            value=findField.value.toString()
                        }else if(Number(defaultValue[fieldName])==0){
                            value=findField?.value
                        }else{
                            value=defaultValue[fieldName]
                        }
                    }else{
                        value=defaultValue[fieldName]
                    }
                }
                // value=defaultValue    
                //console.log('In validation >>>>>>>>>>>> ',findField,value,defaultValue)
            }else if(Array.isArray(fieldName)){
                fieldName.forEach(item => {
                    const findField = selectedFields?.find(selectedField => selectedField.name === item);
                    //console.log('In validation >>>>>>>>>>>> ',item,findField,defaultValue,typeof findField.value)
                    value[item] = findField ? findField.value!=='' && findField.value !==undefined && findField.value !==null? typeof findField.value==='number'? isNaN(findField.value)? '':findField.value:findField.value: defaultValue[item]===undefined?'': defaultValue[item]: defaultValue[item];
                
                    value[item]=CheckUsCustomary(item,value[item])
                })
                //console.log('In validation 111111 >>>>>>>>>>>> ',value,defaultValue)
            }else{
                value= null;
                const findField = selectedFields?.find(selectedField => selectedField.name === fieldName);
                //console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> value >>>>>>>>>>>>>>>>>>>>>> ',findField,defaultValue)
                value = findField ? findField?.value : defaultValue;
            }
            if(!localFlag){
                if(typeof disabled==='object'){
                    if(typeof mandatory==='object'){
                        mandatory[field.fieldName]=disabled[field.fieldName]===true?false:mandatory[field.fieldName]
                    }else{
                        mandatory=disabled[field.fieldName]===true?false:mandatory
                    }
                }else if(typeof mandatory==='object'){
                    mandatory[field.fieldName]=disabled===true?false:mandatory[field.fieldName]
                // }else{
                //     mandatory=disabled===true?false:mandatory
                }
            }
            // if(field?.type==='inputUom'){
            //     console.log('inputUOM Change 11111 >>>>>>>>>>>> 55555555 ::: >>>>>>> ',field?.fieldName,{localFlag,fieldList,disabled,mandatory})
            // }
            const returnValue= {
                ...field,
                // key: `${field.fieldName}-${index}`,
                fieldName: fieldName || '',
                label: label || '',
                type: field.type || '',
                fieldDisplayOrder: field.fieldDisplayOrder || 0,
                value: value,
                error: componentError,
                dimensionName: field?.dimensionName || '',
                uomValue: unitValue || '',
                infoText: field.infoText || '',
                mandatory: mandatory || false,
                disabled: disabled || false,
                defaultValue: defaultValue || '',
                visibility: visible,
                visible,
                options: field.options || [],
                onChange: field.onChange || (() => {}),
                fieldList: FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1 ?fieldList:null,
                funcExecResultFields:funcExecResultFields
            };
            // if(field?.type==='radioInput'){
            //     console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> In use PopupPanel::: Calculation :: Popup Change 22222 >>>>>>>>>>>> returnValue::: 555555>>>>>>> ', fieldName,returnValue)
            // }
            return returnValue;
        });
        return updatedItems;
    }else{
        return items
    }
}



// function countLeadingAndTrailingZeros(number) {
//     const numberStr = number.toString();

//     if (!numberStr.includes('.')) {
//         return { leadingZeros: 0, trailingZeros: 0 };
//     }

//     // Split the number into integer and decimal parts
//     const [integerPart, decimalPart] = numberStr.split('.');

//     // Count leading zeros in the decimal part
//     let leadingZeros = 0;
//     for (const char of decimalPart) {
//         if (char === '0') {
//             leadingZeros++;
//         } else {
//             break;
//         }
//     }

//     // Count trailing zeros in the decimal part
//     let trailingZeros = 0;
//     for (let i = decimalPart.length - 1; i >= 0; i--) {
//         if (decimalPart[i] === '0') {
//             trailingZeros++;
//         } else {
//             break;
//         }
//     }

//     return { leadingZeros, trailingZeros };
// }

// function countTrailingZerosAfterDecimal2(number) {
//     // Convert the number to a string
//     const numberStr = number.toString();
  
//     // Check if the number has a decimal point
//     if (!numberStr.includes('.')) {
//       return 0;
//     }
  
//     // Split the number into integer and decimal parts
//     const [integerPart, decimalPart] = numberStr.split('.');
//     // Reverse the decimal part to count trailing zeros
//     const reversedDecimalPart = decimalPart.split('').reverse().join('');
//     // Count the trailing zeros
//     let trailingZeros = 0;
//     for (const char of decimalPart) {
//       if (char === '0') {
//         trailingZeros++;
//       } else {
//         break;
//       }
//     }
  
//     return trailingZeros;
//   }







const convertValue=(currFieldValue, fromUom, toUom, dimensionName, units) =>{
    if(fromUom === toUom || (!currFieldValue && Number(currFieldValue) !== 0)) return currFieldValue;
    let oldUom, newUom;
    let newValue = currFieldValue;
    // Flatten the units for all dimensions into a single array and then find the units
    const allUnits = dimensionName.flatMap(dimension => units[dimension]);
    //console.log('In convertValue >>>>>>>> ',dimensionName,units,allUnits,fromUom,toUom)
    oldUom = allUnits.find(unit => unit.UnitKey === fromUom);
    newUom = allUnits.find(unit => unit.UnitKey === toUom);
    // Check if both units were found before proceeding with the conversion
    if (oldUom && newUom) {
        newValue = convertUnit(currFieldValue, oldUom, newUom,units);
        // Use newValue as needed
    } else {
        // Handle the case where a matching unit was not found
       // console.error("Matching units not found for conversion.");
    }
    return newValue;
}

export const validateMandatoryFields=(updatedData,selectedFields,payloadData,menus,tabIndex,layoutType="Basic")=>{
    // let IsVacuumFlag=false;
    // console.log(`In Advance view >>>>>>>>>. updatedData:: ${updatedData.length}, >>>>>>>>>>>> selectedFields:: ${selectedFields.length} >>>>>>> >>>>>> menus:: ${JSON.stringify(menus)}, >>>>>> tabIndex::: ${tabIndex}`,updatedData);
    const mandatoryList=updatedData.filter((field)=>{
        
        const multiFieldFlag=typeof field?.fieldName==='string'?field?.fieldName?.split(FIELD_SPLITTER)?.length>1?true:false:false;
        // console.log('In Advance view >>>>>>>>>. fieldNames:: 111111>>>>>> ',field?.fieldName,field?.fieldList,Array.isArray(field?.fieldName),multiFieldFlag,Array.isArray(field?.mandatory) && field?.mandatory?.length===1,field?.mandatory);
        if(field?.fieldList!==undefined && field?.fieldList!==null && field?.fieldList.length>0){
            let localmandatoryFlag=false;
            field?.fieldList?.forEach((item)=>{
                // console.log('In Advance view >>>>>>>>>. fieldNames:: 22222>>>>>> ',item?.mandatory, item?.mandatory?.length,typeof item?.mandatory==='object' )
                if(Array.isArray(item?.mandatory) && item?.mandatory?.length===1){
                    const rule=item?.mandatory[0];
                    if(rule?.target?.symbol==='Calculate'){
                        const id= rule?.target ? rule?.target?.id:rule?.id;
                        localmandatoryFlag=calculateExpressionValue(rule,id,payloadData[id],payloadData)
                    }
                }else if( typeof item?.mandatory==='object' ){
                    // console.log('In Advance view >>>>>>>>>. fieldNames:: 3333>>>>>>  ',item.mandatory,item.fieldName)
                    // let localMandatoryfFlag=false;
                    if(Array.isArray(item?.fieldName) && item?.fieldName?.length>1){
                        item.fieldName.forEach((it)=>{
                            if(!localmandatoryFlag){
                                if(item.mandatory[it]===true && field?.defaultValue[it]==''){
                                    localmandatoryFlag=true;
                                }
                            }
                        });
                    }else if(item.mandatory[item.fieldName]===true){
                            localmandatoryFlag=true;
                    }
                    
                //    console.log('In Advance view >>>>>>>>>. fieldNames:: 444444>>>>>>  ',item.mandatory,item.fieldName,localmandatoryFlag)
                }
                if(item.mandatory===true){
                    localmandatoryFlag=true;
                }
            })
            if(localmandatoryFlag){
               return field
            }
        }else if(multiFieldFlag){
            let localmandatoryFlag=false;
            const fieldNames=field?.fieldName?.split(FIELD_SPLITTER);
            // fieldNames.forEach((item)=>{
            // console.log('In Advance view >>>>>>>>>. fieldNames:: 222222>>>>>> ',fieldNames);
            for(const item of fieldNames){
                const selectedField=selectedFields.find((it)=>it.name===item);
                // console.log('In Advance view >>>>>>>>>. fieldNames:: 222222 :: item >>>>>> ',fieldNames,item,selectedField,typeof field?.mandatory==='object',field?.mandatory,field?.mandatory[item],selectedField?.value!==undefined && selectedField?.value!==null && selectedField?.value!=='');
                if(selectedField!==undefined){
                    if(selectedField?.value!==undefined && selectedField?.value!==null && selectedField?.value!==''){
                        if( typeof field?.mandatory==='object' && field?.mandatory[item]===true){
                            localmandatoryFlag=true;
                        }else if(field?.mandatory===true){
                            localmandatoryFlag=true;
                        }
                    }
                }
            }
            // console.log('In Advance view >>>>>>>>>. fieldNames:: 33333>>>>>> ',fieldNames,localmandatoryFlag);
            if(localmandatoryFlag===true){
                return {...field,fieldName:fieldNames}
            }
        }else if(Array.isArray(field?.fieldName) && field?.fieldName?.length>1){
            let localmandatoryFlag=false;
            field?.fieldName?.forEach((item)=>{
                if( typeof field?.mandatory==='object' && field?.mandatory[item]===true){
                    localmandatoryFlag=true;
                }else if(field?.mandatory===true){
                    localmandatoryFlag=true;
                }
            })
            if(localmandatoryFlag===true){
                return field
            }
        }else if(Array.isArray(field?.mandatory) && field?.mandatory?.length===1){
            let localmandatoryFlag=false;
            const rule=field?.mandatory[0];
            if(rule?.target?.symbol==='Calculate'){
                const id= rule?.target ? rule?.target?.id:rule?.id;
                // const value= rule?.target ? rule?.target?.value:rule?.value;
                // const expressionFlag=rule?.target?.expression;
                localmandatoryFlag=calculateExpressionValue(rule,id,payloadData[id],payloadData)
                //console.log(visibilityFlag, fieldName, '==check Visibility::2222==', rule,data[id],id)
            }
            if(localmandatoryFlag){
                return field;
            }
        }else if( typeof field?.mandatory==='object' && field?.mandatory[field?.fieldName]===true){
            return field
        }else if(field?.mandatory===true){
            return field
        }
    });
    // console.log('In Advance view >>>>>>>>>. 22222 mandatoryList >>>>>>>>>>>>>>>>>> ',mandatoryList,layoutType) 
    let mandatoryFlag=mandatoryList?.length===0?true:false;
    for(const field of mandatoryList){
        // console.log('In Advance view >>>>>>>>>. 22222 mandatoryList: field >>>>>>>>>>>>>>>>>> ',layoutType,field.type,field?.fieldName,FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1,Array.isArray(field?.fieldName) && field?.fieldName?.length>1)
        if(FIELDLIST_DISPLAY_OPTIONS.indexOf(field.type) !==-1){
            if(field?.value===undefined || field?.value===null || field?.value===''){
                if(payloadData[field?.fieldName]===undefined || payloadData[field?.fieldName]===null || payloadData[field?.fieldName]===''){
                    mandatoryFlag=false;
                    break;
                }
            }else{
                for(const item of field?.fieldList){
                    if(Array.isArray(item.fieldName)){
                        let localflag=false;
                        // item.fieldName.forEach((it)=>{
                        for(const it of item.fieldName){
                            mandatoryFlag=field?.value[it]!==undefined && field?.value[it]!==null && field?.value[it]!=='';
                            if(mandatoryFlag===false){
                                if(payloadData[it]===undefined || payloadData[it]===null || payloadData[it]===''){
                                    localflag=true;
                                    break;
                                }
                            }
                        }
                        if(localflag===true){
                            mandatoryFlag=false;
                            break;
                        }
                    }else{
                        mandatoryFlag=field?.value[item.fieldName]!==undefined && field?.value[item.fieldName]!==null && field?.value[item.fieldName]!==''?true:false;
                        if(mandatoryFlag===false){
                            if(payloadData[item?.fieldName]===undefined || payloadData[item?.fieldName]===null || payloadData[item?.fieldName]===''){
                                break;
                            }
                        }
                    }
                }
                // console.log('In Advance view >>>>>>>>>. 3333 mandatoryList: field >>>>>>>>>>>>>>>>>> ',mandatoryFlag)
                if(mandatoryFlag===false){
                    break;
                }
            }
        }else if(Array.isArray(field?.fieldName) && field?.fieldName?.length>1){
            let localmandatoryFlag=false;
            for(const fieldName of field?.fieldName){
                const fieldMandatoryFlag=typeof field?.mandatory==='object'? field?.mandatory[fieldName]:field?.mandatory
                // console.log('In Advance view >>>>>>>>>. 33333 mandatoryList: field >>>>>>>>>>>>>>>>>> ',fieldName,fieldMandatoryFlag,field?.mandatory)
                if(fieldMandatoryFlag && fieldName!=='Blank'){
                    // const fieldDisabledFlag=typeof field?.disabled==='object'? field?.disabled[fieldName]:field?.disabled
                    // if(fieldDisabledFlag===false){
                        const sectionField=selectedFields.find((item)=>item.name===fieldName);
                        //console.log('In useFormField:: fieldMandatoryFlag::: sectionField 999999>>>>>>>>>>>> ',fieldMandatoryFlag,sectionField)
                        if(sectionField!==undefined){
                            if(sectionField?.value!==undefined && sectionField?.value!==null && sectionField?.value!==''){
                                localmandatoryFlag=true;
                            }else{
                                localmandatoryFlag=false;
                                break;
                            }
                        }else{
                            localmandatoryFlag=false;
                            break;
                        }
                    // }
                }
            }
            if(localmandatoryFlag===true){
                mandatoryFlag=true;
            }else{
                mandatoryFlag=false;
                break;
            }
        }else{
            const fieldName=Array.isArray(field.fieldName)?field.fieldName[0]:field.fieldName;
            // const fieldDisabledFlag=typeof field?.disabled==='object'? field?.disabled[fieldName]:field?.disabled
            // if(fieldDisabledFlag===false){
                const sectionField=selectedFields.find((item)=>item.name===fieldName);
                //console.log(`In Advance view >>>>>>>>>. fieldName: ${fieldName} >>>>> sectionField::: ${JSON.stringify(sectionField)}  >>>>>>>>>>>>>>>>>>mandatoryFlag:: ${mandatoryFlag}`)
                if(sectionField!==undefined){
                    if(sectionField?.value!==undefined && sectionField?.value!==null && sectionField?.value!==''){
                        mandatoryFlag=true;
                    }else{
                        mandatoryFlag=false;
                        break;
                    }
                }else{
                    mandatoryFlag=false;
                    break;
                }
            // }
        }
        
    }
    const errorList=updatedData?.filter((field)=>field.error!==undefined && field.error!==null && field.error.length>0);
    let errorFlag=false
    if(errorList?.length===0){
        errorFlag=false
    }else{
        for(const field of errorList){
            
            if(field?.error!==undefined && field?.error!==null && field?.error.length>0){
                for(const error of field?.error){
                    if(error?.value?.error!==undefined && error?.value?.error!==null && error?.value?.error!==''){
                        if(error?.value?.error?.type==='error'){
                            errorFlag=true;
                            break;
                        }
                    }
                }
                if(errorFlag===true){
                    errorFlag=true;
                    break;
                }
            }
            
        }
    }  
    const errorType=errorList?.length===0?'':errorFlag===true?'error':'warning';
    // console.log('In Advance view >>>>>>>>>. 77777 errorType >>>>>>>>>>>>>>>>>> ',layoutType,errorList,mandatoryFlag,errorFlag,errorType) 
    const localMenu=menus?.map(item=>{
        if(item.id===tabIndex+1){
            return {...item,isCompleted:!errorFlag && mandatoryFlag,errorType}
        }else{
            return item
        }
    })
    return layoutType==="Advance"?{mandatoryFlag,errorType}:localMenu
    // return {isCompleted:!errorFlag && mandatoryFlag,errorType}
}

const validation_function=(rule,fieldName,currFieldValue,payloadData, units)=>{
    return runValidation(payloadData, currFieldValue, fieldName, units, rule); 
}
function runValidation(payloadData, currFieldValue, fieldName, units, rule) {
    const validateFor = rule?.target.validateFor;
    const expression = rule?.target?.expression;
    const expressionReqFields = rule?.target?.expressionReqFields;
    if(validateFor==='RelievingTempltSaturatedSteamTemp' || validateFor==='NormalSystemgtOtherTemp'){
        return ValidationForTemperature(payloadData, currFieldValue, fieldName, units, validateFor);
    }
    //console.log('Error_ Error_ Error_', payloadData)
    let bReturn = false;
    let SetPressure = null, InletLoss = null, VariableSuperimposed = null, ConstantSuperimposed = null, BuiltUp = null, AtmPressure = null, OperatingPressure = null, SystemMAWP = null, OverPressure = null, UnderPressure = null, SetVacuum = null, MAWPP = null, TotalBackPressure=null;
    let fieldVariables = {SetPressure : null, InletLoss : null, VariableSuperimposed : null, ConstantSuperimposed : null, BuiltUp : null, AtmPressure : null, OperatingPressure : null, SystemMAWP : null, OverPressure : null, UnderPressure : null, SetVacuum : null, MAWPP : null, TotalBackPressure:null,IsASMESection8:null}
    let PsetMeasure = fieldName==="SetPressure"?currFieldValue:payloadData["SetPressure"];
    let PlossMeasure = fieldName==="InletLoss"?currFieldValue: payloadData["InletLoss"];
    let PsivMeasure = fieldName==="VariableSuperimposed"?currFieldValue:payloadData["VariableSuperimposed"];
    let PsicMeasure = fieldName==="ConstantSuperimposed"?currFieldValue:payloadData["ConstantSuperimposed"];
    let PbuMeasure = fieldName==="BuiltUp"?currFieldValue:payloadData["BuiltUp"];
    let PbackMeasure = fieldName==="TotalBackPressure"?currFieldValue:payloadData["TotalBackPressure"];
    let PatmMeasure = fieldName==="AtmPressure"?currFieldValue:payloadData["AtmPressure"];
    let PnMeasure = fieldName==="OperatingPressure"?currFieldValue:payloadData["OperatingPressure"];
    let PoverMeasure = fieldName==="OverPressure"?currFieldValue:payloadData["OverPressure"];
    let VsetMeasure = fieldName==="SetVacuum"?currFieldValue:payloadData["SetVacuum"];
    let VoverMeasure = fieldName==="UnderPressure"?currFieldValue:payloadData["UnderPressure"];
    let RequiredCapacityMethod = fieldName==="RequiredCapacityMethod"?currFieldValue:payloadData["RequiredCapacityMethod"];
    let IsSimpleEmergencyFlowRateCalc = fieldName==="IsSimpleEmergencyFlowRateCalc"?currFieldValue:payloadData["IsSimpleEmergencyFlowRateCalc"];
    // Pset = PsetMeasure.toUnit("Pressure.bar");
    //(currFieldValue, payloadData[field.UomFieldName], rule?.uom, field?.dimensionName, units)
    fieldVariables.IsASMESection8 = fieldName==="IsASMESection8"?currFieldValue:payloadData["IsASMESection8"];
    fieldVariables.SetPressure = SetPressure =  (convertValue(PsetMeasure,payloadData["PressureUOM"], "pressure.barg", ["pressure"], units));
    fieldVariables.InletLoss = InletLoss= (convertValue(PlossMeasure,payloadData["PressureUOM"], "pressure.barg", ["pressure"], units));
    fieldVariables.VariableSuperimposed = VariableSuperimposed=  (convertValue(PsivMeasure,payloadData["PressureUOM"], "pressure.barg", ["pressure"], units));
    fieldVariables.ConstantSuperimposed = ConstantSuperimposed=  (convertValue(PsicMeasure,payloadData["PressureUOM"], "pressure.barg", ["pressure"], units));
    fieldVariables.BuiltUp = BuiltUp= (convertValue(PbuMeasure,payloadData["PressureUOM"], "pressure.barg", ["pressure"], units));
    fieldVariables.TotalBackPressure = TotalBackPressure= (convertValue(PbackMeasure,payloadData["PressureUOM"], "pressure.barg", ["pressure"], units));
    fieldVariables.OperatingPressure = OperatingPressure = (convertValue(PnMeasure,payloadData["PressureUOM"], "pressure.barg", ["pressure"], units));
    fieldVariables.OverPressure = OverPressure =(convertValue(PoverMeasure,payloadData["PressureUOM"], "pressure.barg", ["pressure"], units));
    // Patm is an absolute pressure while the rest are gauge pressures
    fieldVariables.AtmPressure = AtmPressure =(convertValue(PatmMeasure,payloadData["AtmPressureUOM"], "abspressure.bara", ["abspressure"], units));
    fieldVariables.SetVacuum = SetVacuum =(convertValue(VsetMeasure,payloadData["PressureUOMVacuum"], "pressure.barg", ["pressure"], units));
    fieldVariables.UnderPressure = UnderPressure =(convertValue(VoverMeasure,payloadData["PressureUOMVacuum"], "pressure.barg", ["pressure"], units));
 
    let MAWPMeasure;
    if (payloadData["SystemMAWP"] !== "" ) {
        MAWPMeasure = fieldName==="SystemMAWP"?currFieldValue:payloadData["SystemMAWP"];
    } else if (!isNaN(SetPressure)) {
        MAWPMeasure = PsetMeasure;
    }
    SystemMAWP = convertValue(MAWPMeasure,payloadData["PressureUOM"], "pressure.barg", ["pressure"], units);
    
    let reqVariables={}
    expressionReqFields.forEach(field=>{
        reqVariables[field]= fieldVariables[field]
    })

    if (!isNaN(AtmPressure)) {
        // console.log('fieldName', fieldName);
        let expValue=ValidateExpression(expression, reqVariables);
        //console.log('inside validation function 11', validateFor, expValue)
        return expValue
        if(validateFor==='P1lt0'){
            // if(!isNaN(OverPressure) && !isNaN(SetPressure) && !isNaN(InletLoss) && ((SetPressure+OverPressure)-(InletLoss+AtmPressure))<0.000){
            //     //console.log("Error_PRVPress_P1lt0");
            //     bReturn = true;
            //     return bReturn;
            // }else{
            //     return false
            // }
        }
        if(validateFor==='VsetplusVoverltatmP'){
            //console.log('Error_ Error_ Error_VsetplusVoverltatmP', Vset, Vover, Patm, ((Vset+Vover)>Patm))
            // if(!isNaN(SetVacuum) && !isNaN(UnderPressure) && ((SetVacuum+UnderPressure)>AtmPressure)){
            //     //console.log("Error_PRVPress_VsetplusVoverltatmP");
            //     bReturn = true;
            //     return bReturn;
            // }else{
            //     return false
            // }
            return false
        }
        
        if(validateFor==='PsicandPatmLessThanEqZero'){
            // if (!isNaN(ConstantSuperimposed) && (ConstantSuperimposed + AtmPressure <= 0)) {
            //     bReturn = true;
            //     return bReturn;
            // }else{
            //     return false
            // }
            return false
        }
        if(validateFor==='PsivandPatmLessThanEqZero'){
            // if (!isNaN(VariableSuperimposed) && (VariableSuperimposed + AtmPressure <= 0)) {
            //     bReturn = true;
            //     return bReturn;
            // }else{
            //     return false
            // }
            return false
        }
        if(validateFor==='PsicPsivPatmLessThanEqZero'){
            // if (!isNaN(ConstantSuperimposed) && !isNaN(VariableSuperimposed) && (ConstantSuperimposed + VariableSuperimposed + AtmPressure <= 0)) {
            //     bReturn = true;
            //     return bReturn;
            // }else{
            //     return false
            // }
            return false
        }
    }
 
    if(validateFor==='Palt0'){
        // if(!isNaN(OverPressure) && !isNaN(SetPressure) && !isNaN(InletLoss) && ((SetPressure+OverPressure)-(InletLoss))<0.000){
        //     //console.log("Error_PRVPress_Palt0");
        //     bReturn = true;
        //     return bReturn;
        // }else{
        //     return false
        // }
        return false
    }
    if(validateFor==='InPresgtOutPres'){
        // if(!isNaN(OverPressure) && !isNaN(SetPressure) && !isNaN(InletLoss) && ((SetPressure+OverPressure)-(InletLoss))<TotalBackPressure){
        //     //console.log("Error_PRVPress_Palt0");
        //     bReturn = true;
        //     return bReturn;
        // }else{
        //     return false
        // }
        return false
    }
    //console.log('Error_ Error_ Error_ bReturn', bReturn)
    return bReturn;
}



export const checkSaturatedSteamTemp=(newSelectedFields,error,relievingValue,value)=>{
    let localSelectedFields=[...newSelectedFields];
    let isSaturatedSteam = localSelectedFields.find(item => item.name === 'IsSaturatedSteam');
    let localerrors = error===null?[]:[...error.filter(item => item.name !== 'Relieving')];
    let relievingError=null
    // console.log('In field CalculationAPI::fulfilled:: >>>>>>>>>>>>>>>>>> ',isSaturatedSteam?.value,relievingValue,value)
    if(isSaturatedSteam===undefined || isSaturatedSteam?.value===undefined || isSaturatedSteam?.value===false){
        
        if(relievingValue===undefined){
            localSelectedFields = [...localSelectedFields, { name: 'Relieving', value} ];
        }else if(relievingValue?.value===undefined || relievingValue?.value==='' || relievingValue?.value===null || Number(value)> Number(relievingValue?.value)){
            localSelectedFields=localSelectedFields.filter(item => item.name !== 'Relieving');
            localSelectedFields = [...localSelectedFields, { ...relievingValue, value} ];
        }else if(Number(value)> Number(relievingValue?.value)){
            relievingError=[{ name: 'Relieving', value: { error: {"type":"error","message":"RtltSst"} } }]
        }
        
    }else if(relievingValue===undefined || relievingValue===''){
        localSelectedFields = [...localSelectedFields, { name: 'Relieving', value} ];
    }else if(isSaturatedSteam?.value===true || relievingValue.value===undefined || relievingValue.value==='' || relievingValue.value===null){
        localSelectedFields=localSelectedFields.filter(item => item.name !== 'Relieving');
        localSelectedFields = [...localSelectedFields, {  ...relievingValue, value} ];
    }
    
    localerrors = relievingError===null?[...localerrors]:[...localerrors,...relievingError];
    return {localSelectedFields,localerrors}
}

export const checkCriticalCondition=(config,units)=>{

    let fromUnit=units['pressure']?.find((unit)=>unit.UnitKey===config?.data?.PressureUOM);
    let toUnit=units['pressure']?.find((unit)=>unit.UnitKey==='pressure.barg');
    const Pset=convertUnit(config?.data?.SetPressure,fromUnit,toUnit);
    const Pover=convertUnit(config?.data?.OverPressure,fromUnit,toUnit);
    const Ploss=convertUnit(config?.data?.InletLoss,fromUnit,toUnit);

    fromUnit=units['abspressure']?.find((unit)=>unit.UnitKey===config?.data?.AtmPressureUOM);
    toUnit=units['abspressure']?.find((unit)=>unit.UnitKey==='abspressure.bara');
    const Patm=convertUnit(config?.data?.AtmPressure,fromUnit,toUnit);

    fromUnit=units['temperature']?.find((unit)=>unit.UnitKey===config?.data?.TemperatureUOM);
    toUnit=units['temperature']?.find((unit)=>unit.UnitKey==='temp.degC');
    const T=convertUnit(config?.data?.AtmPressure,fromUnit,toUnit);

    const P1=Pset.plus(Pover).plus(Patm).minus(Ploss);

    if(P1>220 && T<=373.7){
        return true
    }else{
        return false
    }
}



export const filterDimensionUnits=(defaultUnits,selectedFields,UomFieldName,uom,oldUomValue,dimensionName,units)=>{
    let dimensionUnits=[]
    // console.log('In filterDimensionUnits >>>>>>>>>>>> ',dimensionName,units)
      if(Array.isArray(dimensionName)){
        dimensionName.forEach((item)=>{
          const dimensionUnit=units[item];
          dimensionUnits=[...dimensionUnits,...dimensionUnit]
        })
      }else{
        dimensionUnits=units[dimensionName];
      }
      
      let unitValue;
      let commonUomKey;
      const exitingUom=dimensionUnits?.find(unit => unit.UnitKey===oldUomValue);
      if(exitingUom===undefined || exitingUom===null){
        const dimensionUoms=dimensionUnits?.find(unit => unit.UnitKey===uom)?.DimensionName;
        if(dimensionUoms!==undefined && dimensionUoms!==null){
          const key=UomFieldName!==undefined?UomFieldName:getUOMKey(dimensionUoms,UomFieldName);
          commonUomKey = getUOMKey(dimensionUoms,UomFieldName);
        //   //console.log('In useUnitConverter :: commonUomKey 111111 >>>>>>>>>>> ',commonUomKey, dimensionUoms)
          unitValue=selectedFields.find((item)=>item.name===key);
        //   //console.log('In useUnitConverter :: unitValue 444444>>>>>>>> ',fieldName,unitValue,dimensionUoms)
          if(unitValue===undefined || unitValue?.value===undefined){
              const displayUnit=getDisplayUnit(selectedFields);
              unitValue=defaultUnits[displayUnit][dimensionUoms];
          }
        
          unitValue=unitValue?.value===undefined?unitValue:unitValue?.value;
        }
      }else{
        unitValue=exitingUom.UnitKey;
        commonUomKey = getUOMKey(exitingUom.DimensionName,UomFieldName);
      }

      return {dimensionUnits,unitValue,commonUomKey}
}

// export const getConvertedValue=(value,unitValue,fieldName,uom,dimensionUnits,units,selectedFields,payloadData)=>{
//     const oldUom=dimensionUnits?.find(unit => unit.UnitKey===unitValue);
//     const newUom=dimensionUnits?.find(unit => unit.UnitKey===uom);
//     let localValue=selectedFields.find((item)=>item.name===fieldName);
    
//     if(localValue===undefined){
//         localValue=value
//     }else{
//         localValue=localValue.value;
//     }

//     const VacuumFlag=fieldName==='SetVacuum' || fieldName==='UnderPressure' || fieldName==='WreqV' || fieldName.indexOf('Vacuum')!==-1?true:false;
    
//     let newValue=convertUnitDiffDims(localValue, oldUom, newUom,units,payloadData,VacuumFlag) //:convertUnit(localValue, oldUom, newUom,units)
//     //console.log('In useUnitConverter newVal 888888 ::: ',fieldName, newValue)
//     newValue=newValue=='0'?"0.000" :newValue

//     return newValue
// }


export const funcExecRequiredFields=(fieldValues,payloadData,preferences,units,defaultUnits,item=null)=>{
    //console.log('In use PopupPanel::: Calculation :: In funcExecRequiredFields ::: >>>>>>>',fieldValues,preferences,units,defaultUnits)
    let reqFields={}
    fieldValues?.functionFields?.forEach((field)=>{
        //console.log('In use PopupPanel::: Calculation ::In funcExecRequiredFields ::: >>>>>>>',field,item,fieldValues,item!==null && field===item?.name)
        if(field.indexOf('UOM')!==-1){
            //console.log('In CalculateRatedFlow >>>> In funcExecRequiredFields ::: >>>>>>>',field,payloadData[field])
            let uom=payloadData[field];
            if(uom===undefined || uom===null || uom===''){
                const userPreference = getUserPreference(preferences)
                uom=userPreference[field];
            }
            if(uom!==undefined && uom!==null && uom!==''){
                const dim=uom?.split(".")[0]==='temp'?'temperature':uom?.split(".")[0];
                //console.log('In funcExecRequiredFields ::: 2222>>>>>>>',field,dim,uom,units[dim],payloadData[field])
                reqFields[field]=units[dim].find((unit)=>unit.UnitKey===uom);
            }
        }else if(item!==null && field===item?.name){
            reqFields[field]=item?.value;
        }else if(item!==null){
            let fieldValue=field===item?.name && item?.type==='checkbox'?item?.value:payloadData[field];
            if(item.for && item.for == 'multiInputUom'){
                fieldValue = field===item?.name ? item?.value:payloadData[field]; 
            }
            reqFields[field]=fieldValue;
        }else{
            const fieldValue=payloadData[field];
            reqFields[field]=fieldValue;
        }
    });
    const requiredUnits={};
    Object.keys(fieldValues?.requiredUnits).forEach((key)=>{
        let unitKey;
        const uom=fieldValues?.requiredUnits[key];
        const dim=uom?.split(".")[0]==='temp'?'temperature':uom?.split(".")[0];
        if(fieldValues.functionName==='CalculatePressureAPI2000'){
            unitKey=uom;
            // requiredUnits[key]=units[dim].find((unit)=>unit.UnitKey===uom);
        }else{
            let displayUnit=payloadData['CalculationMethod'];
            if(displayUnit===undefined || displayUnit===null || displayUnit===''){
                displayUnit=preferences['CalculationMethod'];
                payloadData['CalculationMethod']=displayUnit;
            }
            unitKey=defaultUnits[displayUnit][dim]
        }
        requiredUnits[key]=units[dim].find((unit)=>unit.UnitKey===unitKey);
    });
    let config={functionName:fieldValues?.functionName,reqFields:reqFields,requiredUnits:requiredUnits,units,payloadData};
    return config
}

export const ApiExecRequiredFields=(fieldValues,payloadData,preferences,units,defaultUnits,item=null,selectedResultRows=null)=>{
    // console.log('In use PopupPanel:::calculatedFields:: In funcExecRequiredFields ::: >>>>>>>',fieldValues,preferences,units,defaultUnits)
    let reqFields={};
    let selectedUnits={};
    const currentFields=fieldValues?.currentFields ?? fieldValues?.functionReqFields;
    // console.log('In useTabPanel:::calculatedFields:: >>>>>>>>>>>> ',currentFields,fieldValues?.currentFields,fieldValues?.functionReqFields)
    currentFields?.forEach((field)=>{
        //console.log('In use PopupPanel::: Calculation ::In funcExecRequiredFields ::: >>>>>>>',field,item,fieldValues,item!==null && field===item?.name)
        if(field.indexOf('UOM')!==-1){
            //console.log('In CalculateRatedFlow >>>> In funcExecRequiredFields ::: >>>>>>>',field,payloadData[field])
            let uom=payloadData[field];
            if(uom===undefined || uom===null || uom===''){
                const userPreference = getUserPreference(preferences)
                uom=userPreference[field];
            }
            if(uom!==undefined && uom!==null && uom!==''){
                const dim=uom?.split(".")[0]==='temp'?'temperature':uom?.split(".")[0];
                //console.log('In funcExecRequiredFields ::: 2222>>>>>>>',field,dim,uom,units[dim],payloadData[field])
                selectedUnits[field]=units[dim].find((unit)=>unit.UnitKey===uom)?.UnitKey;
            }
        }else if(item!==null && field===item?.name){
            reqFields[field]=item?.value;
        }else if(item!==null){
            let fieldValue=field===item?.name && item?.type==='checkbox'?item?.value:payloadData[field]!==undefined && payloadData[field]!=='' && payloadData[field]!==null?payloadData[field]:selectedResultRows!==null && selectedResultRows[field]!==undefined?selectedResultRows[field]:'';
            if(item.for && item.for == 'multiInputUom'){
                fieldValue = field===item?.name ? item?.value:payloadData[field]; 
            }
            reqFields[field]=fieldValue;
        }else{
            const fieldValue=payloadData[field]!==undefined && payloadData[field]!=='' && payloadData[field]!==null?payloadData[field]:selectedResultRows!==null && selectedResultRows[field]!==undefined?selectedResultRows[field]:'';
            reqFields[field]=fieldValue;
        }
    });
    const requiredUnits={};
    // Object.keys(fieldValues?.requiredUnits).forEach((key)=>{
    //     let unitKey;
    //     const uom=fieldValues?.requiredUnits[key];
    //     const dim=uom?.split(".")[0]==='temp'?'temperature':uom?.split(".")[0];
    //     if(fieldValues.functionName==='CalculatePressureAPI2000'){
    //         unitKey=uom;
    //         // requiredUnits[key]=units[dim].find((unit)=>unit.UnitKey===uom);
    //     }else{
    //         let displayUnit=payloadData['CalculationMethod'];
    //         if(displayUnit===undefined || displayUnit===null || displayUnit===''){
    //             displayUnit=preferences['CalculationMethod'];
    //             payloadData['CalculationMethod']=displayUnit;
    //         }
    //         unitKey=defaultUnits[displayUnit][dim]
    //     }
    //     requiredUnits[key]=units[dim].find((unit)=>unit.UnitKey===unitKey);
    // });
    let uoms={};
    fieldValues?.requiredDimensions?.forEach((key)=>{
        uoms[key]=units[key].map((unit)=>{return {Id:unit.Id,DimensionName:unit.DimensionName,UnitKey:unit.UnitKey,UnitOffset:unit.UnitOffset,UnitFactor:unit.UnitFactor,UnitName:unit.UnitName,SystemUnit:unit.SystemUnit}});
    });
    let config={url:fieldValues?.url,query:fieldValues?.query,method:fieldValues?.method,data:selectedResultRows!==null?{...reqFields}:{...reqFields,selectedUnits}};
    return config
}


export const funcSetDefaultValues=(items,selectedFields,payloadData)=>{
    let localSelectedFields=[...selectedFields];
    let localPayloadData={...payloadData};

    items.forEach((item)=>{
        const defaultValue = item.fieldName==='Relieving' || item.fieldName==='Operating' || item.fieldName==='SystemMAWP' || item.fieldName==='OperatingPressure' ?localPayloadData[item.fieldName]:item.type==='radio'?item?.fieldList!==undefined?item?.fieldList[0]?.fieldName:item?.defaultValue:item.type==='checkbox'?item.defaultValue===''?false:item.defaultValue:typeof item.defaultValue==='object'?Array.isArray(item.defaultValue)?'':item.defaultValue.value:typeof item.defaultValue==='string'?item.defaultValue:typeof item.defaultValue==='boolean'? item.defaultValue===''?false:item.defaultValue:'';
        //console.log('Popup Change 11111 >>>>>>>>>>>> field 2222>>>>>>>>>>>>>>>>>>',item.fieldName,item.defaultValue)
        if(localSelectedFields.length>0){
            localSelectedFields=localSelectedFields.filter((f1)=>f1.name!==item.fieldName);
            localSelectedFields.push({name:item.fieldName,value:defaultValue});
        }
        if(Object.keys(localPayloadData).length>0){
            localPayloadData[item.fieldName]=defaultValue;
        }
        localPayloadData[item.fieldName]=defaultValue;
    });
    return {localSelectedFields,localPayloadData}
}
