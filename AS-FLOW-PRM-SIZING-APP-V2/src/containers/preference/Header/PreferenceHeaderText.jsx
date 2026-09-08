import React from 'react';
import Grid from '../../../components/hoc/Grid';
import TextDisplay from '../../../components/basicComponents/TextDisplay';
import { headerText, subtitle1, marginBottom0 } from '../../../styles/StyleObjectProperties';
import { PREFERENCES_DATA } from '../../../utils/constants';

const PreferenceHeaderText = () => {

  return (
    <>
      <Grid container item lg={12} sm={12} xs={12}>
        <TextDisplay sx={headerText} text={PREFERENCES_DATA.title} />
      </Grid>
      <Grid container item lg={12} sm={12} xs={12}>
        <Grid item lg={8} sm={8} xs={8}>
          <TextDisplay variant="subtitle1" gutterBottom sx={{...subtitle1, ...marginBottom0}}
            text={PREFERENCES_DATA.subtitle}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default PreferenceHeaderText;