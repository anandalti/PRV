import Dialog from "../hoc/Dialog"
import styles from '../../styles/Home.module.css';
import useResetSizing from "../../hooks/useResetSizing";

const AlertModal=({type,title,message})=>{
    const {resetSizingData,handleCloseResetSizingModal} =useResetSizing();

    const handleClose = () => {
        handleCloseResetSizingModal(null)
    }

    return (
        <div>
        <Dialog
        maxWidth="md"
        open={true} 
        onClose={handleClose}
        title={title}
        draggable={false}
        children={<p>{message}</p>}
        buttons={[
            { label: `Yes`, onClick: ()=> resetSizingData(type) , className: styles.footerButton },
            { label: `Cancel`, onClick: handleClose, className: styles.footerButton },
           ]}
        />
    </div>
    )
}
export default AlertModal