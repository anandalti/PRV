import Dialog from "../hoc/Dialog";
import styles from "../../styles/Home.module.css";
import { onUpdatePopupCounter, onUpdateProceedModal } from "../../store/slices/workflowSlice";
import useSaveSizing from "../../hooks/useSaveSizing";
import { Esclamation_Image, LINK_FOR_9300H } from "../../utils/constants";
import { useDispatch, useSelector } from "react-redux";

const ProceedModal = ({proceedModalMessage}) => {
  const dispatch = useDispatch();
  const { popupCounter } = useSelector(state => state.workflow);
  const { handleSaveWorkflowData } = useSaveSizing();
  
  const handleClose = () => {
    dispatch(onUpdateProceedModal(false));
  };

  

  const handleOk = (item) => {
    // handleSaveWorkflowData(3);
    dispatch(onUpdatePopupCounter(popupCounter + 1));
    dispatch(onUpdateProceedModal(false));
  };

  // const handle9300HClick = () => {
  //   window.open(LINK_FOR_9300H, "_blank");
  // };
  return (
    <div>
      <Dialog
        maxWidth="md"
        open={true}
        onClose={handleClose}
        title={proceedModalMessage.title} //"PRV2Size"
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
              {
                proceedModalMessage?.content.map((item, index) => {
                  return (<>
                    <span className="proceed_text">{item}</span>
                    {proceedModalMessage?.content?.length-1 !==index && <br />}
                    </>
                  )
                })
              }
              {/* <span className="proceed_text">NOTE: Although ASME Code Section I(V), PG-69.1.6 allows the use of direct spring loaded relief valves for economizer spring service, Crosby® style HSJ safety valves are not capacity certified on water.</span><br/>
              <span className="proceed_text">Emerson Automation Solutions suggests the use of Anderson Greenwood Series 5200 modulating pilot operated safety relief valves for economizer service applications covered by ASME Code Section I(V). Futher information can be found in catalog VCTDS-00803.</span> */}
              {/* <span className="proceed_text">The <span className="proceed_link" onClick={handle9300HClick}>9300H sizing tool</span> can be used to check. </span> */}
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
export default ProceedModal;
