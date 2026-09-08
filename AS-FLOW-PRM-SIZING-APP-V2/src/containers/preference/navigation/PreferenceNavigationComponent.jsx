import { useDispatch, useSelector } from "react-redux";
import Tabs from "../../../components/hoc/Tabs";
import { onSelectPreferenceMenu } from "../../../store/slices/preferenceSlice";
//import Tab from "../../../components/basicComponents/Tab";
import PreferenceTab from "../tab/PreferenceTab";
const PreferenceNavigationComponent = () => {
    const dispatch = useDispatch();
   const menus = useSelector(state=>state.preference.preferenceMenus);
    const handleChange = (event, newValue) => {
        // console.log(newValue, 'newValue')
        dispatch(onSelectPreferenceMenu(newValue));
        //dispatch(updateSelectedValues(newValue))
    };
    
     return (
        <Tabs>
            { menus &&
                menus.filter(item=>item.id !==0).map((menu, index) => {
                    return <PreferenceTab key={index} menu={menu} index={index} handleChange={handleChange}/>
                })}
        </Tabs>
       
    );
}

export default PreferenceNavigationComponent