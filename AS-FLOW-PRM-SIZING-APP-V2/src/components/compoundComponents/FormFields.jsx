import PropTypes from "prop-types";
import Grid from "../hoc/Grid";
import InputUom from "./InputUom";
import { gridCenterSx } from "../../styles/StyleObjectProperties";
import LabeledDropdown from "../basicComponents/LabeledDropdown";
import LabeledInput from "../basicComponents/LabeledInput";
import { useEffect, useState } from "react";
import RadioInputUom from "./RadioInputUom";
import InputUomInfo from "./InputUomInfo";
import CheckboxComponent from "./CheckboxComponent";
import ComboboxComponent from "./ComboboxComponent";
import HeaderTextComponents from "./HeaderTextComponents";
import RadioLabel from "./RadioLabel";
import InputInfo from "./InputInfo";
import LabelWithIcon from "../basicComponents/LabelWithIcon";
import LabelWithInfo from "../basicComponents/LabelWithInfo";
import ModalButton from "./ModalButton";
import MultiInputUom from "./MultiInputUom";
import Images from "../basicComponents/Image";
import ImageView from "../basicComponents/ImageView";
// import FormFieldsContainer from "../hoc/FormFieldsContainer";

import { useSelector } from "react-redux";

const FormFields = ({
  fields,
  handleChange,
  handleBlur,
  handleFocusedFieldName,
  selectedFields,
  error,
  ...prop
}) => {
  // console.log("In FormFields::: fields::: >>>>>>>>> ", fields, selectedFields);
  const { isAdvanced } = useSelector((state) => state.layout);
  useEffect(() => {
    if (process.env.FORM_FIELDS_COLUMNS > 1) {
      document.documentElement.style.setProperty(
        "--grid-container-columns",
        process.env.FORM_FIELDS_COLUMNS
      );
      document.documentElement.style.setProperty(
        "--grid-input-template-columns",
        "1fr"
      );
      document.documentElement.style.setProperty(
        "--grid-label-justify-content",
        "start"
      );
    }
  }, []);

  // const {defaultUnits} = useSelector(state => state.uom);
  const [newFields, setNewFields] = useState(fields);

  const generateFields = (fields, handleChange) => {
    {
      return newFields.map((field, index) => {
        // console.log("In FormFields::: fields::: >>>>>>>>> ", field);
        if (field?.handleChange) handleChange = field?.handleChange;
        if (field?.handleBlur) handleBlur = field?.handleBlur;
        if (field?.handleFocusedFieldName)
          handleFocusedFieldName = field?.handleFocusedFieldName;
        if (field?.focusFieldName)
          handleFocusedFieldName = field?.handleFocusedFieldName;

        let disabled = field?.disabled;
        let componentError = field?.error;
        let uomValue = field?.uomValue;
        let dimensionName = field?.dimensionName;
        let value = field?.value;
        let mandatory = field?.mandatory;
        // if(field.type =='modal'){
        // console.log('In formField >>>>>>>>> ',field)
        // }
        switch (field.type) {
          case "label":
            return field.visibility ? (
              <HeaderTextComponents key={field.key} {...field} {...prop} />
            ) : (
              ""
            );
          // return <HeaderTextComponents key={field.key} {...field} {...prop} />
          case "icon":
            return field.visibility ? (
              <LabelWithIcon key={field.key} {...field} {...prop} />
            ) : (
              ""
            );
          case "textinfo":
            return field.visibility ? (
              <LabelWithInfo key={field.key} {...field} {...prop} />
            ) : (
              ""
            );
          case "input": {
            const isVisible =
              typeof field.visibility === "object"
                ? field.visibility[field?.fieldName]
                : field.visibility;
            return isVisible ? (
              <LabeledInput
                {...field}
                {...prop}
                key={`${field.key}${index}`}
                value={value}
                mandatory={mandatory}
                disabled={disabled}
                error={componentError}
                onChange={(item) => handleChange(item)}
                onBlur={(item) => handleBlur(item)}
                handleFocusedFieldName={(item) => handleFocusedFieldName(item)}
              />
            ) : (
              ""
            );
          }
          case "number": {
            const isVisible =
              typeof field.visibility === "object"
                ? Array.isArray(field?.fieldName)
                  ? field?.fieldName?.length > 1
                    ? true
                    : field.visibility[field?.fieldName[0]]
                  : field.visibility[field?.fieldName]
                : field.visibility;
            return isVisible ? (
              <LabeledInput
                {...field}
                {...prop}
                key={`${field.key}${index}`}
                value={value}
                mandatory={mandatory}
                disabled={disabled}
                error={componentError}
                onChange={(item) => handleChange(item)}
                onBlur={(item) => handleBlur(item)}
                handleFocusedFieldName={(item) => handleFocusedFieldName(item)}
              />
            ) : (
              ""
            );
          }
          case "combobox": {
            const isVisible =
              typeof field.visibility === "object"
                ? Array.isArray(field?.fieldName)
                  ? field?.fieldName?.length > 1
                    ? true
                    : field.visibility[field?.fieldName[0]]
                  : field.visibility[field?.fieldName]
                : field.visibility;
            return isVisible ? (
              <ComboboxComponent
                key={field.key}
                {...field}
                {...prop}
                fields={fields}
                value={value}
                onChange={(item) => handleChange(item)}
                onBlur={(item) => handleBlur(item)}
              />
            ) : (
              ""
            );
            //return field.visibility ? <ComboboxComponent key={field.key} {...field} {...prop} fields={fields} value={value} onChange={(item)=>handleChange(item)}/>:''
            //return <Combobox key={field.key} {...field} {...prop} fields={fields} value={value} onChange={(item)=>handleChange(item)}/>
          }
          case "select":
            return field.visibility ? (
              <LabeledDropdown
                {...field}
                {...prop}
                value={value}
                key={field.key}
                mandatory={mandatory}
                disabled={disabled}
                error={componentError}
                // width="70%"
                onChange={(item) => handleChange(item)}
              />
            ) : (
              ""
            );
          case "checkbox":
            const isVisible =
              typeof field.visibility === "object"
                ? Object.keys(field.visibility).length > 1
                  ? true
                  : Object.values(field.visibility)[0] === true
                : field.visibility;
            return isVisible ? (
              <CheckboxComponent
                key={field.key}
                {...field}
                {...prop}
                value={value}
                mandatory={mandatory}
                disabled={disabled}
                error={componentError}
                onChange={(item) => handleChange(item)}
              />
            ) : (
              ""
            );
          //return <CheckboxComponent key={field.key} {...field} {...prop} value={value} mandatory={mandatory} disabled={disabled} error={componentError} onChange={(item)=>handleChange(item)}  />
          // case 'radio':
          //     return field.visibility ? <RadioLabel key={field.key} {...field} {...prop} value={value} label={field.fieldList[0].inputLabel} error={componentError} onChange={(item) => handleChange(item, field)} /> : ''
          case "radio": {
            const isvisible =
              typeof field.visibility === "object"
                ? field.visibility[Object.keys(field.visibility)[0]]
                : field.visibility;
            // console.log('In formField::: radio visibility >>>>>>>>> ',field?.fieldName,field.visibility[Object.keys(field.visibility)[0]],field.visibility,isvisible)
            return isvisible ? (
              <RadioLabel
                key={field.key}
                {...field}
                {...prop}
                fieldList={field.fieldList}
                onChange={(item) => handleChange(item, field)}
              />
            ) : (
              ""
            );
          }
          case "radioInputUOM": {
            // return field?.visibility[Object.keys(field?.visibility)[0]]?? field?.visibility ? <RadioInputUom key={field.key} {...field} {...prop} InputValue={value} error={componentError} dimensionName={dimensionName} uomValue={uomValue} onChange={(item) => handleChange( item,field)} onBlur={(item)=> handleBlur(item)} handleFocusedFieldName={(item)=>handleFocusedFieldName(item)}/>:''
            let isvisible =
              typeof field.visibility === "object"
                ? field.visibility[Object.keys(field.visibility)[0]]
                : field.visibility;
            return isvisible ? (
              <RadioInputUom
                key={field.key}
                {...field}
                {...prop}
                InputValue={value}
                error={componentError}
                dimensionName={dimensionName}
                uomValue={uomValue}
                onChange={(item) => handleChange(item, field)}
                onBlur={(item) => handleBlur(item)}
                handleFocusedFieldName={(item) => handleFocusedFieldName(item)}
              />
            ) : (
              ""
            );
          }
          case "radioInput": {
            // return field?.visibility[Object.keys(field?.visibility)[0]]?? field?.visibility ? <RadioInputUom key={field.key} {...field} {...prop} InputValue={value} error={componentError} dimensionName={dimensionName} uomValue={uomValue} onChange={(item) => handleChange( item,field)} onBlur={(item)=> handleBlur(item)} handleFocusedFieldName={(item)=>handleFocusedFieldName(item)}/>:''
            const isvisible =
              typeof field.visibility === "object"
                ? field.visibility[Object.keys(field.visibility)[0]]
                : field.visibility;
            return isvisible ? (
              <RadioInputUom
                key={field.key}
                {...field}
                {...prop}
                InputValue={value}
                error={componentError}
                dimensionName={dimensionName}
                uomValue={uomValue}
                onChange={(item) => handleChange(item, field)}
                onBlur={(item) => handleBlur(item)}
                handleFocusedFieldName={(item) => handleFocusedFieldName(item)}
              />
            ) : (
              ""
            );
          }
          case "inputUom": {
            const validOptions = field?.options?.filter(
              (option) => typeof option === "object"
            );
            return field.visibility ? (
              <InputUom
                key={field.key}
                {...field}
                {...prop}
                options={validOptions}
                value={value}
                error={componentError}
                uomValue={uomValue}
                onChange={(item) => handleChange(item)}
                onBlur={(item) => handleBlur(item)}
                handleFocusedFieldName={(item) => handleFocusedFieldName(item)}
              />
            ) : (
              ""
            );
          }
          case "inputUominfo": {
            const validOptions = field?.options?.filter(
              (option) => typeof option === "object"
            );
            return field.visibility ? (
              <InputUomInfo
                key={field.key}
                {...field}
                {...prop}
                options={validOptions}
                value={value}
                error={componentError}
                uomValue={uomValue}
                onChange={(item) => handleChange(item)}
                onBlur={(item) => handleBlur(item)}
                handleFocusedFieldName={(item) => handleFocusedFieldName(item)}
              />
            ) : (
              ""
            );
          }
          case "inputinfo": {
            return field.visibility ? (
              <InputInfo
                key={field.key}
                {...field}
                {...prop}
                value={value}
                error={componentError}
                onChange={(item) => handleChange(item)}
              />
            ) : (
              ""
            );
          }
          case "divider":
            return field.visibility ? (
              <hr
                key={field.key}
                style={{
                  alignItems: "center",
                  width: "100%",
                  marginTop: 15,
                  marginBottom: 15,
                  color: "#c0c0c0",
                }}
                color="#c0c0c0"
                size="1"
              />
            ) : (
              ""
            );
          case "modal": {
            return field.visibility ? (
              <ModalButton
                key={field.key}
                {...field}
                {...prop}
                onChange={(item) => handleChange(item)}
              />
            ) : (
              ""
            );
          }
          case "multiInputUom":
            return field.visibility[Object.keys(field.visibility)[0]] ? (
              <MultiInputUom
                key={field.key}
                {...field}
                {...prop}
                InputValue={value}
                error={componentError}
                dimensionName={dimensionName}
                uomValue={uomValue}
                onChange={(item) => handleChange(item, field)}
                onBlur={(item) => handleBlur(item)}
                handleFocusedFieldName={(item) => handleFocusedFieldName(item)}
              />
            ) : (
              ""
            );
          case "image":
            return field.visibility ? <Images {...field} /> : "";
          case "imageView":
            return field.visibility ? <ImageView key={index} {...field} /> : "";
          default:
            return "";
        }
      });
    }
  };
  useEffect(() => {
    setNewFields(fields);
  }, [fields]);

  return (
    <>
      {isAdvanced ? (
        <div className="formfields-container">
          {generateFields(fields, handleChange)}
        </div>
      ) : (
        <Grid container spacing={2} sx={gridCenterSx}>
          <div className="formfields-container">
            {generateFields(fields, handleChange)}
          </div>
        </Grid>
      )}
    </>
  );
};

FormFields.prototype = {
  fields: PropTypes.array,
  handleChange: PropTypes.func,
  selectedFields: PropTypes.array,
};

export default FormFields;
