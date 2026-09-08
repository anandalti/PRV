import { useSelector } from "react-redux";
import Dialog from "../hoc/Dialog";

import homeStyles from '../../styles/Home.module.css';
import useRLPopupFields from "../../hooks/useRLPopupFields";
import RestrictedLiftPopup from "./RestrictedLiftPopup";

const RestrictedLiftModal = ({openFlag}) => {
    const { payloadData } = useSelector(state => state.workflowPayload);
    const {selectedFields } = useSelector(state => state.workflow);
    // const {focusedFieldName} = useSelector(state=>state.generic);
    const { heading,fieldData,focusedFieldName, okButtonDisabled,closeButtonDisabled, handleClose,handleOk,handleChange,handleBlurField,handleFocusedFieldName} = useRLPopupFields(openFlag);

    // console.log('RL Popup Change 11111 >>>>>>>>>>>> >>>>>>>>>>>> ',fieldData);
  return (
    <Dialog
        maxWidth="xd"
        open={openFlag && fieldData?.length>0}
        onClose={handleClose}
        title={heading}
        draggable={true}
        children={<>
           <RestrictedLiftPopup fields={fieldData} selectedFields={selectedFields} selectedData={payloadData} focusedFieldName={focusedFieldName} handleChange={handleChange} handleBlur={handleBlurField} handleFocusedFieldName={handleFocusedFieldName} />
        </>}
        buttons={
          payloadData['RestrictedLift']=='RestrictedLiftSpecify' && payloadData['RestrictedLiftErrors']?.length>0?
          [
            { label: `Cancel`,onClick: handleClose, className: `${homeStyles.modalButton}`,
              variant: `outlined`, disabled:{closeButtonDisabled}
            }
          ]:
          [
            { label: `Save` ,onClick: handleOk, className: `${payloadData['RestrictedLift']=='RestrictedLiftSpecify' && payloadData['RestrictedLiftErrors']?.length>0?homeStyles.modalButton_disabled:homeStyles.modalButton}`,
              variant: `outlined`, disabled:payloadData['RestrictedLift']=='RestrictedLiftSpecify' && payloadData['RestrictedLiftErrors']?.length>0
            },
            { label: `Cancel`,onClick: handleClose, className: `${homeStyles.modalButton}`,
              variant: `outlined`, disabled:{closeButtonDisabled}
            },
        ]}
    />
  )
}

export default RestrictedLiftModal