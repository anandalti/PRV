import HeaderText from "./HeaderText";
import HeaderButtonStack from "./HeaderButtonStack";
import {changeMysizing, changeUserPreference} from "../../store/slices/layoutSlice"
import { useLocation } from 'react-router-dom';
import { useDispatch } from "react-redux"
import { useEffect } from "react";
const Header = () => {
  const dispatch = useDispatch();
  const {pathname} = useLocation();
  useEffect(() => {
    dispatch(changeUserPreference(pathname==='/preference' ? true: false))
    dispatch(changeMysizing(pathname==='/mysizing' ? true: false))
    //dispatch(fetchPreferenceSections())
  },[pathname])
  return (
    <>
      <HeaderText />
      <HeaderButtonStack />
    </>
  )
};

export default Header;