import { Grid as MuiGrid } from "@mui/material";

const Grid = ({ children, ...props }) => {
    return (
        <MuiGrid {...props}>
            {children}
        </MuiGrid>
    )
}

Grid.propTypes = MuiGrid.propTypes;

export default Grid;