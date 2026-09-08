import { useSelector } from "react-redux";
import Grid from "../../../components/hoc/Grid";
import SnakebarContent from "../../preference/Modal/SnakebarContent";
import NavigationComponent from "../navigation/NavigationComponent";
import TabPanel from "../tabPanels/TabPanel";

const BasicViewLayout = () => {
    const {snakebar} = useSelector((state) => state.preference);

    return (
        <Grid container style={{"background": "whitesmoke","marginTop":"16px"}}>
            <SnakebarContent {...snakebar} />
            <Grid item sm={9}>
                <TabPanel />
            </Grid>
            <Grid item sm={3}>
                <NavigationComponent />
            </Grid>
            
        </Grid>
    );
};

export default BasicViewLayout;