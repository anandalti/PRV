import React from "react";
import TextDisplay from "./TextDisplay";

const LabelWithInfo = (props) => {
  return (
    <div className="bprgrid" >
      
      <div style={props.style}>
        <p>{props?.label}</p>
      </div>
        {/* <TextDisplay {...props} text={props?.label} /> */}
    
    </div>
  );
};

LabelWithInfo.propTypes = {
  ...TextDisplay.propTypes,
};

export default LabelWithInfo;
