import {Link as MuiLink} from '@mui/material';

const Link = (props) => {
  return (
    <MuiLink {...props}>
        {props.children}
      </MuiLink>
  )
}

export default Link