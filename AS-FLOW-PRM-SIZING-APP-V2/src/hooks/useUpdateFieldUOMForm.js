import { useDispatch, useSelector } from "react-redux";
import { onUpdateFields } from "../store/slices/genericValveSizingSlice";
import { filterDimensionUnits } from "../utils/validation";
import { getConvertedValue } from "../utils/convertUnit";

const useUpdateFieldUOMForm = () => {
  const dispatch = useDispatch();
  const {
    gvsSelectedFields: selectedFields,
    gvsSectionBlocks,
    gvsPayloadData: payloadData,
  } = useSelector((state) => state.genericValveSizing);
  // const { payloadData } = useSelector(state => state.workflowPayload);
  const { units, defaultUnits } = useSelector((state) => state.uom);

  const updateFieldUOMForm = (item) => {
    dispatch(
      onUpdateFields({
        name: item.name,
        value: item.value,
        page: "updateFieldUOM 1",
      })
    );
    gvsSectionBlocks.forEach((section) => {
      section.fields.forEach((field) => {
        if (item?.name !== field?.UomFieldName) {
          return;
        } else {
          if (field?.dimensionName[0] !== "%") {
            let selField = selectedFields.filter(
              (e) => e.name == field.fieldName
            );
            if (selField.length) {
              const fieldValue = selField[0].value;
              if (fieldValue && !isNaN(fieldValue) && field?.dimensionName) {
                const { dimensionUnits, unitValue } = filterDimensionUnits(
                  defaultUnits,
                  selectedFields,
                  field.UomFieldName,
                  item.value,
                  fieldValue,
                  field?.dimensionName,
                  units
                );
                if (unitValue !== undefined && unitValue !== null) {
                  const newValue = getConvertedValue(
                    fieldValue,
                    unitValue,
                    field.fieldName,
                    item.value,
                    dimensionUnits,
                    units,
                    selectedFields,
                    payloadData
                  );
                  if (
                    field.fieldName !== undefined &&
                    field.fieldName !== null &&
                    field.fieldName !== "" &&
                    field.fieldName !== "%"
                  ) {
                    dispatch(
                      onUpdateFields({
                        name: field.fieldName,
                        value: newValue,
                        page: "updateFieldUOM 3",
                      })
                    );
                  }
                }
              }
            }
          }
          if (
            field.DbUomFieldName !== undefined &&
            field.UomFieldName === item.name &&
            field?.dimensionName[0] !== "%"
          ) {
            dispatch(
              onUpdateFields({
                name: field.DbUomFieldName,
                value: item.value,
                page: "updateFieldUOM 4",
              })
            );
          }
        }
      });
    });
  };
  return {
    updateFieldUOMForm,
  };
};

export default useUpdateFieldUOMForm;
