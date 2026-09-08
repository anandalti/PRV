import React from 'react';
import Grid from '../../components/hoc/Grid';
import TextDisplay from '../../components/basicComponents/TextDisplay';
import { headerText, subtitle1, marginBottom0 } from '../../styles/StyleObjectProperties';
import HeaderLinks from './HeaderLinks';
import { HEADER_DATA } from '../../utils/constants';

const HeaderText = () => {

  return (
    <>
      <Grid container item lg={12} sm={12} xs={12}>
        <TextDisplay sx={headerText} text={HEADER_DATA.title} />
      </Grid>
      <Grid container item lg={12} sm={12} xs={12}>
        <Grid item lg={8} sm={8} xs={8}>
          <TextDisplay variant="subtitle1" gutterBottom sx={{...subtitle1, ...marginBottom0}}
            text={HEADER_DATA.subtitle}
          />
        </Grid>
        <Grid item lg={4} sm={4} xs={4}>
          <HeaderLinks />
        </Grid>
      </Grid>
    </>
  )
}

export default HeaderText;