// import { FIELD_SPLITTER } from "../../utils/constants";
import { FIELD_SPLITTER } from "../../utils/constants";
import DropDown from "../basicComponents/DropDown";
import Input from "../basicComponents/Input";
import InputDropDownCombo from "../basicComponents/InputDropDownCombo";
import TextDisplay from "../basicComponents/TextDisplay";
import FormFieldsInput from "../hoc/FormFieldsInput";
import FormFieldsInputRow from "../hoc/FormFieldsInputRow";
import FormFieldsLabel from "../hoc/FormFieldsLabel";

const InputUom = (props) => {
  // if(props?.fieldName === 'IsDensityOrSpVolumeAt90PerSat' ){
  //   console.log('inputUOM Change 11111 >>>>>>>>>>>> 10101010 >>>>> InputUom >>>>>>>>> ',props,Array.isArray(props?.fieldName) && props?.fieldName?.length > 1)
  // }

  const handleBlur = (item) => {
    // console.log('On Blur >>>>>>>>>>>> 11111',item)
    props?.onBlur(item);
  };  
  return (
    <>
      <FormFieldsInputRow>
        <FormFieldsLabel>
          <TextDisplay {...props} text={props.label} />
        </FormFieldsLabel>
        <FormFieldsInput inputType="uom">
          {props?.grid === 5 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <InputDropDownCombo
                {...props}
                disabled={props?.disabled[props?.fieldName] ?? props?.disabled}
                disableUOM={props?.disableUOM}
                width="8rem"
              />
            </div>
          // ) : props?.fieldName?.split(FIELD_SPLITTER)?.length > 1 ? (
          ) : Array.isArray(props?.fieldName) && props?.fieldName?.length > 1 ? (
            <div style={props?.gridTemplateColumns!==undefined?{ display: "grid", gridTemplateColumns: props?.gridTemplateColumns, gap: "10px" }:{ display: "grid", gridTemplateColumns: "0.84fr 1fr", gap: "14px" }}>
              <>
                {
                // props?.fieldName?.split(FIELD_SPLITTER)?.map((item, index) => {
                  props?.fieldName?.map((item, index) => {
                  // console.log('In input uom >>>>>>>>> ',item,props)
                  return (
                    <InputDropDownCombo
                      {...props}
                      key={`${item}${index}`}
                      outerClassName="inputUom_multi_outer"
                      inputClassName={
                        props?.gridTemplateColumns !== undefined
                          ? props?.error !== undefined && props?.error !== null && props?.error?.length>0
                            ? "input-field-wwd-error"
                            : props?.mandatory[item]
                            ? "input-field-wwd-mandatory"
                            : "input-field-wwd"
                          : undefined
                      }
                      fieldsLen={props?.fieldName?.length}
                      // mandatory={props?.disabled ? false : props?.mandatory[item]}
                      mandatory={ typeof props?.mandatory=='object'?props?.mandatory[item]:props?.mandatory}
                      fieldName={item}
                      value={typeof props?.value ==='object'?props?.value[item]:props?.value}
                      disabled={props?.disabled[item] ?? props?.disabled}
                      disableUOM={props?.disableUOM}
                      style={props?.style !==undefined?{ width: props?.style?.inputWidth } :{ width: "5.5rem" }}
                      width={props?.style !==undefined?props?.style?.dd_width  :"5rem"}
                    />
                  );
                })}
              </>
            </div>
          ) : (
            <InputDropDownCombo
              {...props}
              onBlur={handleBlur}
              disabled={props?.disabled[props?.fieldName] ?? props?.disabled}
              disableUOM={props?.disableUOM}
              mandatory={ typeof props?.mandatory=='object'?props?.mandatory[props?.fieldName]:props?.mandatory}
              width="100%"
            />
          )}
        </FormFieldsInput>
      </FormFieldsInputRow>

    </>
  );
};

InputUom.propTypes = {
  ...TextDisplay.propTypes,
  ...Input.propTypes,
  ...DropDown.propTypes,
};

export default InputUom;
