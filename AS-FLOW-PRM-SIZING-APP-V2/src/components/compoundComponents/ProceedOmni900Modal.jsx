import Dialog from "../hoc/Dialog";
import styles from "../../styles/Home.module.css";
import { onUpdatePopupCounter, onUpdateProceedOmni900Modal } from "../../store/slices/workflowSlice";
// import useSaveSizing from "../../hooks/useSaveSizing";
import { useDispatch, useSelector } from "react-redux";
// import Radio from "../basicCsomponents/Radio";
import { useEffect, useState } from "react";
import { setSelectedResultRows } from "../../store/slices/workflowPayloadSlice";
import { OMNI900_POPUP_TEXT } from "../../utils/constants";

const ProceedOmni900Modal = ({proceedModalMessage}) => {
  const [valveModels, setValveModels] = useState([]);
  const [selectedValue,setSelectedValue]=useState("");
  const { popupCounter } = useSelector(state => state.workflow);
  const {selectedResultRows} = useSelector((state) => state.workflowPayload);
  const dispatch = useDispatch();
  // const { handleSaveWorkflowData } = useSaveSizing();
  
  
  useEffect(() => {
    if (selectedResultRows?.length>0) {
      const targetRow = selectedResultRows[popupCounter] ?? selectedResultRows[0];
      const ReResponse = JSON.parse(targetRow?.ReResponse ?? '{}');
      setValveModels(ReResponse?.valveModels);
      setSelectedValue(ReResponse?.valveModel??"")
    }
  }, []);

  const handleClose = () => {
    dispatch(onUpdateProceedOmni900Modal(false));
  };

  const handleOk = (item) => {
    // handleSaveWorkflowData(3);
    dispatch(onUpdatePopupCounter(popupCounter + 1));
    dispatch(onUpdateProceedOmni900Modal(false));
  };

  // console.log(selectedResultRows[0])

  const handleRadioChange = (value,label) => {
    setSelectedValue(value);
    const updatedRows = selectedResultRows.map((row, index) => {
      if (index === popupCounter) {
        const ReResponse = JSON.stringify({...JSON.parse(row?.ReResponse ?? '{}'), valveModel: value});
        return {...row, ReResponse};
      }
      return row;
    });
    // console.log('handleRadioChange >>>>>>>>>>>>>>>>> ',value,label,updatedRows);
    dispatch(setSelectedResultRows(updatedRows));
  }

  return (
    <div>
      <Dialog
        maxWidth="md"
        open={true}
        onClose={handleClose}
        title= {proceedModalMessage?.title} //"PRV2Size"
        draggable={false}
        children={
          
            <div>
              {/* <span className="proceed_text">{OMNI900_POPUP_TEXT}</span> */}
              <span className="proceed_text">{proceedModalMessage?.content?.text1}</span>
              {proceedModalMessage?.options?.length>0 &&
              proceedModalMessage?.options.map((model,index) =>{
                const modelLabel = model?.label ?? model;
                const modelValue = model?.value ?? model;
                return(
                  <div key={`radio-${modelValue}-${index}`} className='margin-left-10'>
                    <div className='radio-container-sub'>
                      <div className="grid-radio-div">
                          <input
                              type="radio"
                              id={`${modelValue}-${index}`}
                              name={modelValue}
                              value={modelValue}
                              checked={selectedValue === modelValue}
                              onChange={() => handleRadioChange(modelValue, modelLabel)}
                          />
                        <label htmlFor={modelValue} style={{fontSize:16}}>{modelLabel}</label>
                      </div>
                    </div>
                  </div>
                )
              })
              }
            </div>
         
        }
        buttons={[
          { label: `Ok`, onClick: handleOk, className: styles.footerButton },
          // { label: `Cancel`, onClick: handleClose, className: styles.footerButton },
        ]}
      />
    </div>
  );
};
export default ProceedOmni900Modal;
