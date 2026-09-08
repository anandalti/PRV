import { useDispatch, useSelector } from "react-redux";
import LabeledDropdown from "../../../components/basicComponents/LabeledDropdown";
import {
  onUpdateFields,
  onUpdateListOfFields,
  onUpdateInfoError,
} from "../../../store/slices/workflowSlice";
import ResultsDisplay from "../../../components/compoundComponents/ResultsDisplay";
import SnakebarContent from "../../preference/Modal/SnakebarContent";
import useFormFields from "../../../hooks/useFormFields";
import Button from "../../../components/basicComponents/Button";
// import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import styles from "./../../../styles/Home.module.css";
import Fieldset from "../../../components/hoc/Fieldset";
import useSaveSizing from "../../../hooks/useSaveSizing";
import { useEffect, useMemo, useState } from "react";
import { validateMandatoryFields } from "../../../utils/validation";
import {
  onSelectMenu,
  setActivateResults,
} from "../../../store/slices/navigationSlice";
import TankDataModal from "../../../components/compoundComponents/TankDataModal";
import WorldMap from "../../../components/compoundComponents/WorldMap";
import SearchSizingModal from "../../../components/compoundComponents/SearchSizingModal";
import AlertModal from "../../../components/compoundComponents/AlertModal";
import ConfirmationModal from "../../../components/compoundComponents/ConfirmationModal";
import useTabPanel from "../../../hooks/useTabPanel";
import { API2000_WF, API2000FlowChangeConfirm, Orific_Filter_Column, OrificeDropdownOptions } from "../../../utils/constants";
import ProceedButton from "../../../components/basicComponents/ProceedButton";
import { setSelectedOrificeArea } from "../../../store/slices/workflowPayloadSlice";

const AdvancedViewLayout = () => {
  const {
    selectedFields,
    error,
    worldMapModal,
    searchSizingModal,
    resetSizingModal,
    EnterTankData,
    valveCategories,
    fluidTypes,
    sizingMethodologies,
    selectedValveCategory,
    selectedFluidType,
    selectedSizingMethodology,
    selectedWorkflow,
    workflowPopup,
    workflowSections
  } = useSelector((state) => state.workflow);
  const dispatch = useDispatch();
  const { handleSaveSizingData } = useSaveSizing();
  const { payloadData, sizingData,advViewResultDisplayFlag,flowCalcPopupSaved, selectedOrificeArea } = useSelector((state) => state.workflowPayload);
  const { menus = [], workflowMenus = [], activateResults, activeMenu } = useSelector((state) => state.navigation);
  const [loadFormFields, setLoadFormFields] = useState(false);

  // console.log("activateResults", activateResults);
  const { snakebar } = useSelector((state) => state.preference);
  const { handleChange: valveCategoryHandleChange } = useTabPanel(0);
  const { handleChange: fluidTypeHandleChange } = useFormFields(1);
  const { handleChange: sizingMethodologyHandleChange } = useFormFields(2);
  const { fieldData: applicationRequirementsFieldsData, ...arRest } =
    useFormFields(
      workflowMenus.find(({ name }) => name === "Application Requirements")
        ?.id - 1
    );
  const { fieldData: fluidPropertiesFieldsData, ...fluidRest } = useFormFields(
    workflowMenus.find(({ name }) => name === "Fluid Properties")?.id - 1
  );
  const { fieldData: temperaturePropertiesFieldsData, ...tempRest } =
    useFormFields(
      workflowMenus.find(({ name }) => name === "Temperature Properties")?.id -
        1
    );
  const { fieldData: pressurePropertiesFieldsData, ...pressureRest } =
    useFormFields(
      workflowMenus.find(({ name }) => name === "Pressure Properties")?.id - 1
    );
  const { fieldData: flowCapacityFieldsData, ...flowRest } = useFormFields(
    workflowMenus.find(({ name }) => name === "Flow Capacity")?.id - 1
  );
  const { fieldData: systemPressureFieldsData, ...systemPressureRest } =
    useFormFields(
      workflowMenus.find(({ name }) => name === "System Pressure")?.id - 1
    );
  const { fieldData: pressureCaseFieldsData, ...pressureCaseRest } =
    useFormFields(
      workflowMenus.find(({ name }) => name === "Pressure Case")?.id - 1
    );
  const { fieldData: vacuumCaseFieldsData, ...vacuumCaseRest } = useFormFields(
    workflowMenus.find(({ name }) => name === "Vacuum Case")?.id - 1
  );

  // const applicationRequirementsTabIndex = useMemo(
  //   () => workflowMenus.find(({ name }) => name === "Application Requirements")?.id - 1,
  //   [workflowMenus] // Only recompute when workflowMenus changes
  // );

  // const { fieldData: applicationRequirementsFieldsData, ...arRest } = useFormFields(
  //   applicationRequirementsTabIndex
  // );

  // const fluidPropertiesTabIndex = useMemo(
  //   () => workflowMenus.find(({ name }) => name === "Fluid Properties")?.id - 1,
  //   [workflowMenus] // Only recompute when workflowMenus changes
  // );

  // const { fieldData: fluidPropertiesFieldsData, ...fluidRest } = useFormFields(fluidPropertiesTabIndex);

  // const temperaturePropertiesTabIndex = useMemo(
  //   () => workflowMenus.find(({ name }) => name === "Temperature Properties")?.id - 1,
  //   [workflowMenus] // Only recompute when workflowMenus changes
  // );

  // const { fieldData: temperaturePropertiesFieldsData, ...tempRest } = useFormFields(
  //   temperaturePropertiesTabIndex
  // );

  // const pressurePropertiesTabIndex = useMemo(
  //   () => workflowMenus.find(({ name }) => name === "Pressure Properties")?.id - 1,
  //   [workflowMenus] // Only recompute when workflowMenus changes
  // );

  // const { fieldData: pressurePropertiesFieldsData, ...pressureRest } =
  //   useFormFields(pressurePropertiesTabIndex);

  // const flowCapacityTabIndex = useMemo(
  //   () => workflowMenus.find(({ name }) => name === "Flow Capacity")?.id - 1,
  //   [workflowMenus] // Only recompute when workflowMenus changes
  // );

  // const { fieldData: flowCapacityFieldsData, ...flowRest } = useFormFields(flowCapacityTabIndex);

  // const systemPressureTabIndex = useMemo(
  //   () => workflowMenus.find(({ name }) => name === "System Pressure")?.id - 1,
  //   [workflowMenus] // Only recompute when workflowMenus changes
  // );

  // const { fieldData: systemPressureFieldsData, ...systemPressureRest } =
  //   useFormFields(systemPressureTabIndex);

  // const pressureCaseTabIndex = useMemo(
  //   () => workflowMenus.find(({ name }) => name === "Pressure Case")?.id - 1,
  //   [workflowMenus] // Only recompute when workflowMenus changes
  // );

  // const { fieldData: pressureCaseFieldsData, ...pressureCaseRest } = useFormFields(pressureCaseTabIndex);

  // const vacuumCaseTabIndex = useMemo(
  //   () => workflowMenus.find(({ name }) => name === "Vacuum Case")?.id - 1,
  //   [workflowMenus, menus] // Only recompute when workflowMenus changes
  // );

  // const { fieldData: vacuumCaseFieldsData, ...vacuumCaseRest } = useFormFields(vacuumCaseTabIndex, menus);

  useEffect(() => {
    const allItems = [
      ...applicationRequirementsFieldsData,
      ...fluidPropertiesFieldsData,
      ...temperaturePropertiesFieldsData,
      ...pressurePropertiesFieldsData,
      ...flowCapacityFieldsData,
      ...systemPressureFieldsData,
      ...pressureCaseFieldsData,
      ...vacuumCaseFieldsData,
    ];
    const { mandatoryFlag, errorType } = validateMandatoryFields(
      allItems,
      selectedFields,
      payloadData,
      [],
      null,
      "Advance"
    );
    // console.log(`In Advance view >>>>>>>>>.activeMenu:: ${activeMenu} mandatoryFlag:: ${mandatoryFlag}, >>>> errorType::: ${errorType}  >>>>>>> activateResults:: ${activateResults}`);
    if (mandatoryFlag && errorType !== "error") {
      dispatch(setActivateResults(mandatoryFlag));
    } else {
      dispatch(setActivateResults(false));
    }
  }, [
    applicationRequirementsFieldsData,
    fluidPropertiesFieldsData,
    temperaturePropertiesFieldsData,
    pressurePropertiesFieldsData,
    flowCapacityFieldsData,
    systemPressureFieldsData,
    pressureCaseFieldsData,
    vacuumCaseFieldsData,
  ]);

  useEffect(() => {
    if (
      selectedValveCategory?.id &&
      selectedFluidType?.id &&
      selectedSizingMethodology?.id
    ) {
      // setTimeout(() => setLoadFormFields(true), 10);
      setLoadFormFields(true);
    } else {
      setLoadFormFields(false);
    }
  }, [selectedValveCategory, selectedFluidType, selectedSizingMethodology]);

  const getFields = (sectionName) => {
    const fieldData = [];
    switch (sectionName) {
      case "applicationRequirements":
        fieldData.push(...applicationRequirementsFieldsData);
        break;
      case "fluid":
        fieldData.push(...fluidPropertiesFieldsData);
        break;
      case "temperatures":
        fieldData.push(...temperaturePropertiesFieldsData);
        break;
      case "pressures":
        if (pressurePropertiesFieldsData?.length > 0) {
          fieldData.push(...pressurePropertiesFieldsData);
        } else {
          systemPressureFieldsData.forEach((field) => {
            field.handleChange = systemPressureRest.handleChange;
            field.handleBlur = systemPressureRest.handleBlur;
            field.handleFocusedFieldName =
              systemPressureRest.handleFocusedFieldName;
            field.focusedFieldName = systemPressureRest.focusedFieldName;
          });
          fieldData.push(...systemPressureFieldsData);
          if (payloadData?.IsPressureOnly) {
            pressureCaseFieldsData.forEach((field) => {
              field.handleChange = pressureCaseRest.handleChange;
              field.handleBlur = pressureCaseRest.handleBlur;
              field.handleFocusedFieldName =
                pressureCaseRest.handleFocusedFieldName;
              field.focusedFieldName = pressureCaseRest.focusedFieldName;
            });
            fieldData.push({
              label: ["Pressure Case"],
              fieldName: "PressureCase",
              type: "label",
              value: "",
              visibility: true,
              disabled: true,
              style: { flex: 10 },
            });
            fieldData.push(...pressureCaseFieldsData);
          }
          if (payloadData?.IsVacuumOnly) {
            vacuumCaseFieldsData.forEach((field) => {
              field.handleChange = vacuumCaseRest.handleChange;
              field.handleBlur = vacuumCaseRest.handleBlur;
              field.handleFocusedFieldName =
                vacuumCaseRest.handleFocusedFieldName;
              field.focusedFieldName = vacuumCaseRest.focusedFieldName;
            });
            fieldData.push({
              label: ["Vacuum Case"],
              fieldName: "VacuumCase",
              type: "label",
              value: "",
              visibility: true,
              style: { flex: 10 },
            });
            fieldData.push(...vacuumCaseFieldsData);
          }
        }
        break;
      case "flowCapacity":
        fieldData.push(...flowCapacityFieldsData);
        break;
      default:
        break;
    }
    return fieldData;
  };

  const handleResultClick=()=>{
    
    const localDisplayUnit = payloadData[Orific_Filter_Column]; //=== 'Metric' ? 'Metric' : 'English';
      const localOrificeArea =
        localDisplayUnit === "All"
          ? OrificeDropdownOptions.find((item) => item.value === selectedOrificeArea?.value)
          : OrificeDropdownOptions.find(
              (item) => item.display === localDisplayUnit && item.value === selectedOrificeArea?.value
            );

      // console.log('localOrificeArea >>>>>>>>>>>>>>>>> ',localOrificeArea,selectedOrificeArea,payloadData[Orific_Filter_Column],localDisplayUnit)
      // if(saveSizingFlag){
      if (localOrificeArea) {
        dispatch(setSelectedOrificeArea(localOrificeArea));
      } else if (localDisplayUnit === "Metric") {
        dispatch(setSelectedOrificeArea({ label: "cm²", value: "area.cm2", display: "Metric" }));
      } else {
        dispatch(setSelectedOrificeArea({ label: "in²", value: "area.in2", display: "English" }));
      }
      // }
      let localInfoError = []; //infoError===null?[]:[...infoError];
      // console.log('error >>>>>>>>>>>>>>>>> ',infoError)
      for (const section of workflowSections) {
        for (const field of section?.fields) {
          if (field?.fieldBlankMessage !== undefined && field?.fieldBlankMessage !== null) {
            if (
              (payloadData[field?.fieldName] === null ||
              payloadData[field?.fieldName] === undefined ||
              isNaN(payloadData[field?.fieldName]) ||
              payloadData[field?.fieldName] === "" ||
              parseFloat(payloadData[field?.fieldName]) == 0) && field?.type !=='textinfo'
            ) {
              const info = { name: field?.fieldName, value: { error: field?.fieldBlankMessage } };
              localInfoError.push(info);
            }
          }
        }
      }
      dispatch(onUpdateInfoError(localInfoError));

    if(payloadData["IsPressureOnly"] && payloadData["IsVacuumOnly"]){
      dispatch(onSelectMenu(10));
    } else if (payloadData["IsPressureOnly"] || payloadData["IsVacuumOnly"]) {
      dispatch(onSelectMenu(10));
    } else {
      dispatch(onSelectMenu(8));
    }

    handleSaveSizingData(2, true);
  };

  const handleAPI2000ConfirmOk = () => {
    // console.log('In useFormFields :: handleAPI2000ConfirmOk ::::::::::::: ')
    if (payloadData["IsPressureOnly"]) {
      dispatch(onUpdateFields({ name: "FlowRatePopupFlag", value: false }));
      dispatch(
        onUpdateFields({ name: "API2000WreqChangeWarningFlag", value: false })
      );
    }
    if (payloadData["IsVacuumOnly"]) {
      dispatch(
        onUpdateFields({ name: "FlowRateVacuumPopupFlag", value: false })
      );
      dispatch(
        onUpdateFields({ name: "API2000WreqVChangeWarningFlag", value: false })
      );
    }
  };

  const handleAPI2000ConfirmCancel = () => {
    let localSelectedFields = [...selectedFields];
    let localPayloadData = { ...payloadData };
    workflowPopup.fields.forEach((item) => {
      const defaultValue =
        item.fieldName === "Relieving" ||
        item.fieldName === "Operating" ||
        item.fieldName === "SystemMAWP" ||
        item.fieldName === "OperatingPressure"
          ? localPayloadData[item.fieldName]
          : item.type === "radio"
          ? item?.fieldList !== undefined
            ? item?.fieldList[0]?.fieldName
            : item?.defaultValue
          : item.type === "checkbox"
          ? item.defaultValue === ""
            ? false
            : item.defaultValue
          : typeof item.defaultValue === "object"
          ? Array.isArray(item.defaultValue)
            ? ""
            : item.defaultValue.value
          : typeof item.defaultValue === "string"
          ? item.defaultValue
          : typeof item.defaultValue === "boolean"
          ? item.defaultValue === ""
            ? false
            : item.defaultValue
          : "";
      // console.log('Popup Change 11111 >>>>>>>>>>>> field 2222>>>>>>>>>>>>>>>>>>',item.fieldName,item.defaultValue)
      localSelectedFields = localSelectedFields.filter(
        (f1) => f1.name !== item.fieldName
      );
      localSelectedFields.push({ name: item.fieldName, value: defaultValue });
      localPayloadData[item.fieldName] = defaultValue;
    });
    if (payloadData["IsPressureOnly"]) {
      localSelectedFields = localSelectedFields.filter(
        (f1) => f1.name !== "Wreq"
      );
      localSelectedFields.push({
        name: "Wreq",
        value: payloadData["prevWreq"],
      });
      localPayloadData["Wreq"] = payloadData["prevWreq"];

      localSelectedFields = localSelectedFields.filter(
        (f1) => f1.name !== "API2000WreqChangeWarningFlag"
      );
      localSelectedFields.push({
        name: "API2000WreqChangeWarningFlag",
        value: false,
      });
      localPayloadData["API2000WreqChangeWarningFlag"] = false;
    }
    if (payloadData["IsVacuumOnly"]) {
      localSelectedFields = localSelectedFields.filter(
        (f1) => f1.name !== "WreqV"
      );
      localSelectedFields.push({
        name: "WreqV",
        value: payloadData["prevWreqV"],
      });
      localPayloadData["WreqV"] = payloadData["prevWreqV"];

      localSelectedFields = localSelectedFields.filter(
        (f1) => f1.name !== "API2000WreqVChangeWarningFlag"
      );
      localSelectedFields.push({
        name: "API2000WreqVChangeWarningFlag",
        value: false,
      });
      localPayloadData["API2000WreqVChangeWarningFlag"] = false;
    }
    dispatch(
      onUpdateListOfFields({
        selectedFields: localSelectedFields,
        payloadData: localPayloadData,
      })
    );
  };

  return (
    <div style={{ background: "whitesmoke",marginTop:10 }}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <p style={{fontSize:'1.',fontWeight:600,marginBottom:0,marginLeft:'1rem'}}>Advanced View</p>
        {sizingData !== null ? (
                <p style={{fontSize:'0.875rem',fontWeight:500,marginBottom:0,marginRight:'1rem'}}>
                  <span style={{fontSize:'1rem',fontWeight:500}}>Sizing Id: </span>
                  {sizingData?.SizingId}
                </p>
              ) : (
                <p> </p>
              )}
      </div>
      <div >
        <SnakebarContent {...snakebar} />
        <div
          className="dropdown-container"
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            padding: "0 1rem",
            boxSizing: "border-box",
          }}
        >
          {menus
            .filter(({ id: tabId }) => [1, 2, 3].includes(tabId))
            .map(({ id: tabId, name }) => {
              if (tabId === 1) {
                return (
                  <LabeledDropdown
                    key={tabId}
                    label={name}
                    value={
                      selectedValveCategory?.id
                        ? selectedValveCategory.id.toString()
                        : ""
                    }
                    options={valveCategories?.items?.map(
                      ({ id, name, imageUrl = undefined }) => ({
                        value: String(id),
                        label: name,
                        image: imageUrl,
                      })
                    )}
                    advancedProps={{
                      defaultLabel: "Please select the Valve Category",
                      tabId,
                      handleChange: valveCategoryHandleChange,
                    }}
                    grid="4"
                    smSelection={true}
                  />
                );
              }
              if (tabId === 2) {
                return (
                  <LabeledDropdown
                    key={tabId}
                    label={name}
                    value={
                      selectedFluidType?.id
                        ? selectedFluidType.id.toString()
                        : ""
                    }
                    options={
                      !fluidTypes?.items
                        ? []
                        : fluidTypes?.items.map(({ id, name, imageUrl }) => ({
                            value: String(id),
                            label: name,
                            image: imageUrl,
                          }))
                    }
                    advancedProps={{
                      defaultLabel: "Please select the Fluid Type",
                      tabId,
                      handleChange: fluidTypeHandleChange,
                    }}
                    grid="4"
                    smSelection={true}
                  />
                );
              }
              if (tabId === 3) {
                return (
                  <LabeledDropdown
                    key={tabId}
                    label={name}
                    value={
                      selectedSizingMethodology?.id
                        ? selectedSizingMethodology.id.toString()
                        : ""
                    }
                    options={
                      !sizingMethodologies?.items
                        ? []
                        : sizingMethodologies?.items.map(
                            ({ id, name, imageUrl }) => ({
                              value: String(id),
                              label: name,
                              image: imageUrl,
                            })
                          )
                    }
                    advancedProps={{
                      defaultLabel: "Please select the Sizing Methodology",
                      tabId,
                      handleChange: sizingMethodologyHandleChange,
                    }}
                    grid="4"
                    smSelection={true}
                  />
                );
              }
            })}
        </div>
      </div>
      {loadFormFields && (
        <div>
          <div className="advanced_view_container">
            <div className="advanced_view_section">
              <Fieldset
                legend="Application Requirements"
                fields={getFields("applicationRequirements")}
                formProps={arRest}
              />
              <Fieldset
                legend="Fluid Properties"
                fields={getFields("fluid")}
                formProps={fluidRest}
              />
              <Fieldset
                legend="Temperatures"
                fields={getFields("temperatures")}
                formProps={tempRest}
              />
            </div>
            <div className="advanced_view_section">
              <Fieldset
                legend="Pressures"
                fields={getFields("pressures")}
                formProps={pressureRest}
              />
              <Fieldset
                legend="Flow Capacity"
                fields={getFields("flowCapacity")}
                formProps={flowRest}
              />
            </div>
          </div>
          <div className="load-results-container">
            {!advViewResultDisplayFlag && <div>
              <Button
                className={`${styles.footerButton} ${styles.footerNext}`}
                disabled={!activateResults || flowCalcPopupSaved}
                // endIcon={<NavigateNextIcon />}
                onClick={handleResultClick}
              >
                Results
              </Button>
            </div>}
            {advViewResultDisplayFlag && 
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",width:"100%" }}>
              <div>
              {/* {sizingData !== null ? (
                <p className="menu_subheader">
                  <span>Sizing Id: </span>
                  {sizingData?.SizingId}
                </p>
              ) : ( */}
                <p> </p>
              {/* )} */}
              </div>
              <div>
                <ProceedButton endIconFlag={false}/>
              </div>
            </div>}
          </div>
          <ResultsDisplay dataDisplayFlag={advViewResultDisplayFlag} />
        </div>
      )}
      <TankDataModal
        openFlag={
          EnterTankData ||
          payloadData?.EnterTankData ||
          (payloadData?.CalculateFlowRate &&
            API2000_WF.indexOf(selectedWorkflow) !== -1)
        }
      />
      {worldMapModal && <WorldMap />}
      {searchSizingModal && <SearchSizingModal />}
      {resetSizingModal?.status && (
        <AlertModal
          type={resetSizingModal?.type}
          title={resetSizingModal?.title}
          message={resetSizingModal?.message}
        />
      )}
      {(payloadData["API2000WreqChangeWarningFlag"] ||
        payloadData["API2000WreqVChangeWarningFlag"]) && (
        <ConfirmationModal
          title={API2000FlowChangeConfirm.title}
          message={
            <div style={{ display: "flex" }}>
              <span>
                <img
                  className="results-img"
                  src={API2000FlowChangeConfirm.messageicon}
                  alt="exclamation"
                />
              </span>
              <span>{API2000FlowChangeConfirm.message}</span>
            </div>
          }
          confirmlabel={API2000FlowChangeConfirm.confirmlabel}
          cancellabel={API2000FlowChangeConfirm.cancellabel}
          handleConfirmOk={handleAPI2000ConfirmOk}
          handleConfirmCancel={handleAPI2000ConfirmCancel}
        />
      )}
    </div>
  );
};

export default AdvancedViewLayout;
