import { FormControlLabel, Checkbox as MuiCheckbox } from "@mui/material";
import PropTypes from "prop-types";
import ToolTip from "./ToolTip";
import { ERROR_COLOR } from "../../utils/constants";

const Checkbox = ({
  fieldName,
  label,
  value,
  onChange,
  disabled,
  ...props
}) => {
  // console.log('In checkbox >>>>>>> ',props )
  return (
    <ToolTip {...props} infoText={props?.infoText} fieldName={fieldName}>
      <FormControlLabel
        control={
          <MuiCheckbox
            name={fieldName}
            checked={value}
            onChange={(e) => {
              onChange({
                name: fieldName,
                value: e.target.checked,
                mandatory: props?.mandatory,
                type:
                  props?.calculateFields === undefined ? undefined : "checkbox",
                label:label,
                validatefield: props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onChange') ? true : false,
                fieldId:props?.fieldId,sectionId:props?.sectionId,actionId:props?.actionId,isFieldActionRequired:props?.isFieldActionRequired,  
              });
              
            }}
            disabled={
              disabled[fieldName] === undefined
                ? disabled === undefined
                  ? false
                  : disabled
                : disabled[fieldName]
            }
            sx={{
              // color: "#e7e4e4",
              "&.Mui-checked": {
                color:
                  props?.error === null ||
                  props?.error === undefined ||
                  props?.error?.length === 0
                    ? disabled[fieldName] === undefined
                      ? disabled
                        ? "#e7e4e4"
                        : "#00aa7e"
                      : disabled[fieldName]
                      ? "#e7e4e4"
                      : "#00aa7e"
                    : props?.error.find((err) => err.name === fieldName)
                    ? ERROR_COLOR
                    : disabled[fieldName] === undefined
                    ? disabled
                      ? "#e7e4e4"
                      : "#00aa7e"
                    : disabled[fieldName]
                    ? "#e7e4e4"
                    : "#00aa7e",
              },

              display:
                props?.hidden &&
                props?.hidden?.find((item) => item === fieldName) !== undefined
                  ? "none"
                  : "",
              // 'margin-left': props?.hidden && props?.hidden?.find((item)=>item===fieldName)!==undefined && '2rem'
            }}
          />
        }
        sx={{
          "font-weight": "500",
          "margin-left":
            props?.hidden &&
            props?.hidden?.find((item) => item === fieldName) !== undefined &&
            "2rem",
          "font-size": props?.popupFields ? "14px" : "16px",
        }}
        label={
          <span
            style={
              props?.fontSize?{fontSize:props?.fontSize}:
              props?.popupFields
                ? { fontSize: "0.875rem", fontWeight: 500 }
                : { fontSize: "1rem" }
            }
          >
            {label}
          </span>
        }
      />
    </ToolTip>
  );
};

Checkbox.propTypes = {
  name: PropTypes.string,
  grid: PropTypes.number,
  label: PropTypes.string,
  defaultValue: PropTypes.object,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  ...MuiCheckbox.propTypes,
};
export default Checkbox;
