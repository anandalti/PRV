import PropTypes from 'prop-types'
import usePreferenceTabSelection from '../../../hooks/usePreferenceTabSelection';

const PreferenceTab = ({menu,index,...props}) => {
    const { tabValues }=usePreferenceTabSelection();
    const nextMenuId = menu.id + 1; 
    return (
      <button 
          key={menu.id}
          className={`tab-button ${menu.isCompleted ? 'active tab_selected' : 'tab'}`}
          onClick={() => props.handleChange(null, index+1)}
      >
          <span className="tab_text_header">{menu.name}</span>
          {
            tabValues[nextMenuId]?.map((field,i)=><span key={i} 
                                      className={`tab_text_multi_value ${field.mandatory===true && (field.value==='' || field.isError) && 'mandatory_color'}`}>
                                      {field.value===true?field.name:`${field.name}: ${field.value}`}
                                    </span>)
          }
      </button>
    )
  };

PreferenceTab.propTypes = {
  menu: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  subHeader: PropTypes.object,
  handleChange: PropTypes.func.isRequired
};

export default PreferenceTab;