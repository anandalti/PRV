import { Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import WarningIcon from "@mui/icons-material/Warning";
import { ERROR_COLOR, SUCCESS_COLOR, WARNING_COLOR, WF_BACKEND_CONFIGURATION_FLAG } from "../../utils/constants";

const CustomToolTip = (props) => {
  const [tooltip, setTooltip] = useState(props?.infoText);
  const [errorFlag, setErrorFlag] = useState(false);
  const [warningFlag, setWarningFlag] = useState(false);
  const { genericErrors } = useSelector((state) => state.generic);


  useEffect(() => {
    // Reset the state if error is undefined, null, or empty array
    if (props?.error === undefined || props?.error === null || (Array.isArray(props?.error) && props?.error.length === 0)) {
      setErrorFlag(false);
      setWarningFlag(false);
      setTooltip(props?.infoText);
      return;
    }
  
    // If error is an array and has elements
    if (Array.isArray(props?.error) && props?.error.length > 0) {
      let errorType = [];
      let text = [];
      const errorSet = new Set();
      // console.log('In Tool 1111 >>>>>>>>>>>. ',props?.error)
      props?.error?.forEach((error, index) => {
        if (error.name === props?.fieldName) {
          errorType.push(error?.value?.error?.type);
          // console.log('In Tooltip >>>>>>>>> ',error?.value)
          let errorMessage;
          if (WF_BACKEND_CONFIGURATION_FLAG) {
            errorMessage = error?.value?.error?.description;
            // console.log('In tooltip >>>>>>>>> ',WF_BACKEND_CONFIGURATION_FLAG,errorMessage);
          }else{
            errorMessage = genericErrors.find((item) => item.key === error?.value?.error?.message)?.value;
          }
          errorMessage = errorMessage
            ? errorMessage
            : error?.value?.error?.message;
          
          if(error?.value?.dynamicFlag!==undefined && error?.value?.dynamicFlag==true){
            const data=error?.value?.data;
            if(data!==undefined){
              Object.keys(data)?.forEach((key,index)=>{
                errorMessage = errorMessage.replace(new RegExp(`<<\\$${key}>>`, 'g'), data[key]);
              })

            }
          }
          
          if (!errorSet.has(errorMessage)) {
            errorSet.add(errorMessage);
            text.push(
              <li
                key={`error${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  color:
                    error?.value?.error?.type === "warning"
                      ? WARNING_COLOR
                      : ERROR_COLOR,
                }}
              >
                <WarningIcon
                  style={{
                    marginRight: "5px",
                    fontSize: "18px",
                  }}
                />
                {errorMessage}
              </li>
            );
          }
        }
      });
  
      // Set error or warning flags based on errorType
      if (errorType.includes("error")) {
        setErrorFlag(true);
        setWarningFlag(false);
      } else if (errorType.includes("warning")) {
        setWarningFlag(true);
        setErrorFlag(false);
      } else {
        setErrorFlag(false);
        setWarningFlag(false);
      }
  
      setTooltip(<ul style={{ padding: 5, margin: 0 }}>{text}</ul>);
    } else if (!Array.isArray(props?.error)) {
      const localError =
        props?.error?.name === props?.fieldName ? props?.error?.value : null;
  
      if (localError !== undefined && localError !== null) {
        let text = localError?.error;
        setErrorFlag(true);
        setWarningFlag(false);  // Assuming a non-array error is always an error
        setTooltip(text);
      } else {
        setErrorFlag(false);
        setWarningFlag(false);
        setTooltip(props?.infoText);
      }
    }
  }, [props?.error, props?.infoText, genericErrors, props?.fieldName]);
  
  return (
    <Tooltip
      title={tooltip !== undefined && tooltip !== null ? tooltip : ""}
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: "white",
            color: `${errorFlag ? "#d31245" : warningFlag ? "#f9a825" : "black"}`,
            border: `1px solid ${errorFlag ? "#d31245" : warningFlag ? "#f9a825" : "#00aa7e"}`,
            padding: "10px",
            maxWidth: "28.125rem",
            overflow: "hidden",
          },
        },
        arrow: {
          sx: {
            color: `${errorFlag ? ERROR_COLOR : warningFlag ? WARNING_COLOR : SUCCESS_COLOR}`,
          },
        },
      }}
    >
      {(props.type && props.type==="image") ? props.children : <span>{props.children}</span>}
    </Tooltip>
  );
};

export default CustomToolTip;