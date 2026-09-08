
import { useMemo, useState, useCallback } from 'react';
import Checkbox from '../basicComponents/Checkbox';
import MUIDataTable from 'mui-datatables';
import { Error_Triangle_Image } from '../../utils/constants';
import { useSelector } from 'react-redux';
import warning from "../../assets/warning.png";
import info from "../../assets/calcerror_icon.png";
import valveerror_icon from "../../assets/valveerror_icon.png";
import mverror_icon from "../../assets/multivalve_error.png";


const columns = [
  {
    name: 'type',
    label: 'Type',
    options: {
      align: 'center',
      customBodyRender: (type) => {
        if (type === 'General Warnings') {
          return <img style={{ textAlign: 'center' }} src={warning} alt={type} width="20" />;
        } else if (type === 'General Information' || type === 'General Errors') {
          return <img style={{ textAlign: 'center' }} src={info} alt={type} width="20" />;
        } else if (type === 'MultiValve Error') {
          return <img style={{ textAlign: 'center' }} src={mverror_icon} alt={type} width="20" />;
        } else {
          return <img style={{ textAlign: 'center' }} src={valveerror_icon} alt={type} width="20" />;
        }
      },
    },
  },
  { name: 'message', label: 'Message' },
];


const options = {
  filter: false,
  search: false,
  print: false,
  download: false,
  viewColumns: false,
  selectableRows: 'none',
  pagination: true,
  responsive: 'standard',
};


const defaultFilters = {
  valveErrors: true,
  generalWarnings: true,
  generalErrors: true,
  generalInformation: true,
  multiValveErrors: true,
};

const ErrorComponent = ({ errors }) => {
  // console.log(errors, 'errors in error component >>>>>>>> ');
  const { error: uiErrors, infoError } = useSelector(state => state.workflow);
  const { genericErrors } = useSelector(state => state.generic);
  const { selectedDataset, selectedValveType } = useSelector(state => state.workflowPayload);

  const [filters, setFilters] = useState(defaultFilters);

  // console.log(errors)
  // Memoize error message generation for performance
  const errorMessages = useMemo(() => {
    if (!errors || !selectedDataset?.label) return [];
    const resultErrors = errors[selectedDataset.label] ?? [] //?.filter(e => selectedValveType?.value === 'All' || e.ValveTypeSummary === selectedValveType?.value) || [];
   
    return [...resultErrors];
  }, [errors, selectedDataset, selectedValveType, infoError, uiErrors, genericErrors]);

  // Memoize filtered errors
  const filteredErrors = useMemo(() => {
    return errorMessages.filter(error => {
      if (filters.generalInformation && error.type === 'General Information') return true;
      if (filters.valveErrors && error.type === 'Valve Errors') return true;
      if (filters.generalWarnings && error.type === 'General Warnings') return true;
      if (filters.generalErrors && error.type === 'General Errors') return true;
      if (filters.multiValveErrors && error.type === 'MultiValve Error') return true;
      return false;
    });
  }, [errorMessages, filters]);

  const handleChange = useCallback((field) => {
    setFilters(prev => ({ ...prev, [field.name]: field.value }));
  }, []);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <img src={Error_Triangle_Image} alt="exclamation" style={{ marginLeft: 16 }} />
        </div>
        <div style={{ marginRight: 90 }}></div>
        <div>
          <Checkbox
            fieldName="generalErrors"
            label="General Errors"
            value={filters.generalErrors}
            disabled={false}
            onChange={handleChange}
            grid={1}
          />
        </div>
        <div>
          <Checkbox
            fieldName="valveErrors"
            label="Valve Errors"
            value={filters.valveErrors}
            disabled={false}
            onChange={handleChange}
            grid={1}
          />
        </div>
        <div style={{ marginRight: '90px' }}>
          <Checkbox
            fieldName="generalWarnings"
            label="General Warnings"
            value={filters.generalWarnings}
            disabled={false}
            onChange={handleChange}
            grid={1}
          />
        </div>
      </div>
      <div style={{ maxHeight: '60vh' }}>
        <MUIDataTable
          title={''}
          data={filteredErrors}
          columns={columns}
          options={options}
        />
      </div>
    </>
  );
};

export default ErrorComponent;

