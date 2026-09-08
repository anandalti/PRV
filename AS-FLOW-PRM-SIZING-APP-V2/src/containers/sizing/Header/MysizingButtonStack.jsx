import React from 'react';
import Stack from '../../../components/hoc/Stack';
import Button from '../../../components/basicComponents/Button';
import styles from '../../../styles/Home.module.css';
import { headerButton } from '../../../styles/StyleObjectProperties';
import Grid from '../../../components/hoc/Grid';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';

const MysizingButtonStack = () => {
  const navigate = useNavigate(); 

  const handleClear = () => {
    // window.location.reload();
  };

  return (
    <Stack spacing={3} direction="row" justifyContent="end">

        <Grid container item lg={2} sm={3} xs={6}>
          <Button 
            className={headerButton} 
            variant="outlined" 
            endIcon={<NavigateNextIcon />} 
            onClick={handleClear}
          >
            Clear
          </Button>
        </Grid>
        <Grid container item lg={2} sm={3} xs={6}>
          <Button 
            className={`${styles["bgColor_Transparent"]} ${styles["border"]} ${styles["borderRadius"]} ${styles["headerButton"]} ${styles["textColorBlack"]}`} 
            variant="outlined" 
            endIcon={<NavigateNextIcon />} 
            onClick={() => navigate("/Sizing")}
          >
            Go To Sizing
          </Button>
        </Grid>

    </Stack>
  );
};

export default MysizingButtonStack;