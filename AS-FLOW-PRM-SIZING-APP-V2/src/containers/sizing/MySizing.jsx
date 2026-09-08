import React, { useEffect, useState } from 'react';
import MuiDataTable from '../../components/compoundComponents/MuiDataTable';
import MySizingHeader from "./Header/MysizingHeader";
import Grid from '../../components/hoc/Grid';
import '../../App.css'; 
import { useDispatch, useSelector } from 'react-redux';
import {  fetchMySizingData } from '../../store/slices/workflowSlice';
// import { onSelectMenu } from '../../store/slices/navigationSlice';
import { useNavigate } from 'react-router-dom';
import { LOADING_MYSIZING } from '../../utils/constants';
import Dialog from '../../components/hoc/Dialog';
// import { filter } from 'mathjs';
import useSearchSizing from '../../hooks/useSearchSizing';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import { Container } from '@mui/material';
import { paddingZero } from '../../styles/StyleObjectProperties';

const MySizing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const {searchSizing} = useSearchSizing();
  const { height, width } = useWindowDimensions();
  const { userData } = useSelector(state => state.auth);
  const { workflows,status, mySizingData, sizingDetails} = useSelector(state => state.workflow);
  const [customOptions, setCustomOptions] = useState({filterType: 'dropdown',responsive: 'standard' });
  const [tableData, setTableData] = useState([]);

//   const options = {filterType: 'dropdown',responsive: 'standard' };
  useEffect(() => {
    const message = status === 'loading' ? 'Please wait while we are processing your request' : 'No data available';
    setCustomOptions({
      ...customOptions,
      textLabels: {
        body: {
          noMatch: message,
        },
      },

    //   rowsPerPageOptions: [10, 25, 50, 100],
      // selectableRows: IsMultiValves?'multiple':'single',
      
      // onRowSelectionChange: handleRowSelected,
    //   selectableRows: 'none',
    //   onRowClick: handleRowSelected,
    });
  }, [status]);

  const columns = [
    {
      name: 'Id',
      label: 'ID',
      options: {
        display: 'false', 
        filter: false,
      },
    },
    {
      name: 'WorkFlowId',
      label: 'WorkFlowId',
      options: {
        display: 'false', filter: false,
      },
    },
    {
      name: 'SizingTabIndex',
      label: 'SizingTabIndex',
      options: {
        display: 'false', filter: false,
      },
    },
    {
      name: 'Sizing ID',
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <span
              style={{ color: 'blue', cursor: 'pointer', textAlign: 'center' }}
              onClick={() => handleClick(value, tableMeta.rowData[0], tableMeta.rowData[1], tableMeta.rowData[2])}
            >
              {value}
            </span>
          );
        },
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Valve Category",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Fluid Type",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Sizing Methodology",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Single or Multivalve",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Line Item",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Tag Number",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Selected Model",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Quote Number",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Set Pressure",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Set Vacuum",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Differential Pressure (for Pressure)",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Differential Pressure (for Vacuum)",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Vessel Pressure",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Vessel Vacuum",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    
    {
      name: "Sizing Basis",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Last Modified",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
    {
      name: "Actions",
      options: {
        setCellProps: () => ({
          style: { textAlign: 'center' },
        }),
        setCellHeaderProps: () => ({
          style: { textAlign: 'center' },
        }),
      },
    },
  ];

  

  useEffect(() => {
    dispatch(fetchMySizingData(userData?.Id));
  }, []);
  
  useEffect(() => {
    if(mySizingData?.length > 0){
      const apiData = mySizingData.map(detail => ({
        "Id": detail.Id,
        "WorkFlowId": detail.WorkFlowId,
        "SizingTabIndex": detail.SizingTabIndex,
        "Sizing ID": detail.SizingId,
        "Single or Multivalve": detail.IsMultivalve,
        "Line Item": detail.LineItem,
        "Tag Number": detail.TagNumber,
        "Selected Model": detail.svmodelnumebr,
        "Quote Number": detail.QuoteNumber,
        "Set Pressure": detail.SetPressure,
        "Set Vacuum": detail.SetVacuum,
        "Differential Pressure (for Pressure)": detail.DeltaPressure,
        "Differential Pressure (for Vacuum)": detail.DeltaPressureVacuum,
        "Vessel Pressure": detail.VesselPressure,
        "Vessel Vacuum": detail.VesselVacuum,
        "Valve Category": detail.ValveCategoryName,
        "Fluid Type": detail.FluidTypeName,
        "Sizing Methodology": detail.SizingMethodologyName,
        "Sizing Basis": detail.SizingBasis,
        "Last Modified": ""
      }));
      setTableData(apiData);
    }
  }, [mySizingData]);

  const handleClick = async (sizingId, rowId, workflowId, SizingTabIndex) => {

    searchSizing(sizingId)
    setTimeout(() => {
      navigate('/Sizing')
    }, 500);
  };
  
  return (
    // <div style={{width,height, margin:"2rem"}}>
      <Container maxWidth={"lg"} sx={paddingZero}>
      <MySizingHeader />
      <br />
      <div className="background-grey" >
        <h2>My Sizing</h2>
        <Grid className="container-padding white-container"> 
          <MuiDataTable 
            data={status === 'loading'?[]:tableData} 
            columns={status === 'loading'?[]:columns} 
            options={customOptions}
          />
        </Grid>
        <Dialog open={status === 'loading'} title={LOADING_MYSIZING.title}>
            {LOADING_MYSIZING.content}
      </Dialog> 
      </div>
      </Container>
  );
};

export default MySizing;