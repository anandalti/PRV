import { Modal } from "react-bootstrap";
import ValveCalculation from "./ValveCalculation";
import { useDispatch, useSelector } from "react-redux";
import { layoutActions } from "../store/layoutSlice";
import { Button } from '@mui/material'
import styles from '../styles/Home.module.css';

const ValveCalculationTab = () => {
    const dispatch = useDispatch();
    const { menus, sizingId, configId } = useSelector(state => state.layout);
    const { onSelectMenu, markComplete } = layoutActions;
    const prevMenu = menus.find(menu => menu.id === 4);
    const nextMenu = menus.find(menu => menu.id === 6);
    return (
        <>
            <Modal.Header>
                <Modal.Title><h5>Noise/Force Calculation</h5></Modal.Title>
            </Modal.Header>
            <div>
                <ValveCalculation />
            </div>
            <footer>
                <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '1rem'}}>
                    <Button className={styles.footerButton} variant="secondary" onClick={() => {
                        dispatch(onSelectMenu(prevMenu));
                    }} style={{ marginRight: '10px' }}>
                        Previous
                    </Button>
                    <Button className={styles.footerButton} variant="primary" onClick={() => {
                        dispatch(markComplete({ id: 5 }));
                        dispatch(onSelectMenu(nextMenu));
                    }}>
                        Next
                    </Button>
                </div>
            </footer>
        </>
    );
}

export default ValveCalculationTab;