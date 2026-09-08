import { Typography } from "@mui/material"
import ToolTip from "./ToolTip";

const TextDisplay = (props) => {
  return (
    <ToolTip {...props} error={null}>
      <Typography {...props}>
          {props.text}
      </Typography>
    </ToolTip>
  )
}

TextDisplay.propTypes = Typography.propTypes;

export default TextDisplay