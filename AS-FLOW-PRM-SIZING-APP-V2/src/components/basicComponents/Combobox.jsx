import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ToolTip from "./ToolTip";
import FormFieldsInput from "../hoc/FormFieldsInput";
import { isNumber } from "mathjs";

const Combobox = (props) => {
  // console.log('In combobox >>>>>>>>>>>> ',props?.fieldName,props?.value)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [optionList, setOptionList] = useState(props?.options);
  const [allOptions, setAllOptions] = useState(props?.options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // State for highlighted option
  const inputRef = useRef(null); // Ref to manage focus on the input field
  const [value, setValue] = useState("");

  useEffect(() => {
    if (props?.value && isNumber(Number(props?.value))) {
      setValue(
        props?.options?.find((obj) => obj.value === props?.value)?.label
      );
    } else setValue(props?.value);
  }, [props?.value, props?.options]);

  const handleChange = (value, userSelection) => {
    // console.log('In combobox handleChange >>>>>>>>>>>>>>>>>>',value,props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onChange'),userSelection)
    setOptionList(
      allOptions.filter((option) => {
        if (option.label.toLowerCase().startsWith(value.toLowerCase())) {
          return option;
        }
      })
    );
    const selectedOption=props?.options?.find((obj) => obj.label.toLowerCase() === value.toLowerCase());
    setValue(value);
    if (userSelection) {
      props?.onChange({ name: props?.fieldName, value, 
        id: selectedOption?.GasId ?? selectedOption?.SteamId ?? selectedOption?.LiquidId,
        type: "combobox",
        validatefield: props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onChange') ? true : false,
        fieldId:props?.fieldId,
        sectionId:props?.sectionId,
        actionId:props?.actionId,
        isFieldActionRequired:props?.isFieldActionRequired,  
       });
    } else {
      if (!value) {
        props?.onChange({
          name: props?.fieldName,
          id: selectedOption?.GasId ?? selectedOption?.SteamId ?? selectedOption?.LiquidId,
          value: "",
          type: "combobox",
          validatefield: props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onChange') ? true : false,
                fieldId:props?.fieldId,sectionId:props?.sectionId,actionId:props?.actionId,isFieldActionRequired:props?.isFieldActionRequired,  
        });
      }
    }
    // props?.onBlur({ name: props?.fieldName, value });
    setHighlightedIndex(-1); // Reset the highlighted index when the user types
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prevIndex) => {
          const nextIndex =
            prevIndex === optionList.length - 1 ? 0 : prevIndex + 1;
          scrollToOption(nextIndex);
          return nextIndex;
        });
        setIsDropdownVisible(true);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prevIndex) => {
          const nextIndex =
            prevIndex <= 0 ? optionList.length - 1 : prevIndex - 1;
          scrollToOption(nextIndex);
          return nextIndex;
        });
        setIsDropdownVisible(true);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < optionList.length) {
          handleChange(optionList[highlightedIndex].value);
          setIsDropdownVisible(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsDropdownVisible(false);
        break;
      default:
        break;
    }
  };

  const scrollToOption = (index) => {
    const optionElement = document.querySelector(
      `.input-ul li:nth-child(${index + 1})`
    );
    if (optionElement) {
      optionElement.scrollIntoView({ block: "nearest" });
    }
  };

  useEffect(() => {
    if (isDropdownVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDropdownVisible]);

  useEffect(() => {
    setOptionList(props?.options);
    setAllOptions(props?.options);
  }, [props?.options]);

  const handleOnBlur = (e) => {
    // console.log('In combobox onBlur>>>>>>>>>>. ',value)
    setTimeout(() =>{ 
      setIsDropdownVisible(false);
      const selectedOption=props?.options?.find((obj) => obj.label.toLowerCase() === e.target.value.toLowerCase());
      props?.onChange({
          name: props?.fieldName,
          value: e.target.value,
          id: selectedOption?.GasId ?? selectedOption?.SteamId ?? selectedOption?.LiquidId ?? "",
          type: "combobox",
          validatefield: props?.isValidationRequired && (props?.validateActionType=='both' || props?.validateActionType=='onBlur') ? true : false,
          fieldId:props?.fieldId,
          sectionId:props?.sectionId,
          actionId:props?.actionId,
          isFieldActionRequired:props?.isFieldActionRequired,  
        });
      
    
    }, 300);
    // handleChange(e.target.value);
    // setIsDropdownVisible(false);
  };

  // console.log('In combobox >>>>>>>>>>. ',props)
  return (
    <>
      {props?.fieldName !== "Blank" && (
        <ToolTip {...props} infoText={undefined} fieldName={props?.fieldName}>
          <div className="input-wrapper" aria-disabled={props?.disabled}>
            <input
              id={`combobox-${props?.fieldName}`}
              type="text"
              value={value || props?.value}
              ref={inputRef}
              disabled={props?.disabled}
              autoComplete="off"
              onChange={(e) => handleChange(e.target.value,true)}
              onFocus={() => {
                setIsDropdownVisible(true);
                setOptionList(allOptions);
              }}
              onBlur={(e) => setTimeout(() => handleOnBlur(e), 300)}
              onKeyDown={handleKeyDown} // Attach the keydown handler
              // className={props?.className !== undefined ? props?.className : `input-field${props?.error !== undefined && props?.error !== null && props?.error?.length > 0 ? "-error" : props?.mandatory ? "-mandatory" : ""}`}
              className={
                props?.className !== undefined
                  ? props.className
                  : `input-field${
                      props?.error?.find(
                        (err) => err?.value?.error?.type === "error"
                      )
                        ? "-error"
                        : props?.error?.find(
                            (err) => err?.value?.error?.type === "warning"
                          )
                        ? "-warning"
                        : props?.mandatory
                        ? "-mandatory"
                        : ""
                    }`
              }
              style={props?.style}
            />
            {optionList.length > 0 && !props?.disabled && (
              <KeyboardArrowDownIcon className="input-arrow" />
            )}
          </div>
          {isDropdownVisible && optionList.length > 0 && (
            <ul
              className="input-ul"
              aria-disabled={props?.disabled}
              onMouseDown={(e) =>
                e.target.nodeName === "UL" && e.preventDefault()
              }
            >
              {optionList?.map((option, index) => (
                <li
                  key={index}
                  onClick={() => handleChange(option.value, true)}
                  style={{
                    cursor: "pointer",
                    padding: "2px 5px",
                    backgroundColor:
                      highlightedIndex === index ? "#e6e6e6" : "transparent", // Highlight the option if it matches the highlightedIndex
                  }}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </ToolTip>
      )}
    </>
  );
};

Combobox.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      fieldName: PropTypes.string,
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  fieldName: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.array,
  className: PropTypes.string,
  style: PropTypes.object,
  mandatory: PropTypes.bool,
};

export default Combobox;

// import { useState } from 'react';
// import PropTypes from 'prop-types';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// const Combobox = (props) => {
//   const [isDropdownVisible, setIsDropdownVisible] = useState(false);
//   const [optionList, setOptionList] = useState(props?.options);
//   // console.log('In Combobox 11111 >>>>>>>>>>>>>>>>>>',props,props?.fieldName)
//   const handleChange = (value) => {
//     // console.log('In Combobox handleChange >>>>>>>>>>>>>>>>>>',value,props?.fieldName)

//     props?.onChange({name:props?.fieldName,value:value});
//     setIsDropdownVisible(false);
//   };

//   const handleChangeInput = (value) => {
//     if(value.length===0){
//       setOptionList(props?.options);
//     }else{
//       const localOptions=optionList?.filter((item)=>item.label.toLowerCase().startsWith(value.toLowerCase()));
//       console.log(' in input >>>> ',value,localOptions)
//       setOptionList(localOptions);
//     }
//     props?.onChange({name:props?.fieldName,value:value});
//   }

//   return (
//     <div className='grid-item-left' style={{ position: 'relative', width:"10rem"}}>
//           {props?.fieldName!=='Blank' && <>
//             <div className="input-wrapper" aria-disabled={props?.disabled}>
//               <input
//                 id={`combobox-${props?.fieldName}`}
//                 type="text"
//                 value={props?.value}
//                 disabled={props?.disabled}
//                 autoComplete="off"
//                 onChange={(e)=> handleChange(e.target.value)}
//                 onFocus={() => setIsDropdownVisible(true)}
//                 onBlur={() => setTimeout(() => setIsDropdownVisible(false), 300)}
//                 className={props?.className!==undefined? props?.className:`input-field${props?.error!==undefined && props?.error!==null && props?.error?.length>0?"-error":props?.mandatory?"-mandatory":""}`}
//                 style={props?.style}
//               />
//               <KeyboardArrowDownIcon className="input-arrow" />
//             </div>
//             {isDropdownVisible && (
//               <ul className='input-ul' aria-disabled={props?.disabled}>
//                 {optionList?.map((option, index) => (
//                   <li key={index} onClick={() => handleChange(option.value)} style={{ cursor: 'pointer', padding: '2px 5px' }}>
//                     {option.label}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </>
//           }
//         </div>

//   );
// };

// Combobox.propTypes = {
//   options: PropTypes.arrayOf(PropTypes.shape({
//     fieldName: PropTypes.string,
//     label: PropTypes.string.isRequired,
//     value: PropTypes.string.isRequired,
//   }))
// };

// export default Combobox;
