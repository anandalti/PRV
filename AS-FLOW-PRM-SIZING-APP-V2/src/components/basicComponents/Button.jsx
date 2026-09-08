import { Button as MuiButton } from '@mui/material'

const Button = (props) => {
  return (
    <MuiButton {...props}/>
    // <button className={props.className}>{props?.children}</button>
  )
}

Button.propTypes = MuiButton.propTypes;

export default Button;