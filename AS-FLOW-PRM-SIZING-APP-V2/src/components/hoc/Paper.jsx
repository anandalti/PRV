import {Paper as MuiPaper} from '@mui/material';

const Paper = (props) => {
return (
    <MuiPaper {...props}>
        {props.children}
    </MuiPaper>
)
}
export default Paper;