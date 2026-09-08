import TextDisplay from "../basicComponents/TextDisplay"

const HeaderTextComponents = (props) => {
    return (
  
      <div className={props?.popupFields?"grid-container-popup":"grid-container"} style={{display:"flex"}}>
          <div className="dropdown-container" style={props?.popupFields?{gridTemplateRows:"2fr 1fr 1fr"}:props?.style?{...props?.style}:{}}>
              <div className="dropdown grid-item-right">
                  
              </div>

              {
                Array.isArray(props?.label) && props?.label?.length>1?
                props?.label?.map((label,index) =>{ 
                   return (<div key={`${label}`} className="grid-item-left" >
                      <TextDisplay {...props} fontWeight={600} text={label} fontSize={props?.popupFields?14:16}/>
                  </div>)
        
                })
                :
                <div key={`${props?.label[0]}`} className="grid-item-left" style = {props?.style}>
                      <TextDisplay {...props} fontWeight={600} text={props?.label[0]} fontSize={props?.popupFields?14:16} />
                  </div>
              }
              
          </div>
      </div>
    )
  }

export default HeaderTextComponents