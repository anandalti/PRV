
import ConfigurationHOC from '../hoc/ConfigurationHOC'
import AllowMultiSingleComponent from './AllowMultiSingleComponent'

const SpecialRequirements = ({configurationData}) => {
  return (
    
        <ConfigurationHOC className="configuration_item">
          {configurationData!==undefined && configurationData!==null && 
            configurationData?.ConfigurationSections
            ?.map((section, index) => (
                <div key={`SplRequirements${index}`} >
                    <div className="configuration_item_content">
                    <AllowMultiSingleComponent SectionData={section} />
                    </div>
                </div>
            ))
          }
        </ConfigurationHOC>
  )
}

export default SpecialRequirements