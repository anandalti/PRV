import Dialog from "../hoc/Dialog";
import styles from "../../styles/Home.module.css";
import { onUpdatePopupCounter, onUpdateProceed93XXModal } from "../../store/slices/workflowSlice";
// import useSaveSizing from "../../hooks/useSaveSizing";
import { Esclamation_Image, LINK_FOR_9300H } from "../../utils/constants";
import { useDispatch } from "react-redux";
const Proceed93XXModal = ({ proceedModalMessage }) => {
  const dispatch = useDispatch();
  const { popupCounter } = useSelector(state => state.workflow);
  // const { handleSaveWorkflowData } = useSaveSizing();
  
  const handleClose = () => {
    dispatch(onUpdateProceed93XXModal(false));
  };

  const handleOk = (item) => {
    // handleSaveWorkflowData(3);
    dispatch(onUpdatePopupCounter(popupCounter + 1));
    dispatch(onUpdateProceed93XXModal(false));
  };

  const handle9300HClick = () => {
    window.open(LINK_FOR_9300H, "_blank");
  };
  return (
    <div>
      <Dialog
        maxWidth="md"
        open={true}
        onClose={handleClose}
        title= {proceedModalMessage?.title}//"PRV2Size"
        draggable={false}
        children={
          <div className="proceed93XX_div">
            <>
              <img
                className="proceed_img_center"
                src={Esclamation_Image}
                alt="exclamation"
              />
            </>
            <div>
              {/* <span className="proceed_text">NOTE: A better solution may be available using a 9300H.</span>
              <span className="proceed_text">The <span className="proceed_link" onClick={handle9300HClick}>9300H sizing tool</span> can be used to check. </span> */}
              <span className="proceed_text">{proceedModalMessage?.content?.text1}</span>
              <span className="proceed_text">{proceedModalMessage?.content?.text2?.contentList[0]} <span className="proceed_link" onClick={handle9300HClick}>{proceedModalMessage?.content?.text2?.contentList[1]}</span>{proceedModalMessage?.content?.text2?.contentList[2]}</span>
            </div>
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
export default Proceed93XXModal;
