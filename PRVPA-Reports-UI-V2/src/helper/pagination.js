export const addPagination = (data) => {
    setTimeout(() => {
        if (data.length === 0) return;

        for (let i = 0; i < data.length; i++) {
            const id = `printDiv-${i}`
            const tableData = document.getElementById(id);
            const currentPage = tableData.querySelector('[data-pageType="currentPage"]');
            const totalPage = tableData.querySelector('[data-pageType="totalPage"]');
            if(!currentPage || !totalPage) continue;
            currentPage.innerHTML = i + 1;
            totalPage.innerHTML = data.length;
        }
    }, 100);
}