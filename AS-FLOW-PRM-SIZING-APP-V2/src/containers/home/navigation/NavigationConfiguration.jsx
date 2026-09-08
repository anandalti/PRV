import Tabs from '../../../components/hoc/Tabs';
// import Tab from '../../../components/basicComponents/Tab';
import { useDispatch, useSelector } from 'react-redux';
import ConfigureTab from '../../../components/basicComponents/ConfigureTab';
import useConfigurationPanel from '../../../hooks/useConfigurationPanel';

const NavigationConfiguration = () => {
    const dispatch = useDispatch();
    const { configTabSelected,updateConfigNavOption } = useConfigurationPanel();
    const menus = useSelector((state) => state.configuration.navMenus);

    const handleChange = (menu, newValue) => {
      // console.log('Configuration Nav option >>>> ',menu,newValue,configTabSelected);
      updateConfigNavOption(menu);
    }
  return (
    <Tabs>
      {menus &&
        menus.map((menu, index) => {
           return <ConfigureTab key={index} menu={menu} index={index} tabSelected={configTabSelected==menu.id} handleChange={handleChange} />;
        })}
    </Tabs>
  )
}

export default NavigationConfiguration