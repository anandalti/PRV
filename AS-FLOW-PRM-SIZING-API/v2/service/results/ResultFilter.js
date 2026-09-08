

const getWorkflowResultsFilters=async (params)=>{
    const { filters, results } = params;
    const {columns, displayColumns, displayColumnsAPI, rows: resultValves, errors} = results;
    console.log(filters)
    return {
        columns,
        displayColumns,
        displayColumnsAPI,
        rows: resultValves,
        // errors: filteredFailedValves,
        errors

    }
}

module.exports = {
    getWorkflowResultsFilters
}