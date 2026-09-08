import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilteredResults } from "../store/slices/workflowPayloadSlice";
import { SIZIND_RESULT_API } from "../utils/constants";


const useResults = () => {
    const dispatch = useDispatch();
    const [displayAllColumns, setDisplayAllColumns] = useState(false);
    const [finalDisplayColumns, setFinalDisplayColumns] = useState([]);
    const {  kaDatasetOptions, vpValveTypeOptions, resultData, resultColumns, displayColumns, displayColumnsAPI } = useSelector((state) => state.workflowPayload);

    // const handle
    const handleFilters=()=>{

    }

    const handleFilterChange = (item) => {
        // console.log(' >>>>>>>>>>>>> ',item);
        let filterValues={};
        if(item.name==='displayAllFields'){
            setDisplayAllColumns(!displayAllColumns);
            filterValues={...filterValues,displayAllColumns:!displayAllColumns};
        }
        const config={
            url:`${SIZIND_RESULT_API}/filter`,
            method:'POST',
            data:{
                filters:{...filterValues}, results:resultData
                
            }
        }
        dispatch(fetchFilteredResults(config));
    }

    return {
        kaDatasetOptions,
        vpValveTypeOptions,
        resultData,
        resultColumns,
        displayColumns,
        displayColumnsAPI,
        displayAllColumns,
        finalDisplayColumns,
        handleFilters,
        handleFilterChange
    };
};
export default useResults;