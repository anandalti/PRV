import PropTypes from 'prop-types'


const Tab = ({ menu, index, ...props }) => {
    return (
        <button
            key={menu.id}
            className={`tab-button ${menu.isCompleted ? menu.errorType === 'warning' ? 'warning tab_selected' : menu.errorType === 'error' ? 'tab' : 'active tab_selected' : menu.errorType === 'warning' ? 'warning tab_selected' : 'tab'}`}
            onClick={() => props.handleChange(menu, index)}
            disabled={menu.disabled}
        >
            <span className={"tab_text_header"} >{menu.name}</span>
        </button>
    )
};

Tab.propTypes = {
    menu: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    handleChange: PropTypes.func.isRequired
};

export default Tab;