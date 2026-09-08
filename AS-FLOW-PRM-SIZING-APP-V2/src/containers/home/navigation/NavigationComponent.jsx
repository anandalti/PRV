import { useDispatch, useSelector } from "react-redux";
import Tabs from "../../../components/hoc/Tabs";
import { onSelectMenu } from "../../../store/slices/navigationSlice";
import Tab from "../../../components/basicComponents/Tab";
import { RESULT_PAGE_TITLE } from "../../../utils/constants";
import { onUpdateFields } from "../../../store/slices/workflowSlice";
const NavigationComponent = () => {
  const dispatch = useDispatch();
  const menus = useSelector((state) => state.navigation.menus);
  // const {selectedWorkflow}=useSelector(state=>state.workflow);
  const { payloadData } = useSelector((state) => state.workflowPayload);
  const { isAdvanced } = useSelector((state) => state.layout);
  const handleChange = (menu, newValue) => {
    if (menu.name !== RESULT_PAGE_TITLE && !isAdvanced) {
      dispatch(onSelectMenu(newValue));
      // console.log(`In NavigationComponent >>> ${payloadData['UomFieldName']!==''} >>> ${payloadData['UomFieldName']}`);
      if(payloadData['UomFieldName']!==''){
        dispatch(onUpdateFields({name:'UomFieldName',value:''}));
      }
      
    }
  };

  return (
    <Tabs>
      {menus &&
        menus.map((menu, index) => {
          // console.log('In Menus >>> ',menu)
          if (menu.name === "Pressure Case" && payloadData["IsPressureOnly"] === true) {
            return <Tab key={index} menu={menu} index={index} handleChange={handleChange} />;
          }

          if (menu.name === "Vacuum Case" && payloadData["IsVacuumOnly"] === true) {
            return <Tab key={index} menu={menu} index={index} handleChange={handleChange} />;
          }
          if (menu.name !== "Vacuum Case" && menu.name !== "Pressure Case") {
            return <Tab key={index} menu={menu} index={index} handleChange={handleChange} />;
          }
          // if(selectedWorkflow!==3 ){
          //     return <Tab key={index} menu={menu} index={index} handleChange={handleChange}/>
          // }
        })}
    </Tabs>
  );
};

export default NavigationComponent;
