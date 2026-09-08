const fs = require('fs');
const path = require('path');

const SectionFieldDetails = require("../../../models/WorkflowSection/SectionFieldDetails");
const { getSubFieldsData, getExpressionCheckFlag, SectionVIII_WF } = require("../../helper");
const { deleteApiCallAction, createApiCallAction } = require("./FieldApiCallActionData");
const { deleteDefaultValues, createDefaultValue } = require("./FieldDefaultValueData");
const { deleteDisabled, createDisabled } = require("./FieldDisabledData");
const { createError } = require("./FieldErrorsData");
const { deleteExpressionsByFieldId } = require("./FieldExpressionData");
const { deleteGroupValues, createGroupValues } = require("./FieldGroupData");
const { deleteHideFromSideBar, createHideFromSideBar } = require("./FieldHiddenInSidebarData");
const { deleteMandatory, createMandatory } = require("./FieldMandatoryData");
const { deleteOptions, createOptions } = require("./FieldOptionsData");
const { deleteValidations, createValidations } = require("./FieldValidationData");
const { deleteVisible, createVisible } = require("./FieldVisibleData");


async function getSectionFieldsBySectionId(SectionId) {
  try {
    const fields = await SectionFieldDetails.getAllSectionFieldsBYSectionId(SectionId);
    let localFields=[...fields]
    
    return localFields;
  } catch (error) {
    console.error('Error fetching section fields:', error);
    throw error;
  }
}

async function getAllSectionAllFields() {
  try {
    const fields = await SectionFieldDetails.getAllSectionAllFields();
    let localFields=[...fields]
    
    return localFields;
  } catch (error) {
    console.error('Error fetching section fields:', error);
    throw error;
  }
}



async function createFields(sectionField, fields) {
  
  try {
    for (const field of fields) {
      const { fieldName, label, type, fieldDisplayOrder, dimensionName, infoText, grid, regex, style, fieldGroupType, fieldGroupName, defaultSelected, UomFieldName, fieldBlankMessage, gridSection, action } = field;
      const { validations, mandatory, defaultValue, disabled, visible, hideFromSideBar, options, calculateFields:apiCallAction } = field;
      let ActiveValidations =[];
      if(validations?.length>0){
        // ActiveValidations = [...validations];
        validations?.forEach((validation) => {
          if(validation?.fileName !== undefined){
            const validationFilePath = path.join(__dirname, `../../../data/${validation.fileName}`);
            let validationData = fs.readFileSync(validationFilePath, 'utf8');
             validationData = JSON.parse(validationData.replace(/^\uFEFF/, ''));
            if(SectionVIII_WF.includes(sectionField.workflowId)){
              validation?.fieldNames?.forEach((fName) => {
                validationData?.forEach((validationItem) => {
                  if(validation?.currentId === fieldName){
                    if(validation?.SizingBasis === 'ALL' || (validation?.SizingBasis === 'Fire Case' && validationItem?.target?.IsFireCase === true)){
                      const localValItem = {
                        ...validationItem,
                        target: {
                          ...validationItem.target,
                          id: fName,
                          focusedField: fName,
                          currentId: fieldName
                        }
                      }
                      ActiveValidations.push(localValItem);
                    }
                  }
                });
              });
            }
          }else{
            ActiveValidations.push(validation);
          }
        });
      }
      console.log('>>>>>>>>>>>>>>>>>>> ',fieldName,ActiveValidations?.length);
      const localDimensionNames = Array.isArray(dimensionName) ? dimensionName.join(',') : dimensionName;
      const isValidationRequired = Array.isArray(ActiveValidations) && ActiveValidations.length > 0;
      const IsApiCallActionRequired = apiCallAction!==undefined && Array.isArray(apiCallAction) && apiCallAction.length > 0;
      const IsFieldBlankMessage = fieldBlankMessage ? true : false;
      const localUOMFieldName = dimensionName?.indexOf('%') === -1 && UomFieldName ? UomFieldName : null;
      // console.log(localUOMFieldName,dimensionName,  fieldName)
      let fieldNames = fieldName.split('|');
      let fieldObjArray=[];
      let labels= typeof label==='object'?JSON.stringify(label):label;
      labels=labels.split('|');
      // fieldNames.forEach((fieldNameVal, index) => {
        
        // Insert field
        const fieldData = {
          WorkflowId: sectionField.workflowId,
          SectionId: sectionField.SectionId,
          FieldName: fieldName.trim(),
          FieldLabel: label, //labels[index] ? labels[index].trim() : null,
          FieldType: type,
          FieldDisplayOrder: fieldDisplayOrder,
          IsValidationRequired: isValidationRequired,
          DimensionName: localDimensionNames || null,
          InfoText: infoText || null,
          Grid: grid || null,
          Regex: regex || null,
          Style: style || null,
          UomFieldName: localUOMFieldName || null,
          IsFieldBlankMessage: IsFieldBlankMessage,
          GridSection: gridSection || null,
          FieldAction: action || null
        };
        fieldObjArray.push(fieldData);

      // });
      // if(fieldObjArray?.length>1){
      //   console.log('>>>>>>>>>>>>>>>>>>> ',fieldObjArray)
      // }
      const insertedFields = await SectionFieldDetails.createSectionField(fieldObjArray);
      let fieldIds = insertedFields.map(field => ({FieldId: field.FieldId, FieldName: field?.FieldName}));
      // console.log('In field >>>>>>>>>>> ',fieldName,fieldIds,isValidationRequired,ActiveValidations?.length,IsFieldBlankMessage);
      let localValidations=[];
      
      if(ActiveValidations?.length>0){
        // if(insertedFields?.length>1){
          insertedFields?.forEach(({FieldId,FieldName}) => {
            ActiveValidations?.forEach((validation) => {
              const { target, message } = validation;
              if(fieldNames?.length>1){
                
                // let localFieldName=fieldNames.find(name=>name.trim()===FieldName);
                fieldNames?.forEach(localFieldName=>{
                  // console.log('localFieldName >>>>>>>>> ',localFieldName);
                  if(localFieldName !==undefined && target?.currentId===localFieldName){
                    localValidations.push({ target, message,localFieldName,FieldId });
                  }
                })
                
              }else if(target?.currentId===FieldName){
                  localValidations.push({ target, message,FieldName,FieldId });
              }
            });
          });
        // }else{
        //   insertedFields?.forEach(({FieldId,FieldName}) => {
        //     validations?.forEach((validation) => {
        //       const { target, message } = validation;
        //       localValidations.push({ target, message,FieldName,FieldId });
        //     });
        //   });
        // }
      }
      // fieldIds.forEach(({FieldId, FieldName}, index) => {
        // // Insert validations if any
      if (isValidationRequired) {
          await createValidations(fieldIds, localValidations);
      }

      if(IsFieldBlankMessage){
        const errorIds = insertedFields.map(({FieldId}) => ({fieldId:FieldId, ErrorId: `FIELD_BLANK_${FieldId}`, type: fieldBlankMessage?.type, message: fieldBlankMessage?.message, dynamic: fieldBlankMessage?.dynamic || false}));
        await createError(errorIds);
      }
      // let ExpressioncheckFlag ={};
      // let ExpressioncheckFlag = getExpressionCheckFlag(defaultValue,fieldNames) //Array.isArray(defaultValue) && defaultValue?.length>0;
      const localDefaultValues=getSubFieldsData(insertedFields, defaultValue, fieldNames);
      // console.log('Default Values >>>>>>>>> ',localDefaultValues);
      await createDefaultValue(localDefaultValues?.localFieldValues,localDefaultValues?.ExpressioncheckFlag);

      // ExpressioncheckFlag = Array.isArray(mandatory) && mandatory?.length>0;
      const localMandatoryValues=getSubFieldsData(insertedFields, mandatory, fieldNames);
      await createMandatory(localMandatoryValues?.localFieldValues,localMandatoryValues?.ExpressioncheckFlag);

      // // ExpresisoncheckFlag = Array.isArray(visible) && visible?.length>0;
      const localVisibleValues=getSubFieldsData(insertedFields, visible, fieldNames);
      await createVisible(localVisibleValues?.localFieldValues,localVisibleValues?.ExpressioncheckFlag);

      // // ExpresisoncheckFlag = Array.isArray(disabled) && disabled?.length>0;
      const localDisabledValues=getSubFieldsData(insertedFields, disabled, fieldNames);
      await createDisabled(localDisabledValues?.localFieldValues,localDisabledValues?.ExpressioncheckFlag);

      const IsHideFromSideBarRequired = hideFromSideBar!==undefined && hideFromSideBar !== null;
      if(IsHideFromSideBarRequired){
        // ExpresisoncheckFlag = Array.isArray(hideFromSideBar) && hideFromSideBar?.length>0;
        const localHideFromSideBar=getSubFieldsData(insertedFields, hideFromSideBar, fieldNames);
        await createHideFromSideBar(localHideFromSideBar?.localFieldValues,localHideFromSideBar?.ExpressioncheckFlag);
      }
      if(fieldGroupType && fieldGroupName){
          await createGroupValues(fieldIds, fieldGroupType, fieldGroupName, defaultSelected);
      }

      if(Array.isArray(options) && options.length > 0){
          await createOptions(fieldIds, options);
      }

      if(IsApiCallActionRequired){
          // Placeholder for apiCallAction insertion logic
          // console.log(' ApiCallAction 11111 >>>>>>>>> ', {insertedFields,apiCallAction,fieldNames})
          const localApiCallAction=getSubFieldsData(insertedFields, apiCallAction,fieldNames,IsApiCallActionRequired);
          // console.log(' ApiCallAction 22222 >>>>>>>>> ', {localApiCallAction})
          await createApiCallAction(localApiCallAction?.localFieldValues);
      }
    
    };
    console.log('Fields created successfully for section:', sectionField);
    return true;
  } catch (err) {
    console.error('Error creating fields:', err);
    throw err;
  }
}

const deleteFields = async (sectionId) => {
  try {
    const sectionFields = await SectionFieldDetails.getAllSectionFields(sectionId);
    for (const field of sectionFields) {
      // await SectionFieldDetails.deleteSectionField(field.FieldId);
      if(field.IsValidationRequired) {
        await deleteValidations(field.FieldId);
      }
      await deleteDefaultValues(field.FieldId);
      await deleteMandatory(field.FieldId);
      await deleteVisible(field.FieldId);
      await deleteDisabled(field.FieldId);
      await deleteGroupValues(field.FieldId);
      await deleteOptions(field.FieldId);
      await deleteApiCallAction(field.FieldId);
      await deleteHideFromSideBar(field.FieldId);
      await deleteExpressionsByFieldId(field.FieldId);
    }
    await SectionFieldDetails.deleteSectionField(sectionId);
    console.log('Fields deleted successfully.');
  } catch (err) {
    console.error('Error deleting fields:', err);
    throw err;
  }
}

module.exports = {createFields, deleteFields, getSectionFieldsBySectionId, getAllSectionAllFields};