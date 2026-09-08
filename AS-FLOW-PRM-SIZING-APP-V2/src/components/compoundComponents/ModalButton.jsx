import Button from '../basicComponents/Button';
import ToolTip from '../basicComponents/ToolTip';
import styles from '../../styles/Home.module.css';
import ArrowUpwardSharpIcon from '@mui/icons-material/ArrowUpwardSharp';
import ArrowDownwardSharpIcon from '@mui/icons-material/ArrowDownwardSharp';
import {onUpdateWorldMapModal, setEnterTankData} from '../../store/slices/workflowSlice'
import { useDispatch } from 'react-redux';

const ModalButton = (props) => {
    const dispatch = useDispatch();
  // console.log('ModalButton >>>>>>>>>',props)
  let disabled = (typeof props?.disabled === 'object' && props.disabled !== null)
  ? props.disabled[Object.keys(props.disabled)[0]]
  : props.disabled;
  const handleClick=()=>{
    //props?.onChange({action:{...props?.action}})
    if(props.fieldName=='WorldMap'){
        dispatch(onUpdateWorldMapModal(true))
    }else{
        // console.log('Popup Change 11111 >>>>>>>>>>>> 9999999 >>> MOdal >>>>>>>>> ',props?.fieldName,props?.value);
        props?.onChange({
          name:props.fieldName, 
          value:!props.value,
          sectionId: props?.sectionId,
          validatefield: props?.isValidationRequired,
          type:props?.type
        });
        if(props.fieldName=='EnterTankData'){
          dispatch(setEnterTankData(!props.value));
        }
    }

  }
  return (
    <ToolTip infoText={props?.infoText}>
      <Button disabled={disabled} onClick={handleClick}  className={`${styles.modalButton}`} 
      startIcon={props?.popupFields?typeof props?.label==="object"?props.value?<ArrowUpwardSharpIcon/>:<ArrowDownwardSharpIcon/>:null:null}
        // startIcon={props?.popupFields?typeof props?.label==="object"?{<ArrowUpwardSharpIcon/>}:<ArrowDownwardSharpIcon/> :null:null}
      >
        {props?.popupFields?typeof props?.label==="object"?props.value?props?.label['trueValue']:props?.label['falseValue'] :props?.label :props?.label}
      </Button>
    </ToolTip>
  )
}

export default ModalButton