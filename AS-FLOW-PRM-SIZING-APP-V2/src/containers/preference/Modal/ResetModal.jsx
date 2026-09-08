import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from '../../../components/hoc/Dialog';
import {RESET_PREFERENCES} from '../../../utils/constants';
import { updateResetModel, bulkUpdateSelectedPreferences, updatePreferencePayloadData } from "../../../store/slices/preferenceSlice";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import styles from '../../../styles/Home.module.css';

const ResetModal = ({ open }) => {
    const dispatch = useDispatch();
    const preferences = useSelector(state => state.auth.preferences);
    const handleClose = () => {
      dispatch(updateResetModel(false));
    //   console.log("Clicked on Cancel Button");
    };  
    const handleSave = () => {
        const selectedPreference = Object.keys(preferences).map(key => {
            return {
                name: key,
                value: preferences[key]
            }
        });
        dispatch(bulkUpdateSelectedPreferences(selectedPreference));
        dispatch(updatePreferencePayloadData(preferences))
        dispatch(updateResetModel(false));
        // console.log("Clicked on Ok Button");
    };
    const handleCancel = () => {
        dispatch(updateResetModel(false));
        // console.log("Clicked on Cancel Button");
    };
return (
    <Dialog
        open={open} 
        onClose={handleClose} 
        title={RESET_PREFERENCES.title} 
        children={RESET_PREFERENCES.content}
        buttons={[
            { label: `${RESET_PREFERENCES.savebtn}`, onClick: handleSave, className: styles.footerButton, endIcon: <NavigateNextIcon /> },
            { label: `${RESET_PREFERENCES.cancelbtn}` , onClick: handleCancel, className: styles.footerButton, endIcon: <NavigateNextIcon /> }
        ]}
    />
);
};

export default ResetModal;