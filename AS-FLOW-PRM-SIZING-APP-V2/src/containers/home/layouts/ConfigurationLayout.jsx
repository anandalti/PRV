import Grid from '../../../components/hoc/Grid'
import ConfigurationPanel from '../configurationPanel/ConfigurationPanel'
import NavigationConfiguration from '../navigation/NavigationConfiguration'

const ConfigurationLayout = () => {
  return (
    <Grid container style={{"background": "whitesmoke","marginTop":"16px"}}>
        <Grid item sm={2}>
              <NavigationConfiguration />
        </Grid>
        <Grid item sm={10}>
          <ConfigurationPanel />
        </Grid>
        
    </Grid>
  )
}

export default ConfigurationLayout