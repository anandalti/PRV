import PropTypes from 'prop-types'
import useTabSelection from '../../hooks/useTabSelection';
import { RESULT_PAGE_TITLE } from '../../utils/constants';

const Tab = ({menu,index,...props}) => {
  const { tabValues }=useTabSelection(index);

  
  return (
    <button 
        key={menu.id}
        className={`tab-button ${menu.isCompleted ? menu.errorType==='warning'? 'warning tab_selected':menu.errorType==='error'?'tab':'active tab_selected' :  menu.errorType==='warning'?'warning tab_selected': 'tab'}`}
        onClick={() => props.handleChange(menu, index)}
    >
        <span className={menu.name===RESULT_PAGE_TITLE?"tab_text_header_disabled":"tab_text_header"} >{menu.name}</span>
        {menu.id<=3?
          <span className="tab_text_paragraph" aria-disabled={menu.name===RESULT_PAGE_TITLE}>{tabValues}</span>:
          menu.name!==RESULT_PAGE_TITLE && tabValues[menu.id]?.map((field,i)=>
                                  { 
                                    //console.log('In Sidebar >>>>>>>>>>> ',field?.name,field?.errorFlag,field,`tab_text_multi_value ${field?.specialFlag===false?'font-500':field?.specialFlag===true ? 'margin-10':''} ${field.mandatory===true && field.value===''?'mandatory_color': field.mandatory===true && field?.errorFlag===true ?'mandatory_color':''}`)
                                  return (<span key={i} 
                                    className={`tab_text_multi_value ${field?.specialFlag===false?'font-500':field?.specialFlag===true ? 'margin-10':''} ${field.mandatory===true && field.value===''?'mandatory_color': field.mandatory===true && field?.errorFlag===true ?'mandatory_color':''}`}>
                                    { field?.specialFlag===false?field.name:`${field.name}: ${field.value}`}
                                  </span>)})
        }
    </button>
  )
};

Tab.propTypes = {
  menu: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  subHeader: PropTypes.object,
  handleChange: PropTypes.func.isRequired
};

export default Tab;