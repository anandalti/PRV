import { Box as MuiBox } from '@mui/material'

const Box = (props) => {
  return (
    <MuiBox {...props}>
        {props.children}
    </MuiBox>
  )
}

Box.propTypes = MuiBox.propTypes;

export default Box;