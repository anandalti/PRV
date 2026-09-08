import React from 'react'
import ConfigurationHOC from '../hoc/ConfigurationHOC'
import ConfigCatelogERPCompo from './ConfigCatelogERPCompo'
import AccessoriesItemComponent from './AllowMultiSingleComponent'
import AllowMultiSingleComponent from './AllowMultiSingleComponent'

const Accessories = ({configurationData}) => {
  return (
    <ConfigurationHOC className="configuration_item_accessory">
      <ConfigCatelogERPCompo/>
      {configurationData!==undefined && configurationData!==null && 
            configurationData?.ConfigurationSections
            ?.map((section, index) => (
                <div key={`Accessories${index}`} >
                    <div className="configuration_item_content">
                        <AllowMultiSingleComponent SectionData={section} />
                    </div>
                </div>
            ))
      }
      
    </ConfigurationHOC>
  )
}

export default Accessories