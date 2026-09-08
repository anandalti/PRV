import { useEffect } from "react";
import Grid from "../../components/hoc/Grid"
import PreferenceHeader from "./Header/PreferenceHeader";
import PreferenceNavigationComponent from "./navigation/PreferenceNavigationComponent"
import PreferenceTabPanel from "./tabPanels/PreferenceTabPanel";
import usePreferenceGetOptions from "../../hooks/usePreferenceGetOptions";
import {useDispatch, useSelector} from "react-redux";
import ResetModal from "./Modal/ResetModal";
import SnakebarContent from "../preference/Modal/SnakebarContent";
import usePreferenceUpdateValues from "../../hooks/usePreferenceUpdateValues";

const Preference = () => {
  const dispatch = useDispatch();
  const {getOptions} = usePreferenceGetOptions()
  const {updateValues } = usePreferenceUpdateValues()
  const { preferences } = useSelector(state => state.auth);
  const resetModel = useSelector((state) => state.preference.resetModel);
  const {snakebar} = useSelector((state) => state.preference);
  useEffect(() => {
    getOptions(preferences['DisplayUnitSystem']);
    updateValues(preferences['DisplayUnitSystem'], true);

  }, []);
  return (
    <>
      <PreferenceHeader/>
        <Grid container style={{"background": "whitesmoke","marginTop":"16px"}}>
            
            <Grid item sm={9}>
                <PreferenceTabPanel />
            </Grid>
            <Grid item sm={3}>
                <PreferenceNavigationComponent />
            </Grid>
        </Grid>
      <ResetModal open={resetModel}/>
      <SnakebarContent {...snakebar} />
    </>
  )
}

export default Preference