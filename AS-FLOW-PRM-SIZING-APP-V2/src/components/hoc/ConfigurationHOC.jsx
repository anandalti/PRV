const ConfigurationHOC = ({className,children}) => {
  return (
    <>
        <div className={className}>
          <div className="configuration_item_header">
            <div></div>
            <div></div>
            {/* <div style={{fontWeight:600, textAlign:"end"}}>Custom</div> */}
          </div>
          {children }
        </div>
      
    </>
  )
}

export default ConfigurationHOC