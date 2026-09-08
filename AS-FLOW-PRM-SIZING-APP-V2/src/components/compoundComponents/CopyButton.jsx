import Button from '../basicComponents/Button';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import ToolTip from '../basicComponents/ToolTip';

const CopyButton = (props) => {
  return (
    <ToolTip infoText={props?.infoText}>
    <Button {...props}>
        <SubdirectoryArrowLeftIcon style={{ color: props?.iconColor }}/>
    </Button>
    </ToolTip>
  )
}

export default CopyButton