import PropTypes from "prop-types";
import { DIMENSION_SEPARATOR } from "../../utils/constants";
import { useDispatch } from "react-redux";
// import { changeLayout } from "../../store/slices/layoutSlice";

const DropDown = (props) => {
  const dispatch = useDispatch();

  // console.log('selectedValue >>>>>>>>>>>>>>>>>>> ',props.value,props)

  const handleDropDownSelect = (e) => {
    const selectedValue = props?.options?.find(
      (item) => item.value == e.target.value
    );
    
    // console.log('selectedValue >>>>>>>>>>>>>>>>>>> ',selectedValue,props.configflag,props, props?.advancedProps && props?.advancedProps==false &&
        // selectedValue.label !== DIMENSION_SEPARATOR,props?.type=='select');

    if (selectedValue !== undefined && selectedValue !== null) {
      if(props?.configflag){
        props?.onChange({
          name: props?.fieldName,
          value: e.target.value,
          mandatory: props?.mandatory,
          prevUom: props?.value,
          UomFieldName: props?.UomFieldName,
          sectionId: props?.sectionId
        });
      
      }else if (
        props?.advancedProps && props?.advancedProps==false &&
        selectedValue.label !== DIMENSION_SEPARATOR
      ) {
        props?.onChange({
          name: props?.fieldName,
          value: e.target.value,
          mandatory: props?.mandatory,
          prevUom: props?.value,
          UomFieldName: props?.UomFieldName,
          sectionId: props?.sectionId
        });
      // }else if(props?.type=='select'){
      }else{
        // console.log('selectedValue >>>>>>>>>>>>>>>>>>> 222222',selectedValue,props.type,props)
        props?.onChange({
          name: props?.fieldName,
          value: e.target.value,
          type: props?.type,
          mandatory: props?.mandatory,
          prevUom: props?.value,
          UomFieldName: props?.UomFieldName,
          sectionId: props?.sectionId
        });
      }
    }
    // if (props?.advancedProps?.handleChange) {
    //   props?.advancedProps?.handleChange(e, Number(e?.target?.value));
    //   if (props?.advancedProps?.tabId === 3) {
    //     dispatch(changeLayout(false));
    //     setTimeout(() => dispatch(changeLayout(true)), 1);
    //   }
    // }
  };
  return (
    <div
      className="dropdown"
      style={
        props?.styles !== undefined ? props?.styles : { width: props.width }
      }
    >
      <select
        className={props?.configflag?props?.SectionStatus=='error'?"dropbtn-config dropdown-option-error":"dropbtn-config dropdown-option-enabled":props?.popupFields ? "dropbtn-popup" : "dropbtn"}
        disabled={props?.disabled}
        value={props.value}
        title={props?.title}
        onChange={handleDropDownSelect}
      >
        {props?.advancedProps?.defaultLabel && (
          <option className="dropdown-option" value="" hidden>
            {props.advancedProps.defaultLabel}
          </option>
        )}
        {props?.options?.map((item, index) => {
        
            return (
              <option
                className={props?.configflag?item?.isSelected==true && item?.status=='error'?"dropdown-option-error":item?.status=='disabled'?"dropdown-option-disabled":"dropdown-option dropdown-option-enabled":"dropdown-option"}
                key={`${item.value}-${index}`}
                value={item.value}
              >
                {item.label}
              </option>
            );

        })}
      </select>
    </div>
  );
};

DropDown.propTypes = {
  value: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      valueId: PropTypes.string,
    })
  ),
  width: PropTypes.string,
};

export default DropDown;
