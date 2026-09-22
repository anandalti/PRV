import { useEffect, useState } from "react";
import InputUomField from "../customComponents/InputUomField";
import InputField from "../customComponents/InputField";
import workflowData from "../workflowSelection/workflow.json";
import uomFieldsData from "../workflowSelection/uomFields.json";
import {useDispatch, useSelector } from "react-redux";
import { convertUnit } from "../helper/convertUnit";
import { initFields, updateFieldValue, updateUom } from "../store/actions/valveCalculationsActions";
import { performCalculations } from "../store/valveCalculationSlice";

const ValveCalculation = () => {
    const dispatch = useDispatch();
    const { fields, uomUnits } = useSelector((state) => state.fieldProperties);
    const { uoms: uomData } = useSelector(state => state.layout);
    const { sizingDetails: {sizingData, valveCalculation} } = useSelector((state) => state.valveCalculation);
    const [workflowFields, setWorkflowFields] = useState([]);
    const [errors, setErrors] = useState({});
    const UOMKey = {
        "length": "length",
        "length1": "length",
        "force": "force",
        "noise": "noise",
        "velocity": "velocity",
        "density": "density",   
        "pressure": "pressure"
    }
    const regexPatterns = {
        NOT_ALLOW_NEGATIVE: /^(0|[1-9]\d*)(\.\d+)?$/,
        ALLOW_NEGATIVE: /^[-]?\d*\.?\d*$/,
    };

    useEffect(() => {
        if (sizingData) {
            const workflowId = sizingData.SizingDetails[0].WorkFlowId;
            const workflow = workflowData.find(wf => wf.workflowId.includes(workflowId));
            console.log({workflow, uomUnits});
            if (workflow) {
                setWorkflowFields(workflow.fields);
                dispatch(initFields({ fields: workflow.fields }));
                dispatch(updateFieldValue({fieldName: 'OutletDiameter', value: valveCalculation?.OutletDiameter?.Value ?? '' }));
                dispatch(updateUom({ fieldName: 'OutletDiameter', newUom: valveCalculation?.OutletDiameter?.UOM ?? '' }));
                dispatch(updateFieldValue({fieldName: 'NoiseLevel', value: valveCalculation?.NoiseLevel?.Value ?? '' }));
                dispatch(updateUom({ fieldName: 'NoiseLevel', newUom: valveCalculation?.NoiseLevel?.UOM ?? ''}));
                dispatch(updateFieldValue({ fieldName: 'ReactionForce', value: valveCalculation?.ReactionForce?.Value ?? '' }));
                dispatch(updateUom({ fieldName: 'ReactionForce', newUom: valveCalculation?.ReactionForce?.UOM ?? ''}));
                dispatch(updateFieldValue({ fieldName: 'SoundPowerLevel', value: valveCalculation?.SoundPowerLevel?.Value ?? '' }));
                dispatch(updateUom({ fieldName: 'SoundPowerLevel', newUom: valveCalculation?.SoundPowerLevel?.UOM ?? '' }));
                dispatch(updateFieldValue({fieldName: 'SoundPressureLevelatDistancefromValve', value: valveCalculation?.SoundPressureLevelatDistancefromValve?.Value ?? '' }));
                dispatch(updateUom({ fieldName: 'SoundPressureLevelatDistancefromValve', newUom: valveCalculation?.SoundPressureLevelatDistancefromValve?.UOM ?? '' }));
                dispatch(updateFieldValue({fieldName: 'DistanceFromValve', value: valveCalculation?.DistanceFromValve?.Value ?? '' }));
                dispatch(updateUom({ fieldName: 'DistanceFromValve', newUom: valveCalculation?.DistanceFromValve?.UOM ?? '' }));
                dispatch(updateFieldValue({fieldName: 'GasOutletDensity', newUOM: valveCalculation?.GasOutletDensity?.Value ?? ''}));
                dispatch(updateUom({ fieldName: 'GasOutletDensity', newUom: valveCalculation?.GasOutletDensity?.UOM ?? '' }));
                dispatch(updateFieldValue({fieldName: 'LiquidDensityOutlet', value: valveCalculation?.LiquidDensityOutlet?.Value ?? '' }));
                dispatch(updateUom({ fieldName: 'LiquidDensityOutlet', newUom: valveCalculation?.LiquidDensityOutlet?.UOM ?? '' }));
                dispatch(updateFieldValue({ fieldName: 'OutletStaticPressure', value: valveCalculation?.OutletStaticPressure?.Value ?? '' }));
                dispatch(updateUom({ fieldName: 'OutletStaticPressure', newUom: valveCalculation?.OutletStaticPressure?.UOM ?? '' }));
            }
        }
    }, [sizingData, dispatch]);
    
    useEffect(() => {
        dispatch(updateFieldValue({fieldName: 'OutletDiameter', value: valveCalculation?.OutletDiameter?.Value ?? '' }));
        dispatch(updateUom({ fieldName: 'OutletDiameter', newUom: valveCalculation?.OutletDiameter?.UOM ?? '' }));
        dispatch(updateFieldValue({ fieldName: 'NoiseLevel', value: valveCalculation?.NoiseLevel?.Value ?? ''}));
        dispatch(updateUom({ fieldName: 'NoiseLevel', newUom: valveCalculation?.NoiseLevel?.UOM ?? '' }));
        dispatch(updateFieldValue({ fieldName: 'ReactionForce', value: valveCalculation?.ReactionForce?.Value ?? '' }));
        dispatch(updateUom({ fieldName: 'ReactionForce', newUom: valveCalculation?.ReactionForce?.UOM ?? '' }));
        dispatch(updateFieldValue({fieldName: 'SoundPowerLevel', value: valveCalculation?.SoundPowerLevel?.Value ?? '' }));
        dispatch(updateUom({ fieldName: 'SoundPowerLevel', newUom: valveCalculation?.SoundPowerLevel?.UOM ?? ''}));
        dispatch(updateFieldValue({ fieldName: 'SoundPressureLevelatDistancefromValve', value: valveCalculation?.SoundPressureLevelatDistancefromValve?.Value ?? ''}));
        dispatch(updateUom({ fieldName: 'SoundPressureLevelatDistancefromValve', newUom: valveCalculation?.SoundPressureLevelatDistancefromValve?.UOM ?? '' }));
        dispatch(updateFieldValue({fieldName: 'DistanceFromValve', value: valveCalculation?.DistanceFromValve?.Value ?? '' }));
        dispatch(updateUom({ fieldName: 'DistanceFromValve', newUom: valveCalculation?.DistanceFromValve?.UOM ?? '' }));
        dispatch(updateFieldValue({fieldName: 'GasOutletDensity', value: valveCalculation?.GasOutletDensity?.Value ?? '' }));
        dispatch(updateUom({ fieldName: 'GasOutletDensity', newUom: valveCalculation?.GasOutletDensity?.UOM ?? '' }));
        dispatch(updateFieldValue({fieldName: 'LiquidDensityOutlet', value: valveCalculation?.LiquidDensityOutlet?.Value ?? '' }));
        dispatch(updateUom({ fieldName: 'LiquidDensityOutlet', newUom: valveCalculation?.LiquidDensityOutlet?.UOM ?? '' }));
        dispatch(updateFieldValue({ fieldName: 'OutletStaticPressure', value: valveCalculation?.OutletStaticPressure?.Value ?? '' }));
        dispatch(updateUom({ fieldName: 'OutletStaticPressure', newUom: valveCalculation?.OutletStaticPressure?.UOM ?? '' }));
    }, [valveCalculation]);

   

    const handleFieldBlur = () => {
        const newFields = Object.keys(fields).reduce((acc, field) => {
            acc[field] = {'Value': typeof fields[field] === 'object' ? fields[field][uomUnits[field]]: fields[field],'UOM': field === 'Velocity' ? sizingData.SizingDetails[0].DisplayUnitSystem === 'Metric' ? 'm/s' : uomUnits[field] : uomUnits[field]};
            return acc;
        }, {});      
        newFields.sizingDetails = sizingData;
        dispatch(performCalculations(newFields));
    }
    const handleFieldChange = (fieldName, value) => {
        const fieldConfig = workflowFields.find(field => field.fieldName === fieldName);
        let errorMsg = '';
        // Special validation for OutletGasMassFraction
        if (fieldName === 'OutletGasMassFraction') {
            const num = parseFloat(value);
            if (value === '' || isNaN(num) || num < 0.0 || num > 1.0) {
                errorMsg = 'Could not find the dimensions for current configuration Outlet Gas Mass Fraction must be between 0.0 to 1.0';
            }
        }
        if (fieldConfig?.regex && regexPatterns[fieldConfig.regex]) {
            const isValid = regexPatterns[fieldConfig.regex].test(value);
            if (!isValid) {
                value = value.replace(/[^0-9.]/g, '');
                if (fieldConfig.regex === "NOT_ALLOW_NEGATIVE") {
                    value = value.replace(/^-/, '');
                }
            }
        }
        setErrors(prev => ({ ...prev, [fieldName]: errorMsg }));
        dispatch(updateFieldValue({fieldName, value}));
    };

    const getUomOptions = (dimensionName, calcMethod) => {
        const uomField = uomFieldsData[calcMethod].find(uom => uom.dimensionName === dimensionName);
        return uomField ? uomField.options : [];
    };
    
    const handleUomChange = (fieldName, newUom) => {
        const currentValue = typeof fields[fieldName] === 'object' ? fields[fieldName][uomUnits[fieldName]] : fields[fieldName];
        const fieldObj = workflowFields.find(wf => wf.fieldName === fieldName)
        let fromUnitData, toUnitData;
        if(fieldObj.dimensionName === 'velocity') {
            fromUnitData = uomData[UOMKey['length']].find(u => u.UnitName === (uomUnits[fieldName] === 'm/s' ? 'm': 'ft'));
            toUnitData = uomData[UOMKey['length']].find(u => u.UnitName === (newUom === 'm/s' ? 'm': 'ft'));
        } else {
            fromUnitData = uomData[UOMKey[fieldObj.dimensionName]].find(u => u.UnitName === uomUnits[fieldName]);
            toUnitData = uomData[UOMKey[fieldObj.dimensionName]].find(u => u.UnitName === newUom);
        }
    
        if (fromUnitData && toUnitData) {
            const convertedValue = convertUnit(currentValue, fromUnitData, toUnitData);
            dispatch(updateUom({fieldName, newUom}))
            dispatch(updateFieldValue({fieldName, value: convertedValue === ''? '':convertedValue?.toFixed(4)}))
            const newFields = Object.keys(fields).reduce((acc, field) => {
                acc[field] = {'Value': typeof fields[field] === 'object' ? fields[field][uomUnits[field]]: fields[field], 'UOM': field === 'Velocity' ? sizingData.SizingDetails[0].DisplayUnitSystem === 'Metric' ? 'm/s' : uomUnits[field] : uomUnits[field]};
                if(field === fieldName) {
                    acc[field] = {'Value': convertedValue, 'UOM': newUom};
                }
                return acc;
            }, {});      
            newFields.sizingDetails = sizingData;
            dispatch(performCalculations(newFields));
        }
    
    };
    return (
        <>
            {workflowFields.map(field => {
                if (field.type === "inputUOM") {
                    console.log({field: field.fieldName, uomUnits});
                    return (
                        <InputUomField
                            key={field.fieldName}
                            label={field.label}
                            infoText={field.infoText}                            
                            disabled={!!field.disabled}
                            uomOptions={getUomOptions(field.dimensionName, sizingData.SizingDetails[0].DisplayUnitSystem)}
                            defaultValue={typeof fields[field.fieldName] === 'object' ? fields[field.fieldName][uomUnits[field.fieldName]]: fields[field.fieldName]}
                            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                            onBlur={(e) => handleFieldBlur(field.fieldName, e.target.value)}
                            selectedUom={uomUnits[field.fieldName]}
                            onUomChange={(e) => handleUomChange(field.fieldName, e.target.value)}
                        />
                    );
                } else if (field.type === "input") {
                    // console.log({field});
                    return (
                        <InputField
                            key={field.fieldName}
                            label={field.label}
                            type={field.fieldType}
                            grid={field.grid}
                            disabled={!!field.disabled}
                            infoText={field.infoText}
                            value={fields[field.fieldName]}
                            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                            error={errors[field.fieldName]}
                        />
                    );
                }
                return null;
            })}
        </>
    );
    
}  

export default ValveCalculation;