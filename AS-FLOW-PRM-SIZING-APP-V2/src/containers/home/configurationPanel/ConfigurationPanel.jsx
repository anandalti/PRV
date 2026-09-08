// import ConfigCatelogERPCompo from "../../../components/compoundComponents/ConfigCatelogERPCompo";
import Grid from "../../../components/hoc/Grid";
import useConfigurationPanel from "../../../hooks/useConfigurationPanel";
import Accessories from "../../../components/compoundComponents/Accessories";
import Configuration from "../../../components/compoundComponents/Configuration";
import SpecialRequirements from "../../../components/compoundComponents/SpecialRequirements";
import ConfigurationNotes from "../../../components/compoundComponents/ConfigurationNotes";
import ValveCalculations from "../../../components/compoundComponents/ValveCalculations";
import ValveDimensions from "../../../components/compoundComponents/ValveDimensions";
import ValveFeatures from "../../../components/compoundComponents/ValveFeatures";
import CustomConfigurations from "../../../components/compoundComponents/CustomConfigurations";



const ConfigurationPanel = () => {
    const { configurationData,configTabSelected } = useConfigurationPanel();

    const filterComponent = () => {
      if(configTabSelected===1){
        return <Configuration configurationData={configurationData} />
      }else if(configTabSelected===2){
        return <CustomConfigurations configurationData={configurationData} />
      }else if(configTabSelected===3){
        return <Accessories configurationData={configurationData} />
      }else if(configTabSelected===4){
        return <SpecialRequirements configurationData={configurationData} />
      }else if(configTabSelected===5){
        return <ConfigurationNotes configurationData={configurationData} />
      }else if(configTabSelected===6){
        return <ValveCalculations configurationData={configurationData} />
      }else if(configTabSelected===7){
        return <ValveDimensions configurationData={configurationData} />
      }else if(configTabSelected===8){
        return <ValveFeatures configurationData={configurationData} />
      }
    }
  return (
    <>    
      
      <div style={{ display: "flex",
            alignItems: "center",justifyContent: "space-between"}}>
        <h2 className="menu_header">Configuration</h2>
        <p className="menu_subheader">
            <span>Model: </span>
            {configurationData!==null ? configurationData?.ModelNumber:''}
        </p>
        
      </div>
      <Grid item sm={9}>
        {filterComponent()}
      </Grid>
      <Grid item sm={3}>

      </Grid>
      </>

  )
}

export default ConfigurationPanel