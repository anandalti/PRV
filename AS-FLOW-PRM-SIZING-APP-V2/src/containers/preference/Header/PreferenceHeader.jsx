import HeaderText from "../../header/HeaderText";
import PreferenceHeaderText from "../Header/PreferenceHeaderText";
import PreferenceHeaderButtonStack from "../Header/PreferenceHeaderButtonStack";
import {changeUserPreference} from "../../../store/slices/layoutSlice"
import { useLocation } from 'react-router-dom';
import { useDispatch } from "react-redux"
import { useEffect } from "react";
const PreferenceHeader = () => {
  //const dispatch = useDispatch();
  //const {pathname} = useLocation();
//   useEffect(() => {
//     dispatch(changeUserPreference(pathname==='/preference' ? true: false))
//     //dispatch(fetchPreferenceSections())
//   },[pathname])
  return (
    <>
      <PreferenceHeaderText />
      <PreferenceHeaderButtonStack />
    </>
  )
};

export default PreferenceHeader;