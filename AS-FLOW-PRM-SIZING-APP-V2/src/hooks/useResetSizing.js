import { useDispatch, useSelector } from "react-redux";
import { setPayloadData } from "../store/slices/workflowPayloadSlice";
import {
  onClearSizingData,
  onUpdateResetSizingModal,
  resetSelectedFields,
} from "../store/slices/workflowSlice";

import {
  onSelectMenu,
  resetNavigationMenu,
} from "../store/slices/navigationSlice";
import { updateSnakebar } from "../store/slices/preferenceSlice";
import { onClear as gvsOnClear } from "../store/slices/genericValveSizingSlice";

const useResetSizing = () => {
  const dispatch = useDispatch();
  const { selectedFields } = useSelector((state) => state.workflow);
  const { rolesData } = useSelector((state) => state.auth);

  const handleCloseResetSizingModal = (type) => {
    dispatch(
      onUpdateResetSizingModal({ status: false, type, message: "", title: "" })
    );
    if (type !== null && type !== "") {
      let msg = "";
      if (type === "CLOSE") {
        msg = `Sizing tool is closed successfully.`;
      } else {
        msg = `Sizing details are cleared successfully.`;
      }
      dispatch(
        updateSnakebar({ status: true, message: msg, severity: "success" })
      );
      if (type === "CLOSE") {
        window.location.reload();
      }
    }
  };

  const resetSizingData = (type) => {
    if (type === "CLEAR") {
      dispatch(setPayloadData({}));
      // dispatch(resetSelectedFields());
      dispatch(onClearSizingData());
      dispatch(onSelectMenu(0));
      dispatch(resetNavigationMenu());
      dispatch(gvsOnClear());
      handleCloseResetSizingModal(type);
    } else {
      // console.log('userRole >>>> Sizing Details Closed >>>>>>>>>>>> ',rolesData);
      rolesData.userDetails.userMailId === "localUser"
        ? handleCloseResetSizingModal(type)
        : rolesData["tools"] === "tools"
        ? backToTools()
        : backToSource();
    }
  };

  const handleClearSizingDetails = () => {
    // dispatch(clearPayloadData());
    if (selectedFields.length > 0) {
      dispatch(
        onUpdateResetSizingModal({
          status: true,
          type: "CLEAR",
          message: "Are you sure you want to clear the sizing details?",
          title: "Clear Sizing Details",
        })
      );
    } else {
      const msg = `No Sizing details available to clear.`;
      dispatch(
        updateSnakebar({ status: true, message: msg, severity: "info" })
      );
    }
  };

  const handleCloseSizingDetails = () => {
    dispatch(
      onUpdateResetSizingModal({
        status: true,
        type: "CLOSE",
        message: "Are you sure you want to close the sizing tool?",
        title: "Close Sizing Tool",
      })
    );
  };

  return {
    resetSizingData,
    // closeSizingDetails,
    handleCloseSizingDetails,
    handleClearSizingDetails,
    handleCloseResetSizingModal,
  };
};

export default useResetSizing;
