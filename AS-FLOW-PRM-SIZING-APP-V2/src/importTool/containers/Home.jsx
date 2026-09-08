import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import HeaderPanel from '../components/HeaderPanel';
import LeftPanel from '../components/LeftPanel';
import TabPanel from '../components/TabPanel';
import TagDetailsTable from '../components/TagDetailsTable';
import SizingTable from '../components/SizingTable';
import ConfigurationTable from '../components/ConfigurationTable';
import PricingTable from '../components/PricingTable';
import BOMTable from '../components/BOMTable';
import { fetchTags } from '../store/slices/tagsSlice';
import { toggleLeftPanel } from '../store/slices/layoutSlice';
import { SelectionProvider } from '../hooks/useSelection';
import Modal from '../components/basicComponents/Modal';
import ImportResults from '../components/ImportResults';
import { AppNavbar } from '../components/basicComponents/Layout';
import OrderImport from './OrderImport';
import {
    setShowOrderSheetTab,
    setActiveTab,
    setImportModalOpen,
    setIsOrderMapped
} from '../store/slices/layoutSlice';
import { setImportedOrderData } from '../store/slices/tagsSlice';

function HomeContent() {
    const { activeTab, viewMode, isImportModalOpen, showOrderSheetTab } = useSelector(state => state.layout);
    const { importedOrderData } = useSelector(state => state.tags);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchTags());
    }, [dispatch]);

    const handleResetImport = () => {
        dispatch(setImportedOrderData(null));
        dispatch(setShowOrderSheetTab(false));
        dispatch(setActiveTab('tagDetails'));
        dispatch(setIsOrderMapped(false));
        dispatch(setImportModalOpen(true));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'orderSheet': return <ImportResults data={importedOrderData} onReset={handleResetImport} />;
            case 'tagDetails': return <TagDetailsTable />;
            case 'sizing': return <SizingTable />;
            case 'configuration': return <ConfigurationTable />;
            case 'pricing': return <PricingTable />;
            case 'bom': return <BOMTable />;
            default: return null;
        }
    };

    return (
        <div className="it-app">
            <AppNavbar />

            {viewMode === 'standard' && <HeaderPanel />}

            <div className="it-content">
                <LeftPanel />

                <div className="it-main-area">
                    <TabPanel>
                        {renderTabContent()}
                    </TabPanel>
                </div>
            </div>

            <Modal
                title="Import Order File"
                isOpen={isImportModalOpen}
            >
                <OrderImport />
            </Modal>
        </div>
    );
}

function Home() {
    return (
        <SelectionProvider>
            <HomeContent />
        </SelectionProvider>
    );
}

export default Home;
