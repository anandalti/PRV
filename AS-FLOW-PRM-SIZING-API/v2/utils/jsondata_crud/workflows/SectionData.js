const WorkflowSectionDetails = require("../../../models/WorkflowSection/WorkflowSectionDetails");
const {createFields, deleteFields} = require("./FieldData");


async function getWorkflowSections(workflowId) {
  try {
    const sections = await WorkflowSectionDetails.getWorkflowSectionsByWorkflowId(workflowId);
    return sections;
  } catch (err) {
    console.error('Error fetching workflow sections:', err);
    throw err;
  }
}

async function getAllWorkflowSections() {
  try {
    const sections = await WorkflowSectionDetails.getAllWorkflowSections();
    return sections;
  } catch (err) {
    console.error('Error fetching all workflow sections:', err);
    throw err;
  }
}

async function createSections(workflowId, sections) {
  
  try {
    for (const section of sections) {
        const sectionData = {
            WorkflowId: workflowId,
            SectionName: section.sectionName,
            SectionLabel: section.sectionLabel,
            DisplayType: section.displayType,
            DisplayOrder: section.displayOrder
        };
        const insertedSection = await WorkflowSectionDetails.createWorkflowSections(sectionData);
        const sectionId = insertedSection.SectionId;
        await createFields({ workflowId, SectionId: sectionId }, section.fields);
        
    }
    console.info('Sections created successfully for workflowId:', workflowId);
    // return true;
  } catch (err) {
    console.error('Error creating sections:', err);
    throw err;
  }
}

const deleteSections = async (workflowId) => {
  try {
    const WorkflowSections = await WorkflowSectionDetails.getWorkflowSectionsByWorkflowId(workflowId);
    for (const section of WorkflowSections) {
      await deleteFields(section.SectionId);
    }
    await WorkflowSectionDetails.deleteWorkflow(workflowId);
    console.log('Sections deleted successfully.');
  } catch (err) {
    console.error('Error deleting sections:', err);
  }
}

module.exports = {createSections, deleteSections, getWorkflowSections, getAllWorkflowSections};
