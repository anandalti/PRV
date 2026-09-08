import { useSelector, shallowEqual } from "react-redux";
import Dialog from "../hoc/Dialog";
import FireCasePopup from "./FireCasePopup";
import API2000Popup from "./API2000Popup";
import usePopupFields from "../../hooks/usePopupFields";
import homeStyles from '../../styles/Home.module.css';

const TankDataModal = ({openFlag}) => {
    const { activeMenu } = useSelector(state => state.navigation);
    const { payloadData } = useSelector(state => state.workflowPayload, shallowEqual);
    const {selectedFields,error,selectedWorkflow,status } = useSelector(state => state.workflow);
    // const {focusedFieldName} = useSelector(state=>state.generic);
    const { heading,fieldData,focusedFieldName, localPayloadData,localSelectedFields,okButtonDisabled,closeButtonDisabled, handleClose,handleOk,handleChange,handleBlurField,handleFocusedFieldName} = usePopupFields(activeMenu);

    // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> In Popup >>>>>>>>>>>> ',heading,fieldData,openFlag,okButtonDisabled,closeButtonDisabled);
  return (
    <Dialog
        maxWidth="xd"
        open={openFlag && fieldData?.length>0}
        onClose={handleClose}
        title={heading}
        draggable={true}
        children={<>
           {selectedWorkflow===12?
            <FireCasePopup fields={fieldData} workflowId={selectedWorkflow} selectedFields={selectedFields} selectedData={payloadData} error={error} focusedFieldName={focusedFieldName} handleChange={handleChange} handleBlur={handleBlurField} handleFocusedFieldName={handleFocusedFieldName} />
            :<API2000Popup fields={fieldData} workflowId={selectedWorkflow} selectedFields={selectedFields} selectedData={payloadData} error={error} focusedFieldName={focusedFieldName} handleChange={handleChange} handleBlur={handleBlurField} handleFocusedFieldName={handleFocusedFieldName} />
           }
        </>}
        buttons={[
            { label: `Ok` ,onClick: handleOk, className: `${homeStyles.modalButton}`,
              variant: `outlined`, disabled:{okButtonDisabled}},
            { label: `Cancel`,onClick: handleClose, className: `${homeStyles.modalButton}`,
              variant: `outlined`, disabled:{closeButtonDisabled}
            },
        ]}
    />
  )
}

export default TankDataModal