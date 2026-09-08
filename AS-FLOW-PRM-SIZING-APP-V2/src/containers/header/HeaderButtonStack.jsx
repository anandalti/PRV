import Stack from "../../components/hoc/Stack";
import Button from "../../components/basicComponents/Button";
import styles from "./../../styles/Home.module.css";
import { headerButton } from "../../styles/StyleObjectProperties";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import useSaveSizing from "../../hooks/useSaveSizing";
import useSearchSizing from "../../hooks/useSearchSizing";
import Grid from "../../components/hoc/Grid";
import useResetSizing from "../../hooks/useResetSizing";
import { useSelector } from "react-redux";
//import {SendIcon} from '@mui/icons-material';
const HeaderButtonStack = () => {
  const { activeMenu } = useSelector((state) => state.navigation);
  const {  workflowSections } = useSelector((state) => state.workflow);
  const { handleSaveWorkflowData,handleSaveSizingData } = useSaveSizing();
  const { handleCloseSizingDetails, handleClearSizingDetails } =
    useResetSizing();
  const { handleSearchSizing } = useSearchSizing();
  
  return (
    <Stack spacing={3} direction="row" justifyContent="end">
      <Grid container item lg={2} sm={3} xs={6}>
        <Button
          className={headerButton}
          variant="outlined"
          endIcon={<NavigateNextIcon />}
          onClick={() => activeMenu< (workflowSections?.length+3)?handleSaveWorkflowData(1):handleSaveSizingData(2,true)}
        >
          Save
        </Button>
      </Grid>
      <Grid container item lg={2} sm={3} xs={6}>
        <Button
          className={headerButton}
          variant="outlined"
          endIcon={<NavigateNextIcon />}
          onClick={handleClearSizingDetails}
        >
          Clear
        </Button>
      </Grid>
      <Grid container item lg={2} sm={3} xs={6}>
        <Button
          className={`${styles["bgColor_Transparent"]} ${styles["border"]} ${styles["borderRadius"]} ${styles["headerButton"]} ${styles["textColorBlack"]}`}
          variant="outlined"
          endIcon={<NavigateNextIcon />}
          onClick={handleCloseSizingDetails}
        >
          Close
        </Button>
      </Grid>
      <Grid container item lg={2} sm={3} xs={6}>
        <Button
          className={`${styles["bgColor_Transparent"]} ${styles["border"]} ${styles["borderRadius"]} ${styles["headerButton"]} ${styles["textColorBlack"]}`}
          variant="outlined"
          endIcon={<NavigateNextIcon />}
          onClick={handleSearchSizing}
        >
          Search Sizing
        </Button>
      </Grid>
    </Stack>
  );
};

export default HeaderButtonStack;
