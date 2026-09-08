import Dialog from "../hoc/Dialog";
import styles from "../../styles/Home.module.css";
import useGenericValveSizing from "../../hooks/useGenericValveSizing";
import { useSelector } from "react-redux";
import DynamicGVSGrid from "./DynamicGVSGrid";
import useSaveSizing from "../../hooks/useSaveSizing";

const GenericValveSizingModal = () => {
  const { handleGenericValveSizing, submitSaveGVS, errorMsg } =
    useGenericValveSizing();
  const { gvsSections } = useSelector((state) => state.genericValveSizing);
  const handleClose = (_, reason) => {
    if (reason && reason === "backdropClick") return;
    handleGenericValveSizing();
  };
  const { handleSaveSizingData } = useSaveSizing();
  return (
    <div>
      <Dialog
        maxWidth="lg"
        open={true}
        onClose={handleClose}
        title="Generic Valve Sizing (Pressure Relief)"
        draggable={false}
        className="gvs-dialog-block"
        children={
          <>
            {gvsSections && gvsSections.length && <DynamicGVSGrid />}
            {errorMsg && <span className={styles.errorClass}>{errorMsg}</span>}
          </>
        }
        buttons={[
          {
            label: `Ok`,
            onClick: () => {
              handleSaveSizingData(2, true, true);
              handleClose();
            },
            className: styles.footerButton,
          },
          {
            label: `Cancel`,
            onClick: handleClose,
            className: styles.footerButton,
          },
        ]}
      />
    </div>
  );
};
export default GenericValveSizingModal;
