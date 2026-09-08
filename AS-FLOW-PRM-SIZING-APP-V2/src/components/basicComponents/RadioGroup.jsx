import {  RadioGroup as MuiRadioGroup} from '@mui/material';

const RadioGroup = (props) => {
  return (
    <MuiRadioGroup {...props}>
      {props.children}
      {/* Add more options as needed */}
    </MuiRadioGroup>
  )
}

export default RadioGroup