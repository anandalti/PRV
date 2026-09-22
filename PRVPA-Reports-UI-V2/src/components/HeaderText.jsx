import React from 'react';
import Grid from '../customComponents/Grid';
import TextDisplay from '../customComponents/TextDisplay';
import { headerText, subtitle1, marginBottom0 } from '../styles/StyleObjectProperties';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';

const HeaderText = () => {
  const dispatch = useDispatch();
  const handleLogout = () => dispatch(logoutUser());
  return (
    <>
      <Grid container item lg={12} sm={12} xs={12}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <TextDisplay sx={headerText} text="PRV²SIZE Reports" />
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </Grid>
      <Grid container item lg={12} sm={12} xs={12}>
        <Grid item lg={8} sm={8} xs={8}>
          <TextDisplay variant="subtitle1" gutterBottom sx={{...subtitle1, ...marginBottom0}}
            text="Enter Project and Tag Details as applicable for the indicated SizingID. Review the calculated values for noise and reaction force.  Proceed to reporting to export the desired report and format."
          />
        </Grid>
      </Grid>
    </>
  )
}

export default HeaderText;