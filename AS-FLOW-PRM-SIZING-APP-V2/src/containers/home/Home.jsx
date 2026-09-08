import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../header/Header";
// import Footer from "../footer/Footer";
import BasicViewLayout from "./layouts/BasicViewLayout";
import AdvancedViewLayout from "./layouts/AdvancedViewLayout";
import {
  fetchWorkflows,
  searchSizingBySizingId,
} from "../../store/slices/workflowSlice";
import { Container } from "@mui/material";
import { paddingZero } from "../../styles/StyleObjectProperties";
import { fetchUom } from "../../store/slices/uomSlice";
import { fetchPreferenceSections } from "../../store/slices/preferenceSlice";
import { fetchFluids, fetchErrors } from "../../store/slices/genericSlice";
import { getUpdatedDefaultUnits } from "../../utils/utility";
import { onUpdateDefaultUnits } from "../../store/slices/uomSlice";
import WorldMap from "../../components/compoundComponents/WorldMap";
import SearchSizingModal from "../../components/compoundComponents/SearchSizingModal";
import AlertModal from "../../components/compoundComponents/AlertModal";
import GenericValveSizingModal from "../../components/compoundComponents/GenericValveSizingModal";
import Proceed93XXModal from "../../components/compoundComponents/Proceed93XXModal";
import ProceedOmni900Modal from "../../components/compoundComponents/ProceedOmni900Modal";
import ProceedModal from "../../components/compoundComponents/ProceedModal";
import FullScreenSpinner from "../../components/basicComponents/FullScreenSpinner";
import RestrictedLiftModal from "../../components/compoundComponents/RestrictedLiftModal";

const Home = () => {
  const { isAdvanced } = useSelector((state) => state.layout);

  const { preferences, rolesData, userData } = useSelector((state) => state.auth);
  const { defaultUnits, units } = useSelector((state) => state.uom);
  const { workflows } = useSelector((state) => state.workflow);
  const { preferenceSections } = useSelector((state) => state.preference);
  const { fluids, genericErrors } = useSelector((state) => state.generic);
  const { gvsModal } = useSelector((state) => state.genericValveSizing);
  const {
    worldMapModal,
    searchSizingModal,
    proceed93XXModal,
    proceedOmni900Modal,
    proceedModal,
    proceedModalMessage,
    RLProceedModal,
    resetSizingModal,
    apiLoadingSpinner
  } = useSelector((state) => state.workflow);
  const dispatch = useDispatch();
  useEffect(() => {
    // dispatch(fetchWorkflows());
    // dispatch(fetchPreferenceSections());
    //dispatch(fetchUom());
    if (workflows.length === 0) {
      dispatch(fetchWorkflows(userData?.EmailId));
    }
    if (preferenceSections.length === 0) {
      dispatch(fetchPreferenceSections(userData?.EmailId));
    }
    if (Object.keys(units).length === 0) {
      dispatch(fetchUom(userData?.EmailId));
    }
    if (Object.keys(fluids).length === 0) {
      dispatch(fetchFluids(userData?.EmailId));
    }
    if (genericErrors === null) {
      dispatch(fetchErrors(userData?.EmailId));
    }
    const updatedDefaultUnits = getUpdatedDefaultUnits(
      defaultUnits,
      preferences
    );
    if (updatedDefaultUnits) {
      dispatch(onUpdateDefaultUnits(updatedDefaultUnits));
    }
  }, [dispatch]);

  useEffect(() => {
    if (workflows.length > 0 && !!rolesData?.uniqueId) {
      dispatch(searchSizingBySizingId(rolesData.uniqueId));
    }
  }, [workflows]);

  return (
    <Container maxWidth={"lg"} sx={paddingZero}>
      <Header />
      {apiLoadingSpinner && <FullScreenSpinner />}
      {isAdvanced ? <AdvancedViewLayout /> : <BasicViewLayout />}
      {worldMapModal && <WorldMap />}
      {searchSizingModal && <SearchSizingModal />}
      {proceed93XXModal && <Proceed93XXModal proceedModalMessage={proceedModalMessage}/>}
      {proceedOmni900Modal && <ProceedOmni900Modal proceedModalMessage={proceedModalMessage}/>}
      {proceedModal && <ProceedModal proceedModalMessage={proceedModalMessage}/>}
      {RLProceedModal && <RestrictedLiftModal openFlag={RLProceedModal} />}
      {resetSizingModal?.status && (
        <AlertModal
          type={resetSizingModal?.type}
          title={resetSizingModal?.title}
          message={resetSizingModal?.message}
        />
      )}
      {gvsModal && <GenericValveSizingModal />}
    </Container>
  );
};

export default Home;
