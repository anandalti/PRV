import Stack from '../../../components/hoc/Stack'
import Button from '../../../components/basicComponents/Button'
import styles from './../../../styles/Home.module.css';
import { onSelectPreferenceMenu } from "../../../store/slices/preferenceSlice";
import { useDispatch, useSelector } from "react-redux";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
const PreferenceBottomNavigation = () => {
  const {activePreferenceMenu, preferenceMenus} = useSelector(state => state.preference);
  const totalMenus = preferenceMenus.length;
  const dispatch = useDispatch();
  
  const handleChange = (newValue) => {
    dispatch(onSelectPreferenceMenu(newValue));
  };
  
  // console.log("Active Menu:", activePreferenceMenu, "Total Menus:", totalMenus);

  return (
    <Stack justifyContent="space-between" direction="row" sx={{margin: "1rem"}}>
      {activePreferenceMenu !== 1 && (
        <Button className={styles.footerButton} startIcon={<NavigateBeforeIcon />} onClick={() => handleChange(activePreferenceMenu - 1)}>Previous</Button>
      )}
      {activePreferenceMenu <= totalMenus - 2 && (
        <Button className={`${styles.footerButton} ${styles.footerNext}`} endIcon={<NavigateNextIcon />} onClick={() => handleChange(activePreferenceMenu + 1)}>Next</Button>
      )}
    </Stack>
  );
};

export default PreferenceBottomNavigation;