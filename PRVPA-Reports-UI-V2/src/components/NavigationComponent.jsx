import Tabs from "./Tabs";
import Tab from "./Tab";
const NavigationComponent = ({menus, handleChange}) => {
    return (
        <Tabs>
            {
                menus &&
                menus.map((menu, index) => {
                    return <Tab key={index} menu={menu} index={index} handleChange={handleChange} />
                })
            }
        </Tabs>

    );
}

export default NavigationComponent