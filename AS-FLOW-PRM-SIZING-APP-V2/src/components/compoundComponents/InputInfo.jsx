import Input from "../basicComponents/Input"
import TextDisplay from "../basicComponents/TextDisplay";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ToolTip from "../basicComponents/ToolTip";

const InputUomInfo = (props) => {
    // console.log(' >>>>>>>>> ',props?.value)
    
    return (
                <div className="grid-inputuom-container" style={{gridTemplateColumns:"0.35fr 2.45fr"}}>
                    <div></div>
                    <div style={{display:"flex"}}>
                        <div >
                            <ToolTip infoText={props?.infoText}>
                                <InfoOutlinedIcon color="primary"/>
                            </ToolTip>
                        </div>
                        <TextDisplay text={props.label} />
                    </div>
                </div>
    )    
}

InputUomInfo.propTypes = {
    ...ToolTip.propTypes,
    ...TextDisplay.propTypes,
    ...Input.propTypes
}


export default InputUomInfo