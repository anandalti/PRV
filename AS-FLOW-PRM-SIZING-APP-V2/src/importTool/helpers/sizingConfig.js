export const getSizingColumns = () => [
    { name: "tagName", label: "Tag Name" },
    { name: "fluidName", label: "Fluid Name" },
    { name: "fluidState", label: "Fluid State" },
    { name: "setPressure", label: "Set Pressure" },
    { name: "operatingPressure", label: "Operating Pressure" },
    { name: "totalBackPressure", label: "Total Back Pressure" },
    { name: "relievingTemperature", label: "Relieving Temperature" },
    { name: "CDTP", label: "CDTP" },
];

export const sizingOptions = {
    filter: false, // Commented for now as requested
    search: true,
    print: false,
    download: false,
    viewColumns: false,
    selectableRows: 'none',
    elevation: 0,
};