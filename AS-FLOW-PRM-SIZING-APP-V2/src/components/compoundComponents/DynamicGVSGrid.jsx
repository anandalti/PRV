import React from "react";
import { Grid, Box, Typography } from "@mui/material";

import useGenericValveSizing from "../../hooks/useGenericValveSizing";
import FormFields from "./FormFields";
import { useSelector } from "react-redux";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  padding: theme.spacing(1),
  textAlign: "left",
}));

const DynamicGrid = () => {
  const {
    handleChange,
    handleBlur,
    handleFocusedFieldName,
    fieldsByLayoutIds,
    focusedFieldName,
  } = useGenericValveSizing();
  const { gvsSections, gvsSelectedFields, gvsPayloadData, error } = useSelector(
    (state) => state.genericValveSizing
  );

  const findSectionFields = (blockRefId) => {
    return fieldsByLayoutIds[blockRefId] ?? [];
  };

  const renderBlocks = (blocks, parentIdx) => {
    if (!blocks || blocks.length === 0) return null;

    return blocks.map((block, blockIdx) => {
      if (block.fieldType === "FormFields") {
        const blockUniId = `${parentIdx}_${blockIdx}`;
        const secFields = findSectionFields(blockUniId);
        return (
          <Item
            className="testnn"
            key={`${parentIdx}_${blockIdx}`}
            {...block.itemProps}
          >
            <FormFields
              fields={secFields}
              selectedFields={gvsSelectedFields}
              selectedData={gvsPayloadData}
              error={error}
              focusedFieldName={focusedFieldName}
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleFocusedFieldName={handleFocusedFieldName}
              customStyle={block.customStyle}
              modal={"gvsModal"}
            />
          </Item>
        );
      }
      return null;
    });
  };

  const renderGridChildren = (children, parentIdx) => {
    if (!children || children.length === 0) return null;
    return children.map((child, index) => {
      const newParentIdx = `${parentIdx}_${index}`;
      return (
        <Grid item xs={child.gridProps?.xs || 12} key={`${parentIdx}_${index}`}>
          {child.blocks?.length > 0 && renderBlocks(child.blocks, newParentIdx)}
        </Grid>
      );
    });
  };

  const renderSubSections = (subSections, parentIdx) => {
    return subSections.map((subSection, index) => {
      const newParentIdx = `${parentIdx}_child_${index}`;
      const fieldset = subSection.fieldset || {};
      const gridContainer = subSection.gridContainer || {
        spacing: 2,
        children: [],
      };
      return (
        <Grid item xs={12} key={`${newParentIdx}`}>
          <Item {...subSection.itemProps}>
            <Box component="fieldset" sx={{ ...fieldset }}>
              <legend>{fieldset.legend}</legend>
              <Grid container spacing={gridContainer.spacing}>
                {renderGridChildren(gridContainer.children, newParentIdx)}
              </Grid>
            </Box>
          </Item>
        </Grid>
      );
    });
  };

  const renderSectionItem = (section, parentIdx) => {
    return (
      <>
        {section.fieldset && (
          <Box component="fieldset" sx={{ ...section.fieldset }}>
            <legend>{section.fieldset.legend}</legend>
            {section.blocks && renderBlocks(section.blocks, parentIdx)}
          </Box>
        )}
        {!section.fieldset &&
          section.blocks &&
          renderBlocks(section.blocks, parentIdx)}
      </>
    );
  };

  const renderSections = (data) => {
    return data.map((section, sectionIdx) => {
      const parentIdx = "section_" + sectionIdx;
      return (
        <Grid item {...section.gridProps} key={sectionIdx}>
          {section?.blocks &&
            section?.blocks?.length &&
            renderSectionItem(section, parentIdx)}
          {section?.subSections &&
            section?.subSections?.length &&
            renderSubSections(section?.subSections, parentIdx)}
        </Grid>
      );
    });
  };
  return (
    <Grid container spacing={3} sx={{ padding: 0 }} className="gvs-block">
      {renderSections(gvsSections)}
    </Grid>
  );
};

export default DynamicGrid;
