import { useDispatch, useSelector } from "react-redux";
import {
  checkDefaultValue,
  checkHideinSidebar,
  checkLabelValue,
  checkMandatory,
  getDisplayUnit,
  getUOMKey,
  getTargetFields,
  CheckUsCustomary,
} from "../utils/validation";
// import { onUpdatePayloadData } from "../store/slices/workflowPayloadSlice";
import {
  onUpdateError,
  onUpdateFields,
  updateIsWorkflowChange,
} from "../store/slices/workflowSlice";
import {
  CALC_METRIC_WF,
  DECIMAL_PRECISION,
  DISPLAY_NUMBER_UPTO_7DECIMALS,
  FIELD_SPLITTER,
  LABEL_SPLITTER,
  NumberDisplayTypes,
} from "../utils/constants";
import { getUserPreference, validateNaN } from "../utils/utility";
import {
  setActivateResults,
  updateNavigationMenu,
} from "../store/slices/navigationSlice";
import { useEffect, useRef, useState } from "react";
import { isArray } from "mathjs";
// import { useEffect } from "react";

const useTabSelection = (tabIndex) => {
  const dispatch = useDispatch();
  const {
    error,
    selectedValveCategory,
    selectedFluidType,
    selectedWorkflow,
    selectedSizingMethodology,
    workflowSections,
    selectedFields,
    isWorkflowChange: isWorkflowChangeStore,
  } = useSelector((state) => state.workflow);
  const { payloadData } = useSelector((state) => state.workflowPayload);
  const { preferences } = useSelector((state) => state.auth);
  const { units, defaultUnits } = useSelector((state) => state.uom);
  const { focusedFieldName } = useSelector((state) => state.generic);
  const [isWorkflowChange, setIsWorkflowChange] = useState(
    isWorkflowChangeStore
  );
  const isVacuumOnly = useRef(payloadData["IsVacuumOnly"]);
  const isPressureOnly = useRef(payloadData["IsPressureOnly"]);
  const IsLiquidOnly = useRef(payloadData["IsLiquidOnly"]);
  const IsLiquid2 = useRef(payloadData["IsLiquid2"]);

  useEffect(() => {
    if (isVacuumOnly.current !== payloadData["IsVacuumOnly"]) {
      setIsWorkflowChange(true);
      isVacuumOnly.current = payloadData["IsVacuumOnly"];
    }
    if (isPressureOnly.current !== payloadData["IsPressureOnly"]) {
      setIsWorkflowChange(true);
      isPressureOnly.current = payloadData["IsPressureOnly"];
    }
    if (IsLiquidOnly.current !== payloadData["IsLiquidOnly"]) {
      setIsWorkflowChange(true);
      IsLiquidOnly.current = payloadData["IsLiquidOnly"];
    }
    if (IsLiquid2.current !== payloadData["IsLiquid2"]) {
      setIsWorkflowChange(true);
      IsLiquid2.current = payloadData["IsLiquid2"];
    }
  }, [payloadData["IsVacuumOnly"], payloadData["IsPressureOnly"], payloadData["IsLiquidOnly"], payloadData["IsLiquid2"]]);

  let tabValues;
  switch (tabIndex) {
    case 0: {
      tabValues = selectedValveCategory?.name;
      break;
    }
    case 1: {
      tabValues = selectedFluidType?.name;
      break;
    }
    case 2: {
      tabValues = selectedSizingMethodology?.name;
      break;
    }
    default:
      tabValues = {};
      if (workflowSections.length) {
        let uomConfiguredList = [];
        workflowSections.forEach((element) => {
          const localArray = [];
          let localVacuumArr = [[], []];
          let vacuumFlag = payloadData["IsVacuumOnly"];
          vacuumFlag = vacuumFlag === true ? true : false;
          let pressureFlag = payloadData["IsPressureOnly"];
          pressureFlag = pressureFlag === true ? true : false;
          let liquidFlag = payloadData["IsLiquidOnly"];
          liquidFlag = liquidFlag === true ? true : false;
          let liquid2Flag = payloadData["IsLiquid2"];
          liquid2Flag = liquid2Flag === true ? true : false;
          let MassFluxGasFlag = !payloadData["IsLiquidOnlyAtInlet"];
          let MassFluxLiquidFlag=true
          let isPopUpField = false;
          let fieldType;
          if (
            vacuumFlag ||
            (!vacuumFlag && element.sectionName !== "vacuumProperties") || liquid2Flag
          ) {
            // console.log('In use tabselection >>>>>>>>> ',element?.fields,element)
            for (let field of element?.fields) {
              fieldType = field?.type;
              isPopUpField = field?.isPopUpField ? field?.isPopUpField : false;
              let localFieldName = field?.fieldName?.split(FIELD_SPLITTER);
              if (fieldType === "radio" //|| fieldType === "radioInput"

              ) {
                if (
                  field?.fieldList !== undefined &&
                  field?.fieldList !== null &&
                  field?.fieldList.length > 0
                ) {
                  // dispatch(onUpdatePayloadData({name:field?.fieldName,value:field?.fieldList[0]?.fieldName}));
                  
                  dispatch(
                    onUpdateFields({
                      name: field?.fieldName,
                      value: field?.fieldList[0]?.fieldName,
                      mandatory: false,
                    })
                  );
                }
              }
              // console.log('localFieldName>>>>>>>>>>>>>>>>. ',localFieldName)

              localFieldName?.forEach((fieldName, index) => {
                if(fieldName !=='Blank'){
                  // console.log('fieldName >>>>>>>>>>>>>>>>. ',fieldName,index)
                const fieldVisible =
                  Array.isArray(field?.visible) && field?.visible?.length > 0
                    ? field?.visible[index]?.id === "IsVacuumOnly"
                      ? vacuumFlag
                      : field?.visible[index]?.id === "IsPressureOnly"
                      ? pressureFlag
                      : field?.visible[index]?.id === "IsLiquidOnly"
                      ? liquidFlag
                      : field?.visible[index]?.id === "IsLiquid2"
                      ? liquid2Flag
                      // : field?.visible[index]?.id === "IsLiquidOnlyAtInlet" && MassFluxGasFlag
                      // ? MassFluxGasFlag
                      // : field?.visible[index]?.id === "IsLiquidOnlyAtInlet" && MassFluxLiquidFlag
                      // ? MassFluxLiquidFlag
                      :field?.visible[index]?.value
                      ? field?.visible[index]?.value
                      : undefined
                    : field.type === "label"
                    ? false
                    : undefined;
                let fieldVisibleFlag =
                  fieldVisible === undefined || fieldVisible === null
                    ? true
                    : fieldVisible
                    ? true
                    : false;

                let defaultValue =
                  fieldType === "radio" //|| fieldType === "radioInput"
                    ? payloadData[field?.fieldGroupName]
                    : payloadData[fieldName];
                // let unitName;
                let hideSidebar =
                  field?.hideFromSideBar === undefined
                    ? false
                    : checkHideinSidebar(
                        field?.hideFromSideBar,
                        selectedFields,
                        payloadData,
                        element.fields,
                        field
                      );
                // console.log('In sidebar >>>>>>>>. ',fieldName,hideSidebar,fieldVisibleFlag,defaultValue,payloadData[fieldName])

                if (!hideSidebar && fieldType !== "radio") {
                  let mandatory = checkMandatory(
                    field?.mandatory,
                    selectedFields,
                    payloadData,
                    element.fields,
                    field
                  );
                  const conditionFlag =
                    defaultValue === undefined ? true : false;
                  // console.log('In Nav field:defaultValue::: 11111 >>> ',conditionFlag,fieldName,defaultValue,payloadData[fieldName],isNaN(defaultValue))
                  if (conditionFlag) {
                    let userPreference = getUserPreference(preferences);
                    
                    defaultValue =
                      CALC_METRIC_WF.indexOf(selectedWorkflow) !== -1 &&
                      fieldName === "CalculationMethod"
                        ? checkDefaultValue(
                            field.defaultValue,
                            selectedFields,
                            field,
                            fieldName,
                            payloadData,
                            units
                          )
                        : userPreference[fieldName]
                        ? userPreference[fieldName]
                        : checkDefaultValue(
                            field.defaultValue,
                            selectedFields,
                            field,
                            fieldName,
                            payloadData,
                            units
                          );
                    if (defaultValue === undefined || defaultValue === null) {
                      defaultValue = "";
                    } else if (
                      typeof defaultValue === "object" &&
                      defaultValue !== null &&
                      Object.keys(defaultValue).length === 0
                    ) {
                      defaultValue = "";
                    }
                    let localDefaultValue =
                      typeof defaultValue === "object"
                        ? defaultValue[fieldName]??''
                        : defaultValue;
                    // localDefaultValue=field?.type=='number' && (localDefaultValue=='Infinity' || localDefaultValue== undefined)?'':localDefaultValue;
                    if (
                      fieldName !== "%" &&
                      field?.type !== "label" &&
                      field?.type !== "radio" //&& field?.type !== "radioInput"
                    ) {
                      const localmandatory =
                        typeof mandatory === "object"
                          ? mandatory[fieldName]
                          : mandatory;
                          // console.log('In useTabSelection >>>>>>>>>>>>>>>>> ',field?.type,fieldName,localDefaultValue,localmandatory)
                      dispatch(
                        onUpdateFields({
                          name: fieldName,
                          value: localDefaultValue,
                          mandatory: localmandatory,
                        })
                      );
                    
                    }
                    // console.log('fieldName 2222 >>>>>>>>>>>>>>>>. ',fieldName,defaultValue,localDefaultValue,mandatory)
                    fieldVisibleFlag =
                      fieldName === "IsPressureOnly" && defaultValue === true
                        ? true
                        : fieldName === "IsLiquidOnly" && defaultValue === true
                        ? true
                        :fieldVisibleFlag;
                  }
                  // console.log('In Nav field:fieldVisibleFlag::: 11111 >>> ',fieldName,fieldVisibleFlag,defaultValue)
                  if (fieldVisibleFlag) {
                    if (NumberDisplayTypes.indexOf(field?.type) !== -1) {
                      if (
                        DISPLAY_NUMBER_UPTO_7DECIMALS &&
                        defaultValue !== "" &&
                        defaultValue !== null &&
                        defaultValue !== undefined
                      ) {
                        defaultValue = validateNaN(
                          defaultValue,
                          fieldName,
                          DECIMAL_PRECISION
                        );
                      }
                    }
                    if (field?.dimensionName !== "") {
                      let dimensionName = Array.isArray(field?.dimensionName)
                        ? field?.dimensionName[0]
                        : field?.dimensionName;
                      const uomKey =
                        field?.UomFieldName !== undefined
                          ? field?.UomFieldName
                          : getUOMKey(dimensionName, field?.UomFieldName);
                      let unitValue = payloadData[uomKey];
                      if (
                        unitValue === undefined ||
                        unitValue === null ||
                        unitValue === ""
                      ) {
                        let userPreference = getUserPreference(preferences);
                        unitValue = userPreference[uomKey];
                      }
                      //userPreference[fieldName]
                      if(uomKey !== undefined ){
                        if (dimensionName !== "%") {
                          let unitName;
                          // console.log('In useFormField:: check UOM ::: UseTabSelection >>>>>>>>>>>> ',unitValue)
                          if (unitValue === undefined) {
                            let displayUnit = getDisplayUnit(selectedFields);
                            unitValue = defaultUnits[displayUnit][dimensionName];
                            unitValue =
                              unitValue?.value === undefined || unitValue?.value === null
                                ? unitValue
                                : unitValue?.value;
                            unitName = units[dimensionName]?.find(
                              (item) => item.UnitKey === unitValue
                            )?.UnitName;
                          } else {
                            unitValue =
                              unitValue?.value === undefined || unitValue?.value === null
                                ? unitValue
                                : unitValue?.value;
                            // console.log(uomKey,unitValue)
                            dimensionName = unitValue===undefined?"":(
                              typeof unitValue === "object"
                                ? unitValue?.value?.split(".")[0]
                                : unitValue?.split(".")[0]
                            );
                            dimensionName =
                              dimensionName == "temp"
                                ? "temperature"
                                : dimensionName;
                            unitName = units[dimensionName]?.find(
                              (item) => item.UnitKey === unitValue
                            )?.UnitName;
                          }
                          if (
                            defaultValue !== "" &&
                            unitName !== undefined &&
                            unitName !== null &&
                            unitName !== ""
                          ) {
                            defaultValue = `${defaultValue} ${unitName}`;
                          }

                          // console.log('In form field ::: units::11111 >>>>>>>>>>>>>> ',field.fieldName,field.dimensionName,unitName,unitValue,defaultValue)
                        } else if (dimensionName === "%" && defaultValue !== "") {
                          defaultValue = `${defaultValue}${dimensionName}`;
                        }
                      }
                      // console.log('In form field ::: dimensionName::: 222222 >>>>>>>>>> ',field.fieldName,field?.dimensionName,unitValue,defaultValue)
                    }
                    const localLabelName =
                      typeof field?.label === "string"
                        ? field?.label?.split(FIELD_SPLITTER)
                        : checkLabelValue(
                            field?.label,
                            selectedFields,
                            payloadData,
                            field,
                            FIELD_SPLITTER
                          ); //field?.label?.split(FIELD_SPLITTER);
                    
                    const splittedLabelName =
                      typeof field?.label === "string"
                        ? field?.label?.split(LABEL_SPLITTER)
                        : checkLabelValue(
                            field?.label,
                            selectedFields,
                            payloadData,
                            field,
                            LABEL_SPLITTER
                          ); //field?.label?.split(LABEL_SPLITTER);
                    // console.log('In useTabSelection ::: >>>>>>> ',localLabelName,typeof localLabelName,splittedLabelName,typeof splittedLabelName)
                    let localLabel;
                    if (localLabelName?.length === 1) {
                      // localLabel=localFieldName?.length>1?fieldName.indexOf('Vacuum')!==-1?`${field.label} Vacuum`:field.label:field.label;

                      if (splittedLabelName?.length === localFieldName?.length) {
                        // console.log('In useTabSelection ::: 111111 >>>>>>> ',localLabelName,splittedLabelName)
                        if (splittedLabelName?.length > 1) {
                          // console.log('In useTabSelection ::: 1111 22222>>>>>>> ',localLabelName,splittedLabelName)
                          localLabel = splittedLabelName[index];
                        } else {
                          localLabel = localLabelName[0]; //field.label;
                        }
                      } else if (
                        splittedLabelName?.length !== localFieldName?.length
                      ) {
                        // console.log('In useTabSelection ::: 222222 >>>>>>> ',localLabelName,splittedLabelName)
                        if (
                          field?.sidebarlabel !== undefined &&
                          field?.sidebarlabel !== null
                        ) {
                          // console.log('In useTabSelection ::: 333333>>>>>>> ',localLabelName,splittedLabelName)
                          const sidebarLabel =
                            field?.sidebarlabel?.split(FIELD_SPLITTER);
                          if (sidebarLabel.length > 1) {
                            localLabel = sidebarLabel[index];
                          } else {
                            localLabel = fieldName;
                          }
                        } else if (splittedLabelName?.length > 1) {
                          // console.log('In useTabSelection ::: 4444444>>>>>>> ',localLabelName,splittedLabelName)
                          localLabel = splittedLabelName[index];
                        } else if (localLabelName.length > 1) {
                          // console.log('In useTabSelection ::: 88888 >>>>>>> ',localLabelName,splittedLabelName)
                          localLabel = localLabelName[index];
                        } else if (localLabelName?.length === 1) {
                          // console.log('In useTabSelection ::: 99999 >>>>>>> ',localLabelName,splittedLabelName)
                          localLabel = localLabelName[0];
                        }
                      } else if (splittedLabelName.length > 1) {
                        // console.log('In useTabSelection ::: 5555555>>>>>>> ',localLabelName,splittedLabelName)
                        localLabel = splittedLabelName[index];
                      } else if (localLabelName?.length > 1) {
                        localLabel = localLabelName[index];
                      } else if (localLabelName?.length === 1) {
                        localLabel = localLabelName[0];
                      }
                    } else if (localLabelName?.length > 1) {
                      // console.log('In useTabSelection ::: 6666666 >>>>>>> ',fieldName,localLabelName,splittedLabelName)
                      localLabel =
                       fieldName==="IsLiquidOnly"?
                        liquidFlag?"Liquid":""
                       :fieldName==="IsLiquid2"?
                        liquid2Flag?"Liquid 2":""
                       :fieldName === "IsPressureOnly"
                          ? pressureFlag
                            ? "Pressure"
                            : ""
                          : vacuumFlag
                          ? "Vacuum"
                          : "";
                    }
                    if (localFieldName.length > 1) {
                      if (pressureFlag && vacuumFlag) {
                        localLabel = localLabel;
                      } else if (pressureFlag) {
                        localLabel = pressureFlag ? localLabel : "";
                      } else if (vacuumFlag) {
                        localLabel = vacuumFlag ? localLabel : "";
                      }else if (liquidFlag && liquid2Flag) {
                        localLabel = localLabel;
                      } else if (liquidFlag) {
                        localLabel = liquidFlag ? localLabel : "";
                      } else if (liquid2Flag) {
                        localLabel = liquid2Flag ? localLabel : "";
                      }else if (MassFluxGasFlag) {
                        localLabel = MassFluxGasFlag ? localLabel : "";
                      }else if (MassFluxLiquidFlag) {
                        localLabel = MassFluxLiquidFlag ? localLabel : "";
                      } else {
                        localLabel = "";
                      }
                      // localLabel=pressureFlag && vacuumFlag?localLabel:pressureFlag?'Pressure':vacuumFlag?'Vacuum':localLabel;
                    }

                    let errorFlag = false;
                    // console.log('In useTabSelection:: error >>>>>>>>>>>>>>>>>>> ',fieldName,error,errorFlag)
                    if (
                      error !== undefined &&
                      error !== null &&
                      error?.length > 0
                    ) {
                      const localError = error?.find(
                        (item) =>
                          item?.name == fieldName &&
                          item?.value?.error?.type == "error"
                      );
                      errorFlag = localError !== undefined ? true : false;
                    }
                    defaultValue = CheckUsCustomary(fieldName, defaultValue);
                    // console.log('error >>>>>>>>>>> ',fieldName,error,errorFlag)
                    if (localFieldName.length > 1 && pressureFlag) {
                      // console.log('In Nav field:default Value 55555>>> ',conditionFlag,fieldName,defaultValue,mandatory,mandatory[fieldName])
                      const specialFlag =
                        localLabelName.length > 1 ? false : true;
                      const localObject = {
                        name: localLabel,
                        value: field?.type === "checkbox" ? "" : defaultValue,
                        mandatory: mandatory[fieldName],
                        specialFlag,
                        errorFlag,
                      };
                      // console.log('In Nav field:default Value 55555>>> ',localObject)
                      localVacuumArr[index] = [
                        ...localVacuumArr[index],
                        localObject,
                      ];
                    } else if (localFieldName.length > 1 && vacuumFlag) {
                      // console.log('In Nav field:default Value 55555>>> ',conditionFlag,fieldName,default Value,mandatory,mandatory[fieldName])
                      const specialFlag =
                        localLabelName.length > 1 ? false : true;
                      const localObject = {
                        name: localLabel,
                        value: field?.type === "checkbox" ? "" : defaultValue,
                        mandatory: mandatory[fieldName],
                        specialFlag,
                        errorFlag,
                      };
                      localVacuumArr[index] = [
                        ...localVacuumArr[index],
                        localObject,
                      ];
                    } else if (localFieldName.length > 1 && liquidFlag) {
                      // console.log('In Nav field:default Value 55555>>> ',conditionFlag,fieldName,default Value,mandatory,mandatory[fieldName])
                      const specialFlag =
                        localLabelName.length > 1 ? false : true;
                      const localObject = {
                        name: localLabel,
                        value: field?.type === "checkbox" ? "" : defaultValue,
                        mandatory: mandatory[fieldName],
                        specialFlag,
                        errorFlag,
                      };
                      localVacuumArr[index] = [
                        ...localVacuumArr[index],
                        localObject,
                      ];
                    } else if (localFieldName.length > 1 && liquid2Flag) {
                      // console.log('In Nav field:default Value 55555>>> ',conditionFlag,fieldName,default Value,mandatory,mandatory[fieldName])
                      const specialFlag =
                        localLabelName.length > 1 ? false : true;
                      const localObject = {
                        name: localLabel,
                        value: field?.type === "checkbox" ? "" : defaultValue,
                        mandatory: mandatory[fieldName],
                        specialFlag,
                        errorFlag,
                      };
                      localVacuumArr[index] = [
                        ...localVacuumArr[index],
                        localObject,
                      ];
                    } else if (field?.type === "checkbox") {
                      mandatory =
                        typeof mandatory === "object"
                          ? mandatory[fieldName]
                          : mandatory;
                      if (!isPopUpField) {
                        localArray.push({
                          name: localLabel,
                          value: defaultValue === true ? "Y" : "N",
                          mandatory,
                          errorFlag,
                        });
                      }
                    } else {
                      mandatory =
                        typeof mandatory === "object"
                          ? mandatory[fieldName]
                          : mandatory;
                      if (!isPopUpField) {
                        localArray.push({
                          name: localLabel,
                          value: defaultValue,
                          mandatory,
                          errorFlag,
                        });
                      }
                    }
                  }
                } else if (!hideSidebar) {
                  let localLabel = field?.fieldGroupName;
                  let errorFlag = false;
                  let localDefaultValue;
                  
                  if(defaultValue==undefined && fieldType==='radio' && field?.defaultValue==true){
                    // console.log('In Nav field:defaultValue::: 11111 >>> ',field,defaultValue,localLabel,localArray)
                    localDefaultValue=field?.fieldName;
                    dispatch(
                      onUpdateFields({
                        name: localLabel,
                        value: localDefaultValue,
                      })
                    );
                  }

                  
                  // const checkItem = localArray.find(
                  //   (item) => item.name === localLabel
                  // );
                  // if (checkItem === undefined) {
                  //   const radioValue = element.fields.find(
                  //     (item) => item.fieldName === localDefaultValue
                  //   );
                    
                  //   if (radioValue !== undefined) {
                  //     if (!isPopUpField) {
                  //       localArray.push({
                  //         name: localLabel,
                  //         value: radioValue.label,
                  //         mandatory: false,
                  //         errorFlag,
                  //       });
                  //     }
                  //   }
                  // }
                }
              }
              });
            }
          }
          if (localVacuumArr.length > 0) {
            localVacuumArr.forEach((item) => {
              item.forEach((it) => {
                if (!isPopUpField) {
                  localArray.push({
                    name: it.name,
                    value: it.value,
                    mandatory: it.mandatory,
                    specialFlag: it.specialFlag,
                    errorFlag: it.errorFlag,
                  });
                }
              });
            });
          }
          // console.log('In useTab Selection >>>>>>>> ',localArray)
          tabValues[element.displayOrder] = localArray;
        });

        //validate fields data
        let menusArr = [];
        let localErrors = [];
        if (isWorkflowChange) {
          setIsWorkflowChange(false);
          setTimeout(() => {
            if (workflowSections.length > 0 && selectedFields.length > 0) {
              let SelectedfieldsData = {};
              selectedFields.forEach((item) => {
                SelectedfieldsData[item.name] = item.value;
              });
              // console.log('inside UseTabPanel >>>>111 SelectedfieldsData',SelectedfieldsData)
              workflowSections.forEach((sectionFields) => {
                if (sectionFields.fields) {
                  let errorType = "";
                  let isCompleted = !sectionFields.fields.some((field) => {
                    const validationFields = getTargetFields(
                      sectionFields.fields,
                      "validations",
                      field.fieldName,
                      SelectedfieldsData[field.fieldName],
                      selectedFields,
                      SelectedfieldsData,
                      units,
                      error,
                      focusedFieldName,
                      "useTabSelection",
                      null,
                      defaultUnits
                    );
                    // console.log('inside UseTabPanel >>>>111 validationFields ', validationFields, field.fieldName, SelectedfieldsData[field.fieldName])
                    if (validationFields.length > 0) {
                      errorType = validationFields.find(
                        (errorItem) => errorItem?.value?.error?.type === "error"
                      )
                        ? "error"
                        : "warning";
                      localErrors = [...localErrors, ...validationFields];
                      dispatch(onUpdateError(localErrors));
                      return errorType === "error";
                    } else {
                      return sectionFields.fields.some((field) => {
                        let fieldValue = SelectedfieldsData[field.fieldName];
                        let mandatory = checkMandatory(
                          field.mandatory,
                          selectedFields,
                          payloadData,
                          sectionFields.fields,
                          field
                        );
                        // console.log('inside useTabSelection >>>', mandatory)
                        if (typeof mandatory === "object") {
                          mandatory = mandatory[field.fieldName];
                        }
                        return (
                          (fieldValue === null ||
                            fieldValue === undefined ||
                            fieldValue === "") &&
                          mandatory === true
                        );
                      });
                      // return false;
                    }
                  });
                  // console.log('inside UseTabPanel >>>>111 error ',sectionFields.sectionLabel, isCompleted, errorType)
                  let menuItem = {
                    id: sectionFields.displayOrder,
                    name: sectionFields.sectionLabel,
                    isCompleted: isCompleted,
                    errorType: errorType,
                  };
                  // console.log('inside UseTabPanel >>>>111', menuItem)
                  menusArr.push(menuItem);
                }
              });
            } else {
              workflowSections.forEach((sectionFields) => {
                if (sectionFields.fields) {
                  let menuItem = {
                    id: sectionFields.displayOrder,
                    name: sectionFields.sectionLabel,
                    isCompleted: false,
                    errorType: "",
                  };
                  menusArr.push(menuItem);
                }
              });
            }

            const errorFlag = menusArr.find((menu) => !menu.isCompleted);
            // console.log('inside UseTabPanel >>>>2222', menusArr,errorFlag)
            if (errorFlag === undefined) {
              dispatch(setActivateResults(true));
              // console.log('inside UseTabPanel >>>>333', menusArr,errorFlag)
            }
            dispatch(updateNavigationMenu(menusArr));
            dispatch(updateIsWorkflowChange(false));
          }, 0);
        }
      }

      break;
  }

  return {
    tabValues,
  };
};

export default useTabSelection;
