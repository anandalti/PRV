/**
 * exportUtils.js
 * Utility functions to export availability data to CSV and PDF (via print).
 */

/**
 * Export table data to a downloadable CSV file.
 */
export const exportToCSV = () => {

    //export tables with the id to csv file
    const table = document.getElementById(`parent-table`);
    console.log('Exporting to CSV, found table:', table);
    return;
    if (!table) {
      console.error(`Table with ID "${table.id}" not found.`);
      return;
    }

    const rows = table.querySelectorAll('tr');
    console.log('Exporting to CSV with rows:', rows[0].innerText);
    return;


    console.log('Exporting to CSV with metadata:', tableData, filename);
    
    const parentHeaders = [
        'level', 'Item', 'Material Number', 'Material Description', 'Basic Material',
        'Assembly?', 'Req. Qty', 'UOM', 'ATP Qty', 'Missing', 'Availability', 'Weeks'
    ];

    const metaRows = [
        ['Customer', metadata?.customer || ''],
        ['Project', metadata?.project || ''],
        ['Tag', metadata?.tag || ''],
        ['Catalog Code', metadata?.catalogCode || ''],
        ['ERP Code', metadata?.erpCode || ''],
        ['Factory', metadata?.factory || ''],
        ['Requested Lead Time', `${metadata?.requestedLeadTime || ''} ${metadata?.requestedLeadTimeUnit || ''}`],
        ['Overall Commitment Date', metadata?.overallCommitmentDate || ''],
        ['BOM Version', metadata?.bomVersion || ''],
        ['Availability Ref. No.', metadata?.availabilityRefNo || ''],
        [],
    ];

    const dataRows = tableData.map(row => [
        row.level + 1,
        row.itemIdentifier || '',
        row.materialNumber || '',
        row.description || '',
        row.basicMaterial || '',
        row.isAssembly || '',
        row.requiredQty ?? '',
        row.uom || '',
        row.atpQty ?? '',
        row.isMissing ? 'X' : '-',
        row.availability || '-',
        row.weeks || '-',
    ]);

    const escape = val => `"${String(val).replace(/"/g, '""')}"`;
    const toLine = arr => arr.map(escape).join(',');

    const csv = [
        ...metaRows.map(r => r.map(v => escape(v)).join(',')),
        toLine(headers),
        ...dataRows.map(toLine),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `availability_${metadata?.tag || 'report'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Export current page as PDF using the browser's print dialog.
 * A dedicated print stylesheet hides the sidebar and shows only the table.
 */
export const exportToPDF = () => {
    window.print();
};
