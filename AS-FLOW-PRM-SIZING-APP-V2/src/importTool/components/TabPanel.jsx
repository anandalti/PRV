/**
 * TabPanel.jsx
 * Renders 4 tab buttons and the active tab's content.
 * Tabs: Tag Details | Sizing | Configuration | Pricing
 */
import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { setActiveTab } from '../store/slices/layoutSlice';
import { TABS } from '../helpers/tabConfig';
import { Tab } from './basicComponents/Tab';
import { useSelection } from '../hooks/useSelection';

const TabPanel = ({ children }) => {
    const dispatch = useDispatch();
    const { activeTab, hasUnsavedChanges, showOrderSheetTab, isOrderMapped } = useSelector(state => state.layout);
    const { bomDetails } = useSelector(state => state.tags);
    const { selectedTagIdsArray } = useSelection();

    // Determine if we should display the tabs visually
    const areTabsVisible = isOrderMapped || selectedTagIdsArray.length > 0 || showOrderSheetTab;

    // Condition 1: Filter tabs based on dynamic visibility rules
    const visibleTabs = TABS.filter(tab => {
        // Only show orderSheet if it's been triggered by an import
        if (tab.id === 'orderSheet') {
            return showOrderSheetTab;
        }

        // If we are currently reviewing the unmapped order sheet, hide all other tabs
        if (showOrderSheetTab && !isOrderMapped) {
            return false;
        }

        // Only show BOM if tags are selected (or forced by mapping)
        if (tab.id === 'bom') {
            if (isOrderMapped) return true;
            return selectedTagIdsArray.length > 0;
        }
        return true;
    });

    return (
        <div className="it-right-panel">
            {/* Tab bar container (always rendered to preserve layout height) */}
            <div className="it-tabs" role="tablist" style={{ visibility: areTabsVisible ? 'visible' : 'hidden' }}>
                {visibleTabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const isDisabled = hasUnsavedChanges && !isActive;

                    return (
                        <Tab
                            key={tab.id}
                            id={tab.id}
                            label={tab.label}
                            isActive={isActive}
                            disabled={isDisabled}
                            onClick={() => dispatch(setActiveTab(tab.id))}
                        />
                    );
                })}
            </div>

            {/* Content */}
            <div className="it-tab-content" role="tabpanel">
                {children}
            </div>
        </div>
    );
};

export default TabPanel;
