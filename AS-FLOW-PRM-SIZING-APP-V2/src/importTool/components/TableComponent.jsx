import { Table } from "@mui/material";

const TableComponent = ({ children, ...rest }) => {
    return (
        <Table {...rest}>
            {children}
        </Table>
    )
}

export default TableComponent;