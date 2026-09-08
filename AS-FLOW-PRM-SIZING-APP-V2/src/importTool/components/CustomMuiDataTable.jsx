/*
import React from 'react';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const getMuiTheme = () => createTheme({
    components: {
        MUIDataTable: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    border: 'none',
                },
                paper: {
                    boxShadow: 'none',
                    border: 'none',
                }
            }
        },
        MUIDataTableHeadCell: {
            styleOverrides: {
                root: {
                    backgroundColor: '#edf2f7 !important',
                    color: '#4a5568',
                    padding: '0px 2px',
                    fontWeight: 700,
                    fontSize: '10px',
                    textTransform: 'none',
                    letterSpacing: 'normal',
                    borderBottom: 'none',
                    borderLeft: 'none',
                },
                toolButton: {
                    justifyContent: 'flex-start',
                },
                sortAction: {
                    '& path': {
                        color: '#4a5568',
                    }
                },
                data: {
                    fontWeight: 700,
                }
            }
        },
        MUIDataTableBodyCell: {
            styleOverrides: {
                root: {
                    padding: '0px 2px',
                    fontSize: '10px',
                    color: '#000000',
                    borderBottom: 'none',
                    borderLeft: 'none',
                }
            }
        },
        MUIDataTableBodyRow: {
            styleOverrides: {
                root: {
                    height: '18px',
                    '&:hover': {
                        backgroundColor: '#f8fafc !important',
                    },
                    '&.Mui-selected': {
                        backgroundColor: '#edf2f7 !important',
                    }
                }
            }
        },
        MUIDataTableSelectCell: {
            styleOverrides: {
                headerCell: {
                    backgroundColor: '#edf2f7 !important',
                    borderBottom: 'none',
                },
                root: {
                    borderBottom: 'none',
                }
            }
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    minHeight: '16px !important',
                    padding: '0 4px !important',
                    backgroundColor: '#ffffff',
                }
            }
        }
    }
});

const CustomMuiDataTable = ({ title, data, columns, options = {} }) => {
    const defaultOptions = {
        filterType: 'multiselect',
        responsive: 'standard',
        selectableRows: 'none',
        download: false,
        print: false,
        viewColumns: true,
        filter: true,
        rowsPerPageOptions: [10, 25, 50, 100],
        elevation: 0,
        textLabels: {
            body: {
                noMatch: "No data found",
                toolTip: "Sort",
            },
            pagination: {
                next: "Next Page",
                previous: "Previous Page",
                rowsPerPage: "Rows per page:",
                displayRows: "of",
            },
        }
    };

    const finalOptions = { ...defaultOptions, ...options };

    return (
        <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                title={title}
                data={data}
                columns={columns}
                options={finalOptions}
            />
        </ThemeProvider>
    );
};

export default CustomMuiDataTable;
*/
