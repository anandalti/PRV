import { use } from "react";
import { useSelector } from "react-redux";

export const useTabPanel = (activeTab) => {
    const title = useSelector(state => state.layout.tabs.find(tab => tab.id === activeTab)?.label);
    let columns = [];
    let rows = [];
    let options = {};
    switch (activeTab) {
            case 'tagDetails':
                // get tag details columns, rows and options
                
            case 'sizing':
                // get tag details columns, rows and options

            case 'configuration':
                // get configuration columns, rows and options
            case 'pricing':
                // get pricing columns, rows and options
            default:
                break;
    }

    return { title, columns, rows, options };
};