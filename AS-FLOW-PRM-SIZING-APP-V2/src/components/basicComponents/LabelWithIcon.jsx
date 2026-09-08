import React from "react";
import TextDisplay from "./TextDisplay";
import checkIcon from "../../assets/check.png";
import '../../App.css'; 

const LabelWithIcon = (props) => {
  return (
    <div className="iconwithnote" style={props?.popupFields?{width:"31rem"}:{}}>
      <div className="icondiv">
        <img src={props?.iconlocation? props.iconlocation:checkIcon} alt="Icon" className="imagdiv" />
      </div>
      <div>
        <TextDisplay text={props?.label} fontSize={props?.popupFields?14:16}/>
      </div>
    </div>
  );
};

LabelWithIcon.propTypes = {
  ...TextDisplay.propTypes,
};

export default LabelWithIcon;
