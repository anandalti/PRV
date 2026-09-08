import React from 'react';
import Stack from '../../../components/hoc/Stack';
import Button from '../../../components/basicComponents/Button';
import styles from '../../../styles/Home.module.css';
import { headerButton } from '../../../styles/StyleObjectProperties';
import { Grid} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserPreference, updateResetModel } from '../../../store/slices/preferenceSlice';
import { updatePreference } from '../../../store/slices/authSlice';
import { updateSnakebar } from '../../../store/slices/preferenceSlice';
const PreferenceHeaderButtonStack = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const { preferencePayloadData, error } = useSelector(state => state.preference);
  const { userData } = useSelector(state => state.auth);
  const handleOpen = () => dispatch(updateResetModel(true));
  const handleSave = () => {
    if (error.length > 0) {
      const errorMessages = error.map(item => item?.value?.error?.message);
      dispatch(updateSnakebar({status: true, message: errorMessages, severity: "error"}));
    } else {
      let data = { id: userData.Id, payload: {...preferencePayloadData} };
      dispatch(updateUserPreference(data));
      dispatch(updatePreference({...preferencePayloadData}));
    }
  }
  
  return (
    <Stack spacing={3} direction="row" justifyContent="end">
      <Grid container item lg={12} sm={12} xs={12}>
        <Grid container item lg={6} sm={12} xs={12}>
        </Grid>
        <Grid container item lg={2} sm={3} xs={6}>
          <Button className={headerButton} variant="outlined" endIcon={<NavigateNextIcon />} onClick={handleSave}>Save</Button>
        </Grid>
        <Grid container item lg={2} sm={3} xs={6}>
          <Button className={headerButton} variant="outlined" endIcon={<NavigateNextIcon />} onClick={handleOpen}>Reset</Button>
        </Grid>
        <Grid container item lg={2} sm={3} xs={6}>
          <Button 
            className={`${styles["bgColor_Transparent"]} ${styles["border"]} ${styles["borderRadius"]} ${styles["headerButton"]} ${styles["textColorBlack"]}`} 
            variant="outlined" 
            endIcon={<NavigateNextIcon />} 
            onClick={() => navigate("/Sizing")}>Go To Sizing
          </Button>
        </Grid>
        <Grid container item lg={1} sm={12} xs={12}>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default PreferenceHeaderButtonStack;