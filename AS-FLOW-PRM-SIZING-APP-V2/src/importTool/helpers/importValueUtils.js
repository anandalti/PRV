export const gv = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val).trim();
    return (s === 'false' || s === '') ? '' : s;
};

export const isChecked = (val) => {
    if (val === undefined || val === null || val === '') return false;
    if (typeof val === 'boolean') return val;
    const s = String(val).trim().toLowerCase();
    const validMarks = ['p', 'ü', 'þ', 'x', 'v', '1', 'yes', 'true'];
    return validMarks.includes(s);
};
