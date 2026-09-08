import { useSelector } from "react-redux";
import Tile from "../../../components/compoundComponents/Tile";
import Stack from "../../../components/hoc/Stack";
import BottomNavigation from "../navigation/BottomNavigation";
import FormFields from "../../../components/compoundComponents/FormFields";
import ResultsDisplay from "../../../components/compoundComponents/ResultsDisplay";
import useFormFields from "../../../hooks/useFormFields";
import WorldMap from "../../../components/compoundComponents/WorldMap";
import SearchSizingModal from "../../../components/compoundComponents/SearchSizingModal";
import AlertModal from "../../../components/compoundComponents/AlertModal";
import TankDataModal from "../../../components/compoundComponents/TankDataModal";
import ConfirmationModal from "../../../components/compoundComponents/ConfirmationModal";
import GenericValveSizingModal from "../../../components/compoundComponents/GenericValveSizingModal";
import { API2000_WF, API2000FlowChangeConfirm } from "../../../utils/constants";
const TabPanel = () => {
  const { activeMenu } = useSelector((state) => state.navigation);
  const {
    selectedFields,
    error,
    worldMapModal,
    searchSizingModal,
    resetSizingModal,
    EnterTankData,
    selectedWorkflow,
  } = useSelector((state) => state.workflow);
  const { payloadData, sizingData } = useSelector(
    (state) => state.workflowPayload
  );
  const { gvsModal } = useSelector((state) => state.genericValveSizing);

  const {
    heading,
    fieldData,
    focusedFieldName,
    displayType,
    selectedItem,
    handleChange,
    handleBlur,
    handleFocusedFieldName,
    handleAPI2000ConfirmOk,
    handleAPI2000ConfirmCancel,
  } = useFormFields(activeMenu);

  const { wfDataLoaded } = useSelector((state) => state.workflow);
  // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >> In Tab Panel :: formItems:::22222222222 >>>> ',payloadData?.CalculateFlowRate,API2000_WF.indexOf(selectedWorkflow) !== -1);
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 className="menu_header">{!wfDataLoaded?heading:null}</h2>
        {sizingData !== null ? (
          <p className="menu_subheader">
            <span>Sizing Id: </span>
            {sizingData?.SizingId}
          </p>
        ) : (
          <p> </p>
        )}
      </div>
      {displayType === "tile" && (
        <Stack direction="column" spacing="2">
          {fieldData?.map((item, i) => (
            <Tile
              key={i}
              selectedItem={selectedItem}
              item={item}
              handleChange={handleChange}
            />
          ))}
        </Stack>
      )}
      {displayType === "form" && (
        <FormFields
          fields={fieldData}
          selectedFields={selectedFields}
          selectedData={payloadData}
          error={error}
          focusedFieldName={focusedFieldName}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleFocusedFieldName={handleFocusedFieldName}
        />
      )}
      {displayType === "Results" && wfDataLoaded ? <div className="loader"></div> : displayType === "Results" && <ResultsDisplay data={[payloadData]} />}
      <BottomNavigation resultPage={displayType === "Results"} />
      {(EnterTankData ||
          payloadData?.EnterTankData ||
          (payloadData?.CalculateFlowRate &&
            API2000_WF.indexOf(selectedWorkflow) !== -1)) && 
            <TankDataModal
              openFlag={
                EnterTankData ||
                payloadData?.EnterTankData ||
                (payloadData?.CalculateFlowRate &&
                  API2000_WF.indexOf(selectedWorkflow) !== -1)
              }
      />}
      {worldMapModal && <WorldMap />}
      {searchSizingModal && <SearchSizingModal />}
      {gvsModal && <GenericValveSizingModal />}
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
    </>
  );
};

export default TabPanel;
