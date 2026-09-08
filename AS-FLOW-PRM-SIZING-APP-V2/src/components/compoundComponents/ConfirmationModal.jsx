import Dialog from "../hoc/Dialog"
import styles from '../../styles/Home.module.css';

const ConfirmationModal=({title,message,confirmlabel,cancellabel,handleConfirmOk,handleConfirmCancel})=>{

    return (
        <div>
        <Dialog
        maxWidth="md"
        open={true} 
        onClose={handleConfirmCancel}
        title={title}
        draggable={false}
        children={<p>{message}</p>}
        buttons={[
            { label: confirmlabel, onClick: handleConfirmOk , className: styles.footerButton },
            { label: cancellabel, onClick: handleConfirmCancel, className: styles.footerButton },
           ]}
        />
    </div>
    )
}
export default ConfirmationModal