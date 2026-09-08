const fs = require('fs');
const path = require('path');
const RestrictedLiftData = require("../../models/RestrictedLiftData");
const { getUserPreferencesByUserEmail } = require('../../models/UserPreferences');
const { evaluatePropertyExpressions } = require('../evaluateExpressions/fieldProperties');

const {workFlowPopupData, IFR_Models, Models_MOD_IFR, JSeriesRSModels, EM_Models} = require('../../utils/helper');
const { calculateLiftRestrictions, calculateEMLiftRestrictions } = require('../calculations/RestrictedLiftCalculations');

const getFieldsMappedwithPreferences = async (layout,userId,workFlowId)=>{
    // update the default values for UOM fields if required
    const userPreferences = await getUserPreferencesByUserEmail(userId);
    const flowrateUomByWorkflowId = {
        FlowrateGas: [1,2,3,21,22,23,24],
        FlowrateLiquid: [5,6,25],
        FlowrateSteam: [4,7,8,9,10,11], 
        FlowrateAPI521Fire: [12],
        Flowrate2Phase: [13,14,15,17,18,20,21],
        FlowrateSubcooled: [16,19]
    }
    let flowRatekey = Object.keys(flowrateUomByWorkflowId).reduce( (acc, flowrateField) => {
        if(flowrateUomByWorkflowId[flowrateField].includes(parseInt(workFlowId))) {
            acc = flowrateField;
        }
        return acc;
    }, '');
    const fieldPreferenceJson = {
        "AtmPressureUOM": "SystemAtmPressureUOM",
        "PressureUOM": "SystemPressure",
        "TemperatureUOM": "SystemTemperature",
        "ViscosityUOM": "FluidLiquidViscosity",
        "DensityUOM": "FluidDensity",
        "MassFluxUOM": "FluidMassFlux",
        "SpecificVolumeUOM": "FluidSpecificVolume",
        "SpecificHeatUOM": "FluidSpecificHeat",
        "LatentHeatUOM": "FluidLatentHeat",
        "FlowCapacityUOM": flowRatekey
    };
    let defaultValues={workflowId: workFlowId,CalculateFlowRate:true};
    let localLayout=[...layout];
    if(userPreferences) {
        // console.log(' >>>>>>>>>>> 111111111 >>>>>>>>>>')
        localLayout.forEach(section => {
            if (Array.isArray(section.fields) && section.fields.length > 0) {
                section.fields.forEach(field => {
                    if (field.fieldName === 'AtmPressure') {
                        field.defaultValue = userPreferences?.SystemAtmPressure;
                    }
                    if (field.fieldName === 'DisplayUnitSystem'  && field?.options?.length > 1) {
                        field.defaultValue = userPreferences?.DisplayUnitSystem;
                    }
                    if (field.fieldName === 'CalculationMethod' && field?.options?.length > 1) {
                        field.defaultValue = userPreferences?.CalculationMethod;
                    }
                    defaultValues[field.fieldName] = field.defaultValue;
                    const userUomValue = userPreferences[fieldPreferenceJson[field.uomFieldName]];
                    if (userUomValue) {
                        field.defaultUOMValue = userUomValue;
                        defaultValues[field.uomFieldName] = field.defaultUOMValue;
                    }
                });
            }
        });
        localLayout = localLayout.map(section => {
            if (Array.isArray(section.fields) && section.fields.length > 0) {
                
                return {...section,
                    fields: section.fields.map( field => {
                        const validateVisibleUOMField= field?.validateVisibleUOMField ?? undefined;
                        if(validateVisibleUOMField !==undefined){
                            const expressionVariables = Object.keys(defaultValues).reduce((acc, key) => {
                                if(Array.isArray(defaultValues[key])) {
                                    defaultValues[key].forEach(obj => {
                                        const {id, value} = obj;
                                        acc[id] = value;
                                    });
                                } else {
                                    acc[key] = defaultValues[key] ?? '';
                                }
                                return acc;
                            }, {});
                            const localvisiblevals = evaluatePropertyExpressions(validateVisibleUOMField, expressionVariables);
                            
                            return {...field,
                                visible: localvisiblevals[field?.fieldName],
                                validateVisibleUOMField: undefined
                            };
                        }else{
                            return field;
                        }
                    })
                };
            }
        });
    }

    return [...localLayout];
}

// const workFlowPopupData = {
//   3: "API2000Popup",
//   12: "FireSizingPopup",
//   23: "API2000Popup",
//   24: "API2000Popup",
// };

const fieldsErrorMessages = (fields, errors) => {
    const localFields = [];
    fields.forEach(field => {
        if(Array.isArray(field?.validations) && field?.validations?.length > 0) {
            let localValidations=[];
            field?.validations.forEach(validation => {
                if(validation?.message) {
                    const description=errors?.find(err => err?.key===validation.message?.message)?.value;
                    localValidations.push({
                        ...validation,
                        message: {...validation.message,description: description ?? validation?.message?.message},
                        
                    });
                }else{
                    localValidations.push(validation);
                }
            });
            localFields.push({
                ...field,
                validations: [...localValidations]
            });
        }else{
            localFields.push(field);
        }
    });
    return localFields;
}

const layoutSections = (layout) => {
    // Add error messages to the layout
    
    const errorFilePath = path.join(__dirname, `../../data/genericErrors.json`);
    if (fs.existsSync(errorFilePath)) {
        let localLayout;
        const errorData = fs.readFileSync(errorFilePath, 'utf8');
        let errors = JSON.parse(errorData);
        if(Array.isArray(layout)) {
            localLayout=[];
            layout.forEach(section => {
                let localSection = {...section};
                if (Array.isArray(section.fields) && section.fields.length > 0) {
                    localSection.fields = [...fieldsErrorMessages([...section.fields],[...errors])];
                }
                localLayout.push(localSection);
            });
        }else if (Array.isArray(layout.fields) && layout.fields.length > 0) {
            localLayout = {...layout};
            localLayout.fields = [...fieldsErrorMessages([...layout.fields],[...errors])];
        }
        return localLayout;
    }else{
        return layout
    }
    

}

const getPopupDetails = async(workFlowId,userId) => {


    let payloadFlag=process.env?.VITE_DB_SCHEMA_PAYLOAD_FLAG ==="true"?? false;
    let payloadURLs=process.env?.VITE_DB_SCHEMA_PAYLOAD_WORKFLOWS??"";
    if(payloadURLs!==""){
        payloadURLs=payloadURLs.split(',')
    }
    // console.log('payloadURLs >>>>>>>>>>> ',payloadURLs)
    const popupData=workFlowPopupData[workFlowId];
    let layoutFilePath = path.join(__dirname, `../../data/${popupData}.json`);
        
    if(payloadFlag && payloadURLs.indexOf(workFlowId)!==-1 ){
        layoutFilePath = path.join(__dirname, `../../data/workflows/${popupData}.json`);
    }
    if (fs.existsSync(layoutFilePath)) {
        // Read from file
        const fileData = fs.readFileSync(layoutFilePath, 'utf8');
        let layout = JSON.parse(fileData);
        layout = await getFieldsMappedwithPreferences([layout],userId,workFlowId)
        // layout = {...layoutSections(layout)};
        return {...layout[0]};
    } else {
        console.error('Preferences layout file not found');
        return false;
    }
}

const getWorkflowDetails = async (workFlowId, userId) => {
    let payloadFlag=process.env?.VITE_DB_SCHEMA_PAYLOAD_FLAG ==="true"?? false;
    let payloadURLs=process.env?.VITE_DB_SCHEMA_PAYLOAD_WORKFLOWS??"";
    if(payloadURLs!==""){
        payloadURLs=payloadURLs.split(',')
    }
    const dataDir = path.resolve(__dirname, '../../data');
    let layoutFilePath = path.resolve(dataDir, `workflowSections${workFlowId}.json`);

    // CWE-23: ensure the resolved path stays within the data directory
    if (!layoutFilePath.startsWith(dataDir + path.sep) && layoutFilePath !== dataDir) {
        console.error('[getWorkflowDetails] Path traversal attempt detected:', workFlowId);
        return false;
    }

    if(payloadFlag && payloadURLs.indexOf(workFlowId)!==-1 ){
        const workflowsDir = path.resolve(dataDir, 'workflows');
        const altPath = path.resolve(workflowsDir, `workflowSections${workFlowId}.json`);
        if (altPath.startsWith(workflowsDir + path.sep) || altPath === workflowsDir) {
            layoutFilePath = altPath;
        }
    }
    

    if (fs.existsSync(layoutFilePath)) {
        // Read from file
        const fileData = fs.readFileSync(layoutFilePath, 'utf8');
        let layout = JSON.parse(fileData);
        layout = await getFieldsMappedwithPreferences(layout,userId,workFlowId) //[...layoutSections(layout)];
        
        return [...layout];
    } else {
        console.error('Preferences layout file not found');
        return false;
    }
}

const getPreferences = async () => {
    const layoutFilePath = path.join(__dirname, '../../data/preferenceSection.json');
    if (fs.existsSync(layoutFilePath)) {
        // Read from file
        const fileData = fs.readFileSync(layoutFilePath, 'utf8');
        const layout = JSON.parse(fileData);
        return [...layout];
    } else {
        console.error('Preferences layout file not found');
        return false;
    }
};

const getRestrictedLIftDetails = async (params, source = 'REST') => {
    let layoutFilePath = '';
    const ModelNumber = params?.ModelNumber ?? '';
    const isGQL = source === 'GraphQL';
    if(JSeriesRSModels.includes(ModelNumber)){
        layoutFilePath = path.join(__dirname, isGQL
            ? '../../data/restrictedLift/JSeriesRestrictedLiftGQL.json'
            : '../../data/restrictedLift/JSeriesRestrictedLift.json');
    }else if(ModelNumber==='HCI'){
        layoutFilePath = path.join(__dirname, isGQL
            ? '../../data/restrictedLift/HCIRestrictedLiftGQL.json'
            : '../../data/restrictedLift/HCIRestrictedLift.json');
    }else{
        layoutFilePath = path.join(__dirname, isGQL
            ? '../../data/restrictedLift/EMRestrictedLiftGQL.json'
            : '../../data/restrictedLift/EMRestrictedLift.json');
    }
    
    if (fs.existsSync(layoutFilePath)) {
        // Read from file
        const fileData = fs.readFileSync(layoutFilePath, 'utf8');
        let layout = JSON.parse(fileData);
        const SizingId = params?.SizingId ?? null;
        let SizingData= SizingId!==null && SizingId!==undefined? await RestrictedLiftData.getRestrictedLiftDataById(SizingId):null;
        const dbOrifice= SizingData?.Orifice ? SizingData.Orifice.replace(/"/g, '') : null;
        // console.log(SizingData,dbOrifice===params?.Orifice,dbOrifice,params?.Orifice)
        if(SizingData!==null && SizingData?.ModelNumber===ModelNumber && dbOrifice===params?.Orifice
            && parseFloat(SizingData?.RequiredFlow)===parseFloat(params?.RequiredCapacity)
            // && parseFloat(SizingData?.RatedFlowCapacity)===parseFloat(params?.RatedFlowCapacity)
        ){
            SizingData=SizingData;
        }else{
            SizingData=null;
        }
        // console.log(SizingData)
        let EM_Data;
        if(EM_Models.includes(ModelNumber)){
            const localparams={
                Orifice: params.Orifice.replace(/"/g, ''),
                RequiredCapacity: params.RequiredCapacity,
                RatedFlowCapacity: parseFloat(params.RatedFlowCapacity),
                Service: params.Service
            };
            EM_Data=calculateEMLiftRestrictions(localparams);
            if(SizingData!==null && SizingData?.RestrictedLift=='RestrictedLiftSpecify'){
                EM_Data.RestrictedLiftCapacity= parseFloat(SizingData?.RestrictedLiftCapacity) || EM_Data?.RestrictedLiftCapacity;
                EM_Data.LiftRestriction= parseFloat(SizingData?.LiftRestriction) || EM_Data?.LiftRestriction;
            }
        }
        // console.log(EM_Data)
        let fieldData=layout?.fields?.map(field=>{
            if(field?.fieldName==='RequiredCapacity'){
                 
                return {...field,defaultValue: params?.RequiredCapacity ?? ''};
            }
            if(field?.fieldName==='RatedFlowCapacity'){
                return {...field,defaultValue: params?.RatedFlowCapacity ?? ''};
            }
            let LiftRestrictionRatio=parseFloat(params?.RequiredCapacity) / parseFloat(params?.RatedFlowCapacity);
            LiftRestrictionRatio=LiftRestrictionRatio>=1 ? 1 : LiftRestrictionRatio.toFixed(3)//Math.floor(LiftRestrictionRatio * 10) / 10;
            if(LiftRestrictionRatio<0.3){
                LiftRestrictionRatio=0.3;
            }
            if(ModelNumber==='HCI' && field?.fieldName==='LiftRestriction'){
                const localLiftRestrictionRatio=LiftRestrictionRatio==0.3?'0.300':LiftRestrictionRatio.toString();
                return {...field,defaultValue: localLiftRestrictionRatio.toString(),LROptions:[{label:localLiftRestrictionRatio.toString(),value:localLiftRestrictionRatio.toString()}]}
            }
            if(ModelNumber==='HCI' && field?.fieldName==='RestrictedLiftCapacity'){
                return {...field,defaultValue: (LiftRestrictionRatio *params?.RatedFlowCapacity).toString() ?? ''}
            }
            if( field?.fieldName==='IFR'){
                if(Models_MOD_IFR[ModelNumber]?.Need_IFR === "NO"){
                    return {...field,visible:false,mandatory:false,disabled:true};
                }else if(Models_MOD_IFR[ModelNumber]?.Need_IFR === "YES" && (params?.Orifice=='D' || params?.Orifice=='E')){
                    const defaultValue=SizingData ? SizingData.IFR : '1';
                    return {...field,visible:true,mandatory:true,disabled:false, defaultValue};
                }else{
                    // return {...field,visible:true,mandatory:true,disabled:false};
                    return {...field,visible:false,mandatory:false,disabled:true};
                }
            }
            
            if(SizingData!==null){
                if(field?.fieldGroupType!==undefined){
                    return {...field,defaultSelected: SizingData[field?.fieldGroupName] ?? field?.defaultSelected};
                }
                
                const defaultValue=SizingData ? SizingData[field?.fieldName] : field?.defaultValue;
                if(EM_Models.includes(ModelNumber) && field?.fieldName==='LiftRestriction'){
                    return {...field,defaultValue: EM_Data?.LiftRestriction ?? '',LROptions:EM_Data?.LROptions ?? EM_Data?.Options ?? [],options:EM_Data?.LROptions ?? EM_Data?.Options ?? []};
                }else if(field?.fieldName==='LiftRestriction' ){
                    const localparams={
                        ModelNumber:ModelNumber,
                        Orifice: params.Orifice,
                        RequiredCapacity: params.RequiredCapacity,
                        RatedFlowCapacity: parseFloat(params.RatedFlowCapacity),
                        DoNotExceedCapacity: parseFloat(SizingData.DoNotExceedCapacity),
                        IFR:parseInt(SizingData.IFR)
                    };
                    const data=calculateLiftRestrictions(localparams);
                    // console.log({SizingData,localparams,data})
                    if(SizingData!==null && SizingData?.RestrictedLift=='RestrictedLiftSpecify'){
                        // EM_Data.RestrictedLiftCapacity= parseFloat(SizingData?.RestrictedLiftCapacity) || EM_Data?.RestrictedLiftCapacity;
                        // EM_Data.LiftRestriction= parseFloat(SizingData?.LiftRestriction) || EM_Data?.LiftRestriction;
                        return {...field,
                            defaultValue: parseFloat(SizingData?.LiftRestriction) || defaultValue ||'',
                            LROptions:data?.LROptions ?? [],
                            options:data?.LROptions ?? []};
                    }else{

                        return {...field,defaultValue: data?.LiftRestriction ?? defaultValue ??'',LROptions:data?.LROptions ?? [],options:data?.LROptions ?? []};
                    }
                }
                return {...field,defaultValue: defaultValue ?? ''};
            }else if(
                EM_Models.includes(ModelNumber) && 
                field?.fieldName==='LiftRestriction'){
                return {...field,defaultValue: EM_Data?.LiftRestriction ?? '',LROptions:EM_Data?.Options ?? [],options:EM_Data?.Options ?? []};
            
            }else if(EM_Models.includes(ModelNumber) && field?.fieldName==='RestrictedLiftCapacity'){
                return {...field,defaultValue: EM_Data?.RestrictedLiftCapacity ?? ''};
            }else if(EM_Models.includes(ModelNumber) && field?.fieldName==='RestrictedLiftErrors'){
                return {...field,options: EM_Data?.RestrictedLiftErrors ?? []};
            // }else if(field?.fieldName==='LiftRestriction'){
            //     return {...field,defaultValue: data?.LiftRestriction ?? defaultValue ??'',LROptions:data?.LROptions ?? [],options:data?.LROptions ?? []};
            
            }else{
                return field;
            }
        });

        return {...layout,fields: [...fieldData]};
    } else {
        console.error('Preferences layout file not found');
        return false;
    }
};




module.exports = {
  getPopupDetails,
  getWorkflowDetails,
  getPreferences,
  getRestrictedLIftDetails
};