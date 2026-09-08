import Dialog from "../hoc/Dialog"
//import flowrateStyles from '../../../styles/CalculateFlowRate.module.css';
import styles from '../../styles/Home.module.css';
import { useDispatch } from "react-redux"
import {onUpdateFields, onUpdateWorldMapModal} from "../../store/slices/workflowSlice"
import {onUpdatePayloadData} from "../../store/slices/workflowPayloadSlice"
//import Paper from "../../../components/hoc/Paper"
//import { CALC_REQ_FLOW_RATE } from "../../utils/constants";
import WorldMapImages from "./WorldMapImages";
const WorldMap = () => {
    const dispatch = useDispatch()
    const handleClose = () => {
        dispatch(onUpdateWorldMapModal(false))
    }
    const handleSave = () => {
        dispatch(onUpdateWorldMapModal(false))
        // console.log("Clicked on Ok Button");
    };
    const handleClick = (alt) => {
        // console.log(`You clicked on ${alt}`);
        let item = {name: "TankLatitude", value: alt}
        dispatch(onUpdateFields(item))
        // dispatch(onUpdatePayloadData(item))
    };
    return(
        <div>
            <Dialog
            maxWidth="md"
            open={true} 
            onClose={handleClose}
            title="WorldMap"
            draggable={true}
            children={<>
                <WorldMapImages handleClick={handleClick}/>
            </>}
            buttons={[
                { label: `Ok`, onClick: handleSave, className: styles.footerButton },
               ]}
            />
        </div>
    )
}
export default WorldMap