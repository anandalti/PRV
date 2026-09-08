import PropTypes from 'prop-types'

const ConfigureTab = ({menu,index,...props}) => {
  // console.log(props?.tabSelected,menu.id)
  return (
    <button 
        key={menu.id}
        // className={`tab-button ${menu.isCompleted ? menu.errorType==='warning'? 'warning tab_selected':menu.errorType==='error'?'tab':'active tab_selected' :  menu.errorType==='warning'?'warning tab_selected': 'tab'}`}
        className={props?.tabSelected?'configuration_nav active':'configuration_nav'}
        onClick={() => props.handleChange(menu, index)}
    >
        <span className="tab_text_header" >{menu.name}</span>
        
        
    </button>
  )
}

ConfigureTab.propTypes = {
    menu: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    image: PropTypes.string,
    handleChange: PropTypes.func.isRequired
  };
export default ConfigureTab