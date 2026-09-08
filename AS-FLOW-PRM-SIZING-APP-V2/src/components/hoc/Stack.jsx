import { Stack as MuiStack } from "@mui/material"

const Stack = ({children, ...props}) => {
    return (
      <MuiStack {...props}>
          {children}
      </MuiStack>
    )
  }

Stack.propTypes = MuiStack.propTypes;
  
  export default Stack