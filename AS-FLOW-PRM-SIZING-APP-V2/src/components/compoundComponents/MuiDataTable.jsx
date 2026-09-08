import MUIDataTable from "mui-datatables";

const MuiDataTable = ({ data = [], columns = [], title, options, rowsSelected }) => {
  return (
    <MUIDataTable
      title={title}
      data={data}
      columns={columns}
      options={options}
      onRowClick={(row) => rowsSelected(row)}
    />
  );
};

export default MuiDataTable;
