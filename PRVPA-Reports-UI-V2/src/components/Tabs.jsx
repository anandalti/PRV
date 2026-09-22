const Tabs = ({children}) => {
    return (
      <div className="tabs">
          <div className="tab-list">
              {children}
           </div>
      </div>
    )
  }
  
  export default Tabs;