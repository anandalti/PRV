const fs = require('fs');
const path = require('path');
const { convertUnitDiffDims, workFlowPopupData } = require("../../utils/helper");
const { getUOMs, getDefaultUOMs } = require("../getUom");


const FieldUomConversion = async (payload) => {
    const { values, fromUom:fromUOM, toUom:toUOM, inputs } = payload;

    if (fromUOM === toUOM) {
        // console.log(fromUOM, toUOM, values);
        return { convertedValue: values };
    }
    // Skip expensive UOM lookup when all field values are empty — conversion is a no-op
    const allValuesEmpty = Object.values(values).every(v => v === '' || v === null || v === undefined);
    if (allValuesEmpty) {
        return { convertedValue: values };
    }
    let convertedValue = {};
    try {
        const uomData = await getUOMs();
        let localFromUom=uomData.find(uom=>uom.UnitKey==fromUOM)
        let localToUom=uomData.find(uom=>uom.UnitKey==toUOM)
        let localpayload={...inputs};
        
        if(!localFromUom) throw new Error(`From UOM with Unitkey: ${fromUOM} not found`)
        if(!localToUom) throw new Error(`To UOM with Unitkey: ${toUOM} not found`)
        // console.log(localFromUom,localToUom)
        Object.keys(values).forEach(async (key) => {
            if(values[key]!==''){

                if(fromUOM.startsWith('viscosity') || toUOM.startsWith('viscosity')){
                    if(key==='ViscosityLiquid'){
                        localpayload['SpGravity'] = inputs['SpGravityLiquid'];
                    }else if(key==='ViscosityLiquid2' && localpayload['IsLiquid2']){
                        localpayload['SpGravity'] = inputs['SpGravityLiquid2'];
                    }
                }
                if(key === 'WreqV') {
                    localpayload['MolWeight'] = inputs['MolWeightVacuum'];
                }
                convertedValue[key] = await convertUnitDiffDims(values[key], localFromUom, localToUom, uomData, localpayload);
            }else{
                convertedValue[key] = '';
            }
            // console.log(values[key],localFromUom, localToUom , ' ---> ', convertedValue[key]);
        });
        return { convertedValue };
    } catch (error) {
        return { error: error.message };
    }

}

const getConvertedFieldData = async (uomData, defUomData, inputs, isPopup = false) => {
    let convertedValue = {};
    const localpayload={...inputs};
    const displayUnitSystem= localpayload['DisplayUnitSystem'];
    const SystemUnit= displayUnitSystem=='Metric' ? 'Metric' : 'English';
    const workflowId= localpayload.workflowId;
    const workflowFileName= workFlowPopupData[workflowId] && isPopup ? workFlowPopupData[workflowId] : `workflowSections${workflowId}`;
    const workflowFile = path.join(__dirname, `../../data/workflows/${workflowFileName}.json`);
    if (fs.existsSync(workflowFile)) {
        const fileData = fs.readFileSync(workflowFile, 'utf8');
        let layout = JSON.parse(fileData);
        layout= isPopup ? [layout] : [...layout];
        layout.forEach(section=>{
            if(Array.isArray(section.fields)){
                section.fields.forEach(async field=>{
                    const uomFieldName=field.uomFieldName;
                    const fieldName=field.fieldName;
                    const fieldValue= localpayload[fieldName];
                    if(uomFieldName!=='' && uomFieldName!==undefined && uomFieldName!==null){
                        // console.log(fieldName,fieldValue,field.uomFieldName)
                        let uomValue= localpayload[uomFieldName];
                        if(uomValue===undefined || uomValue===null || uomValue===''){
                            if(!isNaN(field?.defaultValue)){
                                uomValue= field.defaultUOM["English"];
                            }
                        }
                        console.log(uomFieldName,localpayload[uomFieldName],uomValue)
                        if(uomValue != undefined && uomValue != null && uomValue != ''){
                            let unitDim= uomValue.split('.')[0]; // get unit dimension
                            unitDim= unitDim=='temp' ? 'temperature' : unitDim;
                            const fromUom= uomData.find(uom=>uom.UnitKey==uomValue );
                            const toUom= defUomData?.find(uom => uom.DimensionName==unitDim && uom.SystemUnit== SystemUnit );
                            
                            if(fromUom && toUom){
                                convertedValue[uomFieldName]= toUom.UnitKey; // set converted uom key
                                if(fieldValue !='' && fieldValue !==undefined && fieldValue !==null){
                                    convertedValue[fieldName] = await convertUnitDiffDims(fieldValue, fromUom, toUom, uomData, localpayload);
                                }else{
                                    convertedValue[fieldName] = fieldValue;
                                }
                            }
                        }
                        // console.log(SystemUnit,unitDim,fieldName,fieldValue, convertedValue[fieldName],fromUom?.UnitKey ,toUom?.UnitKey)
                    }else{
                        convertedValue[fieldName] = fieldValue;
                    }
                });
            }
        });
        
        return convertedValue;
    } 
    return convertedValue;
}

const displayUnitUOMConversion = async (payload) => {
    const { inputs } = payload;
    let convertedValue = {};
    try {
        
        const uomData = await getUOMs();
        const defUomData = await getDefaultUOMs();
        
        convertedValue = {...(await getConvertedFieldData(uomData, defUomData, inputs, false))};
        const workflowId= inputs.workflowId;
        if(workFlowPopupData && workFlowPopupData[workflowId]){
           const popupconvertedValue= { ...(await getConvertedFieldData(uomData, defUomData, inputs,true)) };
           convertedValue={...convertedValue,...popupconvertedValue};
        }
        // console.log({convertedValue})
        return { convertedValue }
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = {
    FieldUomConversion,
    displayUnitUOMConversion
};