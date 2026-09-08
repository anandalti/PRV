import ConfigurationHOC from '../hoc/ConfigurationHOC'
import ConfigCatelogERPCompo from './ConfigCatelogERPCompo'
import ConfigurationItemComponent from './ConfigurationItemComponent'
// import Grid from '../../../components/hoc/Grid'

const Configuration = ({configurationData}) => {
  return (
    <ConfigurationHOC className="configuration_item">
      <ConfigCatelogERPCompo/>
      
          {configurationData!==undefined && configurationData!==null && 
            configurationData?.ConfigurationSections?.map((section, index) => (
                <div key={`Configuration${index}`} >
                    <div className="configuration_item_content">
                        <ConfigurationItemComponent SectionData={section} />
                    </div>
                </div>
            ))
          }
          
    </ConfigurationHOC>
  )
}

export default Configuration