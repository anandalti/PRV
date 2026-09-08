import Tab from "../basicComponents/Tab"


const TabData = (props) => {
  return (
    <div className={props.isCompleted?"tab_selected":"tab"} >
        <Tab {...props}/>
    </div>
  )
}

export default TabData