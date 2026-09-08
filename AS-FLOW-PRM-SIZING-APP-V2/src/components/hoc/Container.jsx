import { Container as MuiContainer } from "@mui/material";

const Container = ({ children, ...props }) => {
    return (
        <MuiContainer {...props}>
            {children}
        </MuiContainer>
    )
}

Container.propTypes = MuiContainer.propTypes;

export default Container;