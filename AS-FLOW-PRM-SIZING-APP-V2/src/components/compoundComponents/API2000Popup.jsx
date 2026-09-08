import React, { useMemo } from 'react';
import Grid from "../hoc/Grid";
import InputUom from "./InputUom";
import LabeledDropdown from "../basicComponents/LabeledDropdown";
import LabeledInput from "../basicComponents/LabeledInput";
import RadioInputUom from './RadioInputUom';
import InputUomInfo from './InputUomInfo';
import CheckboxComponent from './CheckboxComponent';
import ComboboxComponent from './ComboboxComponent';
import HeaderTextComponents from './HeaderTextComponents';
import RadioLabel from './RadioLabel';
import InputInfo from './InputInfo';
import LabelWithIcon from '../basicComponents/LabelWithIcon';
import LabelWithInfo from '../basicComponents/LabelWithInfo';
import ModalButton from './ModalButton';
import MultiInputUom from './MultiInputUom'
import Images from '../basicComponents/Image';
import Card from "../basicComponents/Card";

const API2000Popup = React.memo(({fields, handleChange,handleBlur,handleFocusedFieldName,selectedFields,selectedData,error, ...prop}) => {

    // Pre-group fields by gridSection once per fields-array change.
    // Reduces JSX iteration from O(n × sections) to O(n) single pass.
    const fieldsBySection = useMemo(() => {
        const groups = {};
        fields?.forEach((field, index) => {
            const s = field.gridSection;
            if (!groups[s]) groups[s] = [];
            groups[s].push({ field, index });
        });
        return groups;
    }, [fields]);

    const fetchField=(field,index)=>{
        let disabled = field?.disabled; 
        let componentError=field?.error;
        let uomValue=field?.uomValue;
        let dimensionName=field?.dimensionName;
        let value=field?.value;
        let mandatory=field?.mandatory;
        // console.log(`Popup Change 11111 >>>>>>>>>>>> 9999999 >>> In FireCasePopup >>>>>>>>>>>>>>>>>> fieldName:: ${field?.fieldName}, type : ${field?.type}, value:: ${value}, mandatory:: ${mandatory}, disabled:: ${disabled}, error:: ${componentError}, dimensionName:: ${dimensionName}, uomValue:: ${uomValue}`)
        switch(field.type) {
            case 'label':
                return field.visibility ? <HeaderTextComponents key={field.key} {...field} {...prop} />:''
            case 'icon':
                return field.visibility ?  <LabelWithIcon key={field.key} {...field} {...prop} />:''
            case 'textinfo':
                    return  field.visibility ? <LabelWithInfo key={field.key} {...field} {...prop} />:''
            case 'input': {
                const isVisible = typeof field.visibility === 'object' ? field.visibility[field?.fieldName] :  field.visibility;
                return isVisible ?<LabeledInput {...field} {...prop}  key={`${field.key}${index}`} value={value} mandatory={mandatory} disabled={disabled} error={componentError} onChange={(item)=>handleChange(item)} onBlur={(item)=> handleBlur(item)} handleFocusedFieldName={(item)=>handleFocusedFieldName(item)}/>:''
             }
            case 'number':{
                const isVisible = typeof field.visibility === 'object' ? Array.isArray(field?.fieldName)?field?.fieldName?.length>1?true:field.visibility[field?.fieldName[0]]:field.visibility[field?.fieldName] :  field.visibility;
                return isVisible?<LabeledInput {...field} {...prop} key={`${field.key}${index}`} value={value} mandatory={mandatory} disabled={disabled} error={componentError} onChange={(item)=>handleChange(item)} onBlur={(item)=> handleBlur(item)} handleFocusedFieldName={(item)=>handleFocusedFieldName(item)}/>:""
            }
            case 'combobox': {
                const isVisible = typeof field.visibility === 'object' ? Array.isArray(field?.fieldName)?field?.fieldName?.length>1?true:field.visibility[field?.fieldName[0]]:field.visibility[field?.fieldName] :  field.visibility;
                return isVisible ? <ComboboxComponent key={field.key} {...field} {...prop} fields={fields} value={value} onChange={(item)=>handleChange(item)} onBlur={(item)=> handleBlur(item)}/>:''
            }
            case 'select':
                return field.visibility ? <LabeledDropdown  {...field} {...prop} value={value} key={field.key} mandatory={mandatory} disabled={disabled} error={componentError} width="70%" onChange={(item)=>handleChange(item)} />:''
            case 'checkbox':
                const isVisible = typeof field.visibility === 'object' ? Object.keys(field.visibility).length > 1 ? true : Object.values(field.visibility)[0] === true: field.visibility;
                return isVisible ? <CheckboxComponent key={field.key} {...field} {...prop} value={value} mandatory={mandatory} disabled={disabled} error={componentError} onChange={(item)=>handleChange(item)}  />:''
            case 'radio': {
                const isvisible=typeof field.visibility === 'object'?field.visibility[Object.keys(field.visibility)[0]]:field.visibility;
                // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> In Radio >>>>>>>>>>>>>>>>>>',isvisible,field.fieldList,field.visibility,field.key)
                return isvisible ? <RadioLabel key={field.key} {...field} {...prop} fieldList={field.fieldList} onChange={(item) => handleChange(item, field)} /> :''
                }
                     
            case 'radioInput':
                const isvisible=typeof field.visibility === 'object'?field.visibility[Object.keys(field.visibility)[0]]:field.visibility;
                return isvisible ? <RadioInputUom key={field.key} {...field} {...prop} InputValue={value} error={componentError} dimensionName={dimensionName} uomValue={uomValue} onChange={(item) => handleChange( item,field)} onBlur={(item)=> handleBlur(item)} handleFocusedFieldName={(item)=>handleFocusedFieldName(item)}/>:''
            case 'inputUom':{
                    const validOptions = field?.options?.filter(option => typeof option === 'object');
                    return field.visibility ? <InputUom key={field.key} {...field} {...prop} options={validOptions} value={value} error={componentError} uomValue={uomValue} onChange={(item) => handleChange(item)} onBlur={(item)=> handleBlur(item)} handleFocusedFieldName={(item)=>handleFocusedFieldName(item)} />:''
                } 
            case 'inputUominfo':{
                    const validOptions = field?.options?.filter(option => typeof option === 'object');
                    return field.visibility ? <InputUomInfo key={field.key} {...field} {...prop} options={validOptions} value={value} error={componentError} uomValue={uomValue} onChange={(item) => handleChange(item)} onBlur={(item)=> handleBlur(item)} handleFocusedFieldName={(item)=>handleFocusedFieldName(item)}/>:''
                 }
            case 'inputinfo':{
                    return field.visibility ? <InputInfo key={field.key} {...field} {...prop} value={value} error={componentError} onChange={(item) => handleChange(item)} />:''
                 }
            case 'divider':
                return field.visibility ? <hr key={field.key} style={{alignItems:'center',width:"100%",marginTop:15,marginBottom:15,color:"#c0c0c0"}} color="#c0c0c0" size="1"/>:''
            case 'modal':{
                return field.visibility ? <ModalButton key={field.key} {...field} {...prop} onChange={(item) => handleChange(item)}/> :''
                }
            case 'multiInputUom':
                // console.log('Popup Change 11111 >>>>>>>>>>>> In useUnitConverter :::: ',field);
                return field.visibility[Object.keys(field.visibility)[0]] ? <MultiInputUom key={field.key} {...field} {...prop} InputValue={value} error={componentError} dimensionName={dimensionName} uomValue={uomValue} onChange={(item) => handleChange( item,field)} onBlur={(item)=> handleBlur(item)} handleFocusedFieldName={(item)=>handleFocusedFieldName(item)}/>:''
            case 'image':
                return field.visibility ? <Images {...field} />:''
            default:
                return ""
        }
    }
  
    return (
    // <Box sx={{ flexGrow: 1,width:800,height:600, }}>
    <div style={{width:1100,minHeight:250,overflow:'auto'}}>
        <Card variant="outlined" sx={{padding:'8px',marginBottom:"10px"}}>
            <h4 style={{margin:0, marginLeft:'1rem',marginBottom:'1rem'}}>Required Flow Rate Data</h4>
            <Grid container spacing={1}>
                
                <Grid item md={6}>
                    {
                        fieldsBySection[1]?.map(({field, index}) => fetchField(field, index))
                    }
                </Grid>
                    
                <Card variant="outlined" sx={{width:530,padding:'6px'}}>
                    <h4 style={{margin:0, marginLeft:'1rem',marginBottom:'1rem'}}>Results</h4>    
                    <Grid item md={12} >
                        {
                            fieldsBySection[2]?.map(({field, index}) => fetchField(field, index))
                        }
                    </Grid>
                </Card>
            </Grid>
        </Card>
        {/* <Card variant="outlined" sx={{padding:'8px'}}> */}
        <Grid container spacing={1}>
            <Grid item md={6}>
            </Grid>
            <Grid item md={6}>
                {
                    fieldsBySection[4]?.map(({field, index}) => fetchField(field, index))
                }
            </Grid>
        </Grid>
        {/* </Card> */}
        {selectedData['CalculateTankData']===true &&
        <Card variant="outlined" sx={{padding:'8px'}}>
            <h4 style={{margin:0, marginLeft:'1rem',marginBottom:'1rem'}}>Tank Data</h4>
            <Grid container spacing={1}>
                <Grid item md={6}>
                    {
                        fieldsBySection[5]?.map(({field, index}) => fetchField(field, index))
                    }
                </Grid>
                <Grid item md={6}>
                    {
                        fieldsBySection[6]?.map(({field, index}) => fetchField(field, index))
                    }
                </Grid>
            </Grid>
        </Card>}
    </div>
    // </Box>
  )
});

export default API2000Popup
