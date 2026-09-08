import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGVSSections,
  // fetchGVSBrands,
  // fetchGVSModels,
  // fetchGVSOrifice,
  fetchGVSWorkflowRules,
  onUpdateGenericValveSizingModal,
  onUpdateFields,
  setGVSSectionBlocks,
  onUpdateSelectedFields,
  setPayloadData,
  setFocusedFieldName,
  setSelectedBrand,
  setSelectedModel,
  setSelectedOrifice,
} from "../store/slices/genericValveSizingSlice";
import {
  checkDefaultValue,
  checkMandatory,
  getDisplayUnit,
  getUOMKey,
} from "../utils/validation";
import { FIELD_SPLITTER } from "../utils/constants";
import { getUserPreference } from "./../utils/utility";
import useSaveSizing from "./useSaveSizing";
import { getSizingFields, getTargetFields } from "./../utils/validation";
import {
  mapFieldsWithDependencies,
  deepReplaceProperties,
  resetDependentFields,
} from "./../utils/utility";

const useGenericValveSizing = () => {
  const dispatch = useDispatch();
  const { handleSaveGVS } = useSaveSizing();
  const {
    gvsModal,
    gvsSections,
    gvsWorkflowRules,
    gvsPayloadData,
    gvsSelectedFields,
    gvsBrands,
    gvsModels,
    gvsOrifice,
    gvsSectionBlocks,
    error,
    focusedFieldName,
  } = useSelector((state) => state.genericValveSizing);
  const [errorMsg, setErrorMsg] = useState(null);
  const { preferences } = useSelector((state) => state.auth);
  const { units, defaultUnits } = useSelector((state) => state.uom);
  const [dataCollection, setDataCollection] = useState({});
  const [fieldsByLayoutIds, setFieldsByLayoutIds] = useState({});
  const { selectedWorkflow } = useSelector((state) => state.workflow);

  /**
   * Update sections and fecth API data
   */
  useEffect(() => {
    if (gvsSections && gvsSections.length === 0) {
      dispatch(fetchGVSWorkflowRules());
      dispatch(fetchGVSSections());
      // dispatch(fetchGVSBrands());
      // dispatch(fetchGVSModels());
      // dispatch(fetchGVSOrifice());
    }
  }, [dispatch]);

  /**
   * Configured GVS Dynamic Data
   */
  useEffect(() => {
    // console.log("GVS Dynamic Data", gvsBrands, gvsModels, gvsOrifice);
    setDataCollection({
      brands: gvsBrands,
      models: gvsModels,
      orifice: gvsOrifice,
    });
  }, [gvsBrands, gvsModels, gvsOrifice]);

  /**
   * Configured sections
   */
  useEffect(() => {
    if (!gvsSections || !gvsSections.length) return;
    configureSectionBlocks();
  }, [gvsSections, selectedWorkflow]);

  /**
   * Re-update the section fields data to render the UI
   */
  useEffect(() => {
    if (!gvsSections || !gvsSections.length) return;
    let tmpFieldsByLayoutIds = {};
    gvsSectionBlocks.forEach((section) => {
      const displayItems = configuredOptions(section);
      let sectionData = getSizingFields(
        section.displayType,
        displayItems,
        gvsSelectedFields,
        gvsPayloadData,
        defaultUnits,
        error,
        focusedFieldName,
        units,
        preferences
      );
      sectionData = mapFieldsWithDependencies(dataCollection, sectionData);
      tmpFieldsByLayoutIds[section.blockRefId] = sectionData;
    });
    setFieldsByLayoutIds(tmpFieldsByLayoutIds);
  }, [
    dispatch,
    gvsSelectedFields,
    units,
    focusedFieldName,
    dataCollection,
    gvsSectionBlocks,
  ]);

  /**
   * Trigger: Confgiure payload data
   */
  useEffect(() => {
    // TODO: Temporialy Disabled: The reason when ever re-open the popup the selected values are disappered.
    setTimeout(() => configurePayloadData(), 1000);
  }, []);

  /**
   * Configure Payload Data
   */
  const configurePayloadData = () => {
    if (gvsSectionBlocks.length) {
      let generatePayloadData = {};
      gvsSectionBlocks.forEach((element) => {
        let fieldType;
        for (let field of element.fields) {
          fieldType = field?.type;

          let localFieldName = field?.fieldName?.split(FIELD_SPLITTER);
          if (fieldType === "radio") {
            if (
              field?.fieldList !== undefined &&
              field?.fieldList !== null &&
              field?.fieldList.length > 0
            ) {
              dispatch(
                onUpdateFields({
                  name: field?.fieldName,
                  value: field?.fieldList[0]?.fieldName,
                  mandatory: false,
                })
              );
            }
          }
          localFieldName?.forEach((fieldName, index) => {
            let defaultValue =
              fieldType === "radio"
                ? gvsPayloadData[field?.fieldGroupName]
                : gvsPayloadData[fieldName];
            let mandatory = checkMandatory(
              field?.mandatory,
              gvsSelectedFields,
              gvsPayloadData,
              element.fields,
              field
            );
            const conditionFlag = defaultValue === undefined ? true : false;
            if (conditionFlag) {
              let userPreference = getUserPreference(preferences);
              defaultValue = userPreference[fieldName]
                ? userPreference[fieldName]
                : checkDefaultValue(
                    field.defaultValue,
                    gvsSelectedFields,
                    field,
                    fieldName,
                    gvsPayloadData,
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
                  ? defaultValue[fieldName]
                  : defaultValue;
              if (
                fieldName !== "%" &&
                field?.type !== "label" &&
                field?.type !== "radio"
              ) {
                const localmandatory =
                  typeof mandatory === "object"
                    ? mandatory[fieldName]
                    : mandatory;
                dispatch(
                  onUpdateFields({
                    name: fieldName,
                    value: localDefaultValue,
                    mandatory: localmandatory,
                  })
                );
              }
            }
          });
          //Below code is copied from useFormFields.js
          let uomFields = [];
          if (field?.type === "multiInputUom") {
            let localField = field?.fieldList[0];
            if (Array.isArray(localField.dimensionName)) {
              let localDimension = localField.dimensionName[0];
              let displayUnit;
              let unitValue;
              let key =
                localField?.DbUomFieldName !== undefined
                  ? localField?.DbUomFieldName
                  : getUOMKey(localDimension, field?.UomFieldName);
              //console.log(' In useFormField:: check UOM11 >>>>>>>>>>>> ',key,localField?.dimensionName,localField?.UomFieldName, localField?.DbUomFieldName)
              const verifyKey = gvsSelectedFields.find((f1) => f1.name === key);
              // console.log('In useFormField:: check UOM >>>>>>>>>>>> ',key,verifyKey)
              if (
                verifyKey === undefined ||
                verifyKey?.value === undefined ||
                verifyKey?.value === null ||
                verifyKey?.value === ""
              ) {
                // const localDimension=field?.dimensionName[0];
                displayUnit = getDisplayUnit(gvsSelectedFields);
                unitValue = defaultUnits[displayUnit][localDimension];
                uomFields.push({
                  name: key,
                  value: unitValue,
                  page: "useFormFields_dimensionName",
                });
                dispatch(
                  onUpdateFields({
                    name: key,
                    value: unitValue,
                    page: "useFormFields_dimensionName",
                  })
                );
              }
            }
          }
          if (
            field?.dimensionName !== undefined &&
            field?.dimensionName !== null &&
            field?.dimensionName !== ""
          ) {
            let key;
            if (Array.isArray(field?.dimensionName)) {
              let localDimension = field?.dimensionName[0];
              let displayUnit;
              let unitValue;
              key =
                field?.UomFieldName !== undefined
                  ? field?.UomFieldName
                  : getUOMKey(localDimension, field?.UomFieldName);
              // console.log(' In useFormField:: check UOM >>>>>>>>>>>> ',key,field?.dimensionName,field?.UomFieldName)

              const verifyKey = gvsSelectedFields.find((f1) => f1.name === key);
              // console.log('In useFormField:: check UOM >>>>>>>>>>>> ',key,verifyKey)
              if (
                verifyKey === undefined ||
                verifyKey?.value === undefined ||
                verifyKey?.value === null ||
                verifyKey?.value === ""
              ) {
                // const localDimension=field?.dimensionName[0];
                displayUnit = getDisplayUnit(gvsSelectedFields);
                unitValue = defaultUnits[displayUnit][localDimension];
                uomFields.push({
                  name: key,
                  value: unitValue,
                  page: "useFormFields_dimensionName",
                });
                dispatch(
                  onUpdateFields({
                    name: key,
                    value: unitValue,
                    page: "useFormFields_dimensionName",
                  })
                );
                // dispatch(onUpdatePayloadData({name:key,value:unitValue}))
              }
              // update DBUomFieldName
              let Dbkey = field?.DbUomFieldName;
              //console.log(' In useFormField:: check UOM >>>>>>>>>>>> ',field.fieldName, 'key', key,Dbkey,field?.UomFieldName,field?.DbUomFieldName)
              if (Dbkey !== undefined && Dbkey !== null && Dbkey !== "") {
                const verifyKey = gvsSelectedFields.find(
                  (f1) => f1.name === Dbkey
                );
                // console.log('In useFormField:: check UOM useFormFields_dimensionNameDb >>>>>>>>>>>> ',key,verifyKey, Dbkey, unitValue)
                if (
                  (verifyKey === undefined ||
                    verifyKey?.value === undefined ||
                    verifyKey?.value === null ||
                    verifyKey?.value === "") &&
                  unitValue !== undefined
                ) {
                  // const localDimension=field?.dimensionName[0];
                  uomFields.push({
                    name: Dbkey,
                    value: unitValue,
                    page: "useGenericSizing_dimensionNameDb",
                  });
                  dispatch(
                    onUpdateFields({
                      name: Dbkey,
                      value: unitValue,
                      page: "useGenericSizing_dimensionNameDb",
                    })
                  );
                  // dispatch(onUpdatePayloadData({name:key,value:unitValue}))
                }
              }
            } else {
              key =
                field?.UomFieldName !== undefined
                  ? field?.UomFieldName
                  : getUOMKey(localDimension, field?.UomFieldName);
              const verifyKey = gvsSelectedFields.find((f1) => f1.name === key);
              if (
                verifyKey === undefined ||
                verifyKey?.value === undefined ||
                verifyKey?.value === null ||
                verifyKey?.value === ""
              ) {
                const displayUnit = getDisplayUnit(gvsSelectedFields);
                const unitValue =
                  defaultUnits[displayUnit][field?.dimensionName];
                uomFields.push({
                  name: key,
                  value: unitValue,
                  page: "useGenericSizing_dimensionName 2",
                });
                dispatch(
                  onUpdateFields({
                    name: key,
                    value: unitValue,
                    page: "useGenericSizing_dimensionName 2",
                  })
                );
                // dispatch(onUpdatePayloadData({name:key,value:unitValue}))
              }
            }
          }
        }
      });
    }
  };

  /**
   * Map the each sections fields to unique object key
   */
  const configureSectionBlocks = () => {
    let tempSectionBlocks = [];
    gvsSections.forEach((section, parentIdx) => {
      const blockLen = section?.blocks?.length;
      const subSectionLen = section?.subSections?.length;
      if (blockLen) {
        section?.blocks.forEach((block, blockIdx) => {
          const clonedBlock = { ...block };
          clonedBlock["blockRefId"] = "section_" + parentIdx + "_" + blockIdx;
          tempSectionBlocks.push(clonedBlock);
        });
      }
      if (subSectionLen) {
        section?.subSections?.forEach((subSection, subSectionIdx) => {
          const sgcLen = subSection?.gridContainer?.children?.length;
          const unqId = "section_" + parentIdx + "_child_" + subSectionIdx;
          if (sgcLen) {
            subSection?.gridContainer?.children?.forEach((child, childIdx) => {
              child?.blocks?.forEach((block, blockIdx) => {
                const clonedBlock = { ...block };
                clonedBlock["blockRefId"] =
                  unqId + "_" + childIdx + "_" + blockIdx;
                tempSectionBlocks.push(clonedBlock);
              });
            });
          }
        });
      }
    });
    tempSectionBlocks = configureWorkflowRules(tempSectionBlocks);
    dispatch(setGVSSectionBlocks(tempSectionBlocks));
  };

  /**
   * Configure / Apply Workflow Rules to Fields
   * @param {*} tempSectionBlocks
   * @returns
   */
  const configureWorkflowRules = (tempSectionBlocks) => {
    let selWorkflow = selectedWorkflow || 1;
    for (let key in tempSectionBlocks) {
      if (tempSectionBlocks.hasOwnProperty(key)) {
        tempSectionBlocks[key].fields = tempSectionBlocks[key].fields.map(
          (field) => {
            const workflowField =
              gvsWorkflowRules[`workflow_${selWorkflow}`]?.[field.fieldName];
            if (workflowField) {
              return deepReplaceProperties(workflowField, field);
            }
            return field;
          }
        );
      }
    }
    return tempSectionBlocks;
  };

  /**
   * Configure field options values and updating fields
   * @param {*} sections
   * @returns
   */
  const configuredOptions = (sections) => {
    const updatedSection = sections?.fields?.map((field) => {
      if (
        field?.dimensionName !== undefined &&
        field?.dimensionName !== null &&
        field?.dimensionName !== ""
      ) {
        let options = [];
        if (typeof field?.dimensionName === "object") {
          field?.dimensionName.forEach((item) => {
            const localUnits = units[item];
            let localOptions = [];
            if (localUnits) {
              localUnits?.forEach((unit) => {
                localOptions.push({
                  label: unit.UnitName,
                  value: unit.UnitKey,
                  ...unit,
                });
              });
              localOptions.sort((a, b) => {
                return a?.UnitName.localeCompare(b?.UnitName, undefined, {
                  sensitivity: "base",
                });
              });
            } else {
              localOptions.push({ label: item, value: item });
            }
            options =
              options?.length > 0
                ? [
                    ...options,
                    { label: DIMENSION_SEPARATOR, value: item },
                    ...localOptions,
                  ]
                : [...options, ...localOptions];
          });
        } else {
          const localUnits = units[field?.dimensionName];
          options = localUnits?.map((unit) => {
            return { label: unit.UnitName, value: unit.UnitKey, ...unit };
          });
          options.sort((a, b) => {
            return a?.UnitName.localeCompare(b?.UnitName, undefined, {
              sensitivity: "base",
            });
          });
        }

        return {
          ...field,
          options: options,
        };
      } else {
        return field;
      }
    });
    let displayItems = updatedSection.reduce((acc, field) => {
      if (field.fieldGroupType !== undefined) {
        const key = `${field.fieldGroupType}-${field.fieldGroupName}`;
        if (!acc[key]) {
          acc[key] = {
            fieldName: field.fieldGroupName,
            type: field?.type,
            defaultValue: field.defaultValue,
            disabled: field.disabled,
            visible: field?.visible,
            hideFromSideBar: field?.hideFromSideBar,
            infoText: "",
            grid: field?.grid,
            gridDirection: field?.gridDirection,
            gridTemplateColumns: field?.gridTemplateColumns,
            fieldList: [],
            fieldGroupType: field.fieldGroupType,
            fieldGroupLabel: field.fieldGroupLabel,
            defaultSelected: field.defaultSelected,
            onBlurAction: field?.onBlurAction,
            onchangevalidation: field?.onchangevalidation,
          };
        }
        let fieldName = field?.fieldName?.split(FIELD_SPLITTER);
        let value = {};
        let fieldGroup = "";

        if (fieldName.length > 1) {
          fieldName.forEach((item) => {
            if (item !== undefined && item !== "") {
              value[item] = gvsPayloadData[item];
            }
            fieldGroup += `${item}`;
          });
        } else {
          value = field.fieldName;
          fieldName = field.fieldName;
          fieldGroup = field.fieldName;
        }
        acc[key].fieldList.push({
          ...field,
          fieldGroup: fieldGroup,
          fieldName: fieldName,
          value: field.fieldName,
          selectedValue: field?.fieldName,
          inputValue: field?.inputValue,
          inputLabel: field.label,
        });
      } else if (field.type === "select") {
        acc[field.fieldName] = {
          ...field,
          value: field.defaultValue,
        };
      } else {
        acc[field.fieldName] = field;
      }
      return acc;
    }, {});
    return Object.values(displayItems);
  };

  /**
   * Toggle model
   */
  const handleGenericValveSizing = () => {
    setErrorMsg();
    dispatch(onUpdateGenericValveSizingModal(!gvsModal));
  };

  /**
   * Calculate Dependent field value and update it.
   * @param {*} localItem
   */
  const calculateFieldValues = (localItem) => {
    if (gvsSectionBlocks && gvsSectionBlocks?.length) {
      gvsSectionBlocks.forEach((section) => {
        const defaultValueFields = getTargetFields(
          section.fields,
          "defaultValue",
          localItem.name,
          localItem.value,
          gvsSelectedFields,
          gvsPayloadData,
          units,
          null,
          focusedFieldName,
          "useTabPanel",
          preferences
        );
        defaultValueFields.forEach((field) => {
          if (!field?.nextRound) {
            dispatch(onUpdateFields({ name: field.name, value: field.value }));
          }
        });
      });
    }
  };

  /**
   * Handle input methods changes
   * @param {*} item
   */
  const handleChange = (item) => {
    const updatedField = { fieldName: item.name, value: item.value };
    // const updatedSelectedFields = resetDependentFields(updatedField);
    const updatedSelectedFields = resetDependentFields(
      gvsSelectedFields,
      updatedField,
      fieldsByLayoutIds
    );
    // dispatch(onUpdateSelectedFields(updatedSelectedFields));
    dispatch(onUpdateFields({ ...item, uomData: { units, defaultUnits } }));
    if (item?.name === "ManufacturerORBrand") {
      dispatch(setSelectedBrand(item));
      dispatch(
        onUpdateFields({
          name: "Model",
          value: "",
          page: "useGenericValveSizing-BrandChange",
        })
      );
      dispatch(
        onUpdateFields({
          name: "Orifice",
          value: "",
          page: "useGenericValveSizing-BrandChange",
        })
      );
    }
    if (item?.name === "Model") {
      dispatch(setSelectedModel(item));
      dispatch(
        onUpdateFields({
          name: "Orifice",
          value: "",
          page: "useGenericValveSizing-ModelChange",
        })
      );
    }
    if (item?.name === "Orifice") {
      dispatch(
        setSelectedOrifice({ ...item, uomData: { units, defaultUnits } })
      );
    }
    calculateFieldValues(item);
  };

  const handleBlur = (e, newValue) => {
    console.log("handleBlur", e, newValue);
  };

  /**
   * Handle focus field
   * @param {*} fieldName
   */
  const handleFocusedFieldName = (fieldName) => {
    dispatch(setFocusedFieldName(fieldName));
  };

  /**
   * Submit GVS
   */
  const submitSaveGVS = () => {
    handleSaveGVS();
  };

  return {
    handleGenericValveSizing,
    handleChange,
    handleBlur,
    handleFocusedFieldName,
    submitSaveGVS,
    errorMsg,
    fieldsByLayoutIds,
    focusedFieldName,
  };
};
export default useGenericValveSizing;
