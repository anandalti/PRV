import React, { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { setShowOrderSheetTab, setActiveTab, setIsOrderMapped } from '../store/slices/layoutSlice';
import { setImportedOrderData } from '../store/slices/tagsSlice';
import { useHeaderPanel } from '../hooks/useHeaderPanel';
import { useSelection } from '../hooks/useSelection';

/**
 * HeaderPanel.jsx
 * Top section: Factory / Customer ID / Quote ID fields + action buttons on the right
 */
const HeaderPanel = () => {
    const dispatch = useDispatch();
    const showOrderSheetTab = useSelector(state => state.layout.showOrderSheetTab);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

    const handleBackToHome = () => {
        dispatch(setImportedOrderData(null));
        dispatch(setShowOrderSheetTab(false));
        dispatch(setActiveTab('tagDetails'));
        dispatch(setIsOrderMapped(false));
    };
    
    const {
        factory,
        customerId,
        quoteId,
        selectedTags,
        hasMissingBom,
        hasExistingBom,
        isLoading,
        isSubmitDisabled,
        handleSubmitToOracle,
        onFactoryChange,
        onCustomerIdChange,
        onQuoteIdChange,
        viewMode,
        isOpsFlow
    } = useHeaderPanel();

    const { setSelectedTagIds } = useSelection();
    const bomDetails = useSelector(state => state.tags.bomDetails) || [];

    const showToast = (message, severity = 'info') => {
        setToast({ open: true, message, severity });
    };

    const onSubmitClick = () => {
        const existingBomIdsSet = new Set(bomDetails.map(item => String(item.tagId || item.TagId || item.id)));
        const tagsWithBom = selectedTags.filter(id => existingBomIdsSet.has(String(id)));

        if (!tagsWithBom.length) {
            showToast('BOM details are not available for the selected tags. Please ensure at least one selected tag has BOM details.', 'warning');
            return;
        }

        // Narrow selection to BOM-backed tags and submit only those
        try {
            setSelectedTagIds(new Set(tagsWithBom.map(String)));
        } catch (e) {
            // ignore if setSelectedTagIds is not available
        }

        handleSubmitToOracle(tagsWithBom);
    };

    const handleToastClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast({ ...toast, open: false });
    };

    return (
        <div className="it-header-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {/* Left: field inputs */}
            <div className="it-header-fields">
                <div className="it-field-row">
                    <label htmlFor="it-factory">Factory</label>
                    <input
                        id="it-factory"
                        type="text"
                        value={factory}
                        onChange={e => onFactoryChange(e.target.value)}
                        placeholder=""
                        disabled={viewMode === 'import'}
                    />
                </div>
                <div className="it-field-row">
                    <label htmlFor="it-customer-id">Customer ID</label>
                    <input
                        id="it-customer-id"
                        type="text"
                        value={customerId}
                        onChange={e => onCustomerIdChange(e.target.value)}
                        placeholder=""
                        disabled={viewMode === 'import'}
                    />
                </div>
                <div className="it-field-row">
                    <label htmlFor="it-quote-id">Quote ID</label>
                    <input
                        id="it-quote-id"
                        type="text"
                        value={quoteId}
                        onChange={e => onQuoteIdChange(e.target.value)}
                        placeholder=""
                        disabled={viewMode === 'import'}
                    />
                </div>
            </div>

            {/* Right: action buttons aligned with the bottom of the fields */}
            <div style={{ display: 'flex', gap: '12px', paddingBottom: '2px' }}>
                {!isOpsFlow && (
                    <button 
                        className="it-btn-teal header-action-btn"
                        onClick={onSubmitClick}
                        disabled={viewMode === 'import' || isSubmitDisabled}
                    >
                        Submit To Oracle
                    </button>
                )}
                {showOrderSheetTab && (
                    <button 
                        className="it-btn-teal header-action-btn"
                        onClick={handleBackToHome}
                    >
                        Back to Home
                    </button>
                )}
            </div>

            <Snackbar 
                open={toast.open} 
                autoHideDuration={6000} 
                onClose={handleToastClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%', fontSize: '12px' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default HeaderPanel;
