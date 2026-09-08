import PropTypes from 'prop-types';
import { useState } from 'react';
import MultiInputwithUom from '../basicComponents/MultiInputwithUom';

const MultiInputUom = (props) => {
  // console.log('MultiInputDropdownCombo>>>>>>111', props)
  const [selectedValue, setSelectedValue] = useState(props?.defaultSelected ?props?.defaultSelected:props?.fieldList[0]?.fieldGroup);

  return (
    // <div className={props?.popupFields?"grid-radio-container-popup":"grid-radio-container"}>
    <div>
      {
        props?.fieldList?.map((field, index) => {
          // console.log('In RadiotInputUom ::: field ::: 111111>>>> ',field,field?.fieldName,props?.dimensionName,props?.uomValue,props?.InputValue,props?.InputValue[field?.fieldName])
          let componentError=null;
          let dimensionName;
          let uomValue;
          let value;
          let multiFieldFlag=Array.isArray(field?.fieldName)
          const item=field?.fieldName
          // return (<>
          //   {
              if(!multiFieldFlag){
                if(props?.dimensionName!==undefined && Object.keys(props?.dimensionName).length>0){
                  dimensionName=props?.dimensionName[item]  
                }
                if(props?.uomValue!==undefined && Object.keys(props?.uomValue).length>0){
                  uomValue=props?.uomValue[item]  
                }
                if(props?.InputValue!==undefined && Object.keys(props?.InputValue).length>0){
                  value=props?.InputValue[item]  
                  // console.log('In RadiotInputUom ::: field::: 2222222 >>>> ',value,props?.InputValue,props?.InputValue[field?.fieldName])
                }
                if(props?.error!==null){
                  if(Array.isArray(props?.error) && props?.error.length>0){
                    componentError=props?.error?.filter((it)=>it.name===item)
                    if(componentError?.length===0){
                        componentError=null
                    }
                  }else if(typeof props?.error==='object'){
                    componentError=props?.error[item]
                  }
                }
              }else{
                dimensionName=props?.dimensionName
                uomValue=props?.uomValue
                value=props?.InputValue
                componentError=props?.error
              }
              //console.log('In RadiotInputUom ::: field ::: 222222>>>> ',selectedValue,item,value,dimensionName,uomValue,componentError)
              // console.log('formfiledMultiInput UOM ===', field)
              return (
                <div key={`${item}-${index}`} 
                    // className={`radio-container`} 
                    // style={{gridTemplateColumns:props?.popupFields?"0.7fr 1.3fr":field?.grid===4?"1fr 0.85fr 0.74fr":"0.6fr 1fr",marginLeft:props?.popupFields?"1.25rem":field?.grid===6?"5.875rem":"0.875rem"}}
                    >
                
                        <MultiInputwithUom 
                            {...props}
                            key={`${item}-${index}`}
                            option={field}
                            fieldName={item}
                            fieldGroup={field?.fieldGroup}
			                      regex={field?.regex}
                            value={value}
                            UomFieldName={field.UomFieldName}
                            dimensionName={dimensionName}
                            uomValue={uomValue}
                            grid={field?.grid}
                            mandatory={field?.mandatory}
                            error={componentError}
                            selectedValue={selectedValue}
                            handleRadioChange={(fieldGroup)=>setSelectedValue(fieldGroup)}
                            onChange={(it) => props?.onChange(it)}
                            disabled = {field.disabled}
                            disableUOM= {field.disableUOM}
			                      // onBlur={(it) => props?.onBlur(it)}
                            handleFocusedFieldName={(it) => props?.handleFocusedFieldName(it)}
                        />
                </div>
              );
          //   })
          // }
          // </>)
        })
      }
    </div>
  )
};

MultiInputUom.prototype = {
  fieldList: PropTypes.array,
  dimensionName: PropTypes.object,
  uomValue: PropTypes.object,
  InputValue: PropTypes.object,
  error: PropTypes.object,
  handleChange: PropTypes.func
}

export default MultiInputUom