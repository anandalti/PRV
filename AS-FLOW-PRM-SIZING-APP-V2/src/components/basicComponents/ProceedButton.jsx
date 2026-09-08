import { useState, useEffect } from 'react';
import useSaveSizing from '../../hooks/useSaveSizing';
import Button from './Button';
import styles from "../../styles/Home.module.css";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useDispatch, useSelector } from 'react-redux';
import { onUpdateProceed93XXModal, onUpdateProceedModal, onUpdateProceedModalMessage, onUpdateProceedOmni900Modal, fetchRestrictedLiftPopupDetails,setRLProceedModal, onUpdatePopupCounter } from '../../store/slices/workflowSlice';
// import { setIsConfigurationLayout } from '../../store/slices/configurationSlice';
import { Configuration_FLAG, CONFIGURATION_MODEL, Modal93XX_Configuration, Model_Configuration, Models_9300H_Sizing, Omni900Modal_Configuration, Sec1_Model_Configuration, Two_Phase_Model_Configuration, Two_Phase_WorkflowIds } from '../../utils/constants';
import useConfigurationPanel from '../../hooks/useConfigurationPanel';
import Dialog from '../hoc/Dialog';

const ProceedButton = ({endIconFlag=false}) => {
  const dispatch = useDispatch();
    const { handleSaveWorkflowData } = useSaveSizing();
    const {configDataFlag,fetchModelConfiguration}=useConfigurationPanel();

    const { selectedResultRows, payloadData, proceedButtonDisabledFlag, ProceedButtonEnableFlag } = useSelector((state) => state.workflowPayload);
    const {selectedWorkflow, popupCounter} = useSelector((state) => state.workflow);
    const [isProceedActive, setIsProceedActive] = useState(false);

    // Processes one valve at a time. Pauses when a popup is opened;
    // resumes when the popup's close/ok handler increments popupCounter.
    useEffect(() => {
      if (!isProceedActive || !selectedResultRows?.length) return;
      // console.log('ProceedButton::useEffect triggered >>>>>>>>>>>>>>>>> ',popupCounter, selectedResultRows?.length);
      if (popupCounter >= selectedResultRows.length) {
        // console.log('ProceedButton::useEffect completed >>>>>>>>>>>>>>>>> ',popupCounter, selectedResultRows?.length);
        setIsProceedActive(false);
        handleSaveWorkflowData(3);
        return;
      }

      const row = selectedResultRows[popupCounter];
      const SizingBasis = payloadData?.SizingBasis;
      const ValveType = row?.ValveType;
      const selectedModel = row?.ModelNumber;
      const brand = row?.Brand;
      const isValvePopup = row?.isValvePopup;
      const popupDetails = row?.popupDetails;
      const ReResponse = JSON.parse(row?.ReResponse ?? row?.ReResponse_v ?? '{}');

      if (Models_9300H_Sizing.includes(selectedModel)) {
        if (isValvePopup && popupDetails) {
          dispatch(onUpdateProceedModalMessage({...popupDetails}));
        }
        dispatch(onUpdateProceed93XXModal(true));
        // Popup shown — wait. Resume when popup close/ok increments popupCounter.
      } else if (!Two_Phase_WorkflowIds.includes(selectedWorkflow) && ReResponse?.valveModels?.length > 0) {
        if (isValvePopup && popupDetails) {
          dispatch(onUpdateProceedModalMessage({...popupDetails}));
        }
        dispatch(onUpdateProceedOmni900Modal(true));
      } else if (['Economizer', 'Preheater'].includes(SizingBasis) && selectedModel === 'HSJ') {
        if (isValvePopup && popupDetails) {
          dispatch(onUpdateProceedModalMessage({...popupDetails}));
        }
        dispatch(onUpdateProceedModal(true));
      } else if (brand === 'Crosby®' && Two_Phase_WorkflowIds.includes(selectedWorkflow) && ValveType.indexOf('Conventional') !== -1 && ValveType.indexOf('Spring') !== -1) {
        if (isValvePopup && popupDetails) {
          dispatch(onUpdateProceedModalMessage({...popupDetails, modalFlag: 'TWO_PHASE'}));
        }
        dispatch(onUpdateProceedModal(true));
      } else if (isValvePopup && popupDetails?.RestrictedLiftCalculation) {
        // Pass the full popupDetails object — the thunk picks
        // queryVariables (GraphQL mode) or PopupContentUrl (REST mode)
        dispatch(fetchRestrictedLiftPopupDetails(popupDetails)).then(() => {
          dispatch(setRLProceedModal(true));
        });
      } else {
        // No popup needed — advance immediately to the next valve.
        dispatch(onUpdatePopupCounter(popupCounter + 1));
      }
    }, [popupCounter, isProceedActive]);

    const handleProceed = () => {
      if (!!selectedResultRows?.length && !proceedButtonDisabledFlag) {
        dispatch(onUpdatePopupCounter(0));
        setIsProceedActive(true);
      }
    };

    const handleConfigure = () => {
      // console.log('configurationData >>>>>>>>>>>>>>> ModelId >>>>>>>>>>>>>>> ',selectedResultRows[0]);
      const targetRow = CONFIGURATION_MODEL === 'ALL'
        ? selectedResultRows[0]
        : (selectedResultRows.find(r => r.ModelNumber == CONFIGURATION_MODEL) ?? selectedResultRows[0]);
      fetchModelConfiguration(targetRow?.ModelId);
      // dispatch(setIsConfigurationLayout(true));
    }
  return (
    <>
      <Button
          className={`${styles.footerButton} ${styles.footerNext}`}
          // disabled={!IsMultiValves? selectedResultRows?.length == 0:(selectedResultRows?.length <= 1 || proceedButtonDisabledFlag)}
          disabled={!ProceedButtonEnableFlag}
          endIcon={endIconFlag?<NavigateNextIcon />:null}
          onClick={handleProceed}
        >
          Proceed
      </Button>
      {Configuration_FLAG && selectedResultRows?.length>0 && (CONFIGURATION_MODEL=='ALL' || selectedResultRows.some(r => r.ModelNumber==CONFIGURATION_MODEL)) && 
      <Button
          className={`${styles.footerButton} ${styles.footerNext}`}
          disabled={selectedResultRows?.length <= 1}
          endIcon={endIconFlag?<NavigateNextIcon />:null}
          onClick={handleConfigure}
        >
          Configure
      </Button>}
      <Dialog open={configDataFlag} title={Model_Configuration.title}>
        {Model_Configuration.content}
      </Dialog>
      </>
  )
}

export default ProceedButton