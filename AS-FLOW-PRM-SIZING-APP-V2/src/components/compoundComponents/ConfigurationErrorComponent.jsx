import useConfigurationPanel from "../../hooks/useConfigurationPanel"

const ConfigurationErrorComponent = () => {
    const {configurationErrors}=useConfigurationPanel();
  return (
    <>{configurationErrors?.length>0 && 
        <div>
            
        </div>
    }</>
  )
}

export default ConfigurationErrorComponent