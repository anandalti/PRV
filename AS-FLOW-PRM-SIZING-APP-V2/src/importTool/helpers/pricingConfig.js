export const pricingColumns = [
    { name: "tagName", label: "Tag Name" },
    { name: "catalogNumber", label: "Catalog Number" },
    { name: "qty", label: "Qty" },
    { name: "currency", label: "Currency" },
    { name: "totalList", label: "Total List" },
    { name: "customerNet", label: "Customer Net" },
    { name: "transferPrice", label: "Transfer Price" },
    { name: "tagNumber", label: "Tag Number" },
];

export const pricingOptions = {
    filter: false, // Commented for now as requested
    search: true,
    print: false,
    download: false,
    viewColumns: false,
    selectableRows: 'none',
    elevation: 0,
};