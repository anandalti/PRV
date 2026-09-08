import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFactory, setCustomerId, setQuoteId } from '../store/slices/headerSlice';
import { useSelection } from './useSelection';

/**
 * useHeaderPanel
 * Hook to manage HeaderPanel state and logic
 */
export const useHeaderPanel = () => {
    const dispatch = useDispatch();
    
    // Redux state
    const { factory, customerId, quoteId } = useSelector(state => state.header);
    const { bomDetails, isLoading } = useSelector(state => state.tags);
    const { viewMode, activeTab, showOrderSheetTab } = useSelector(state => state.layout);
    
    // Selection state
    const { selectedTagIdsArray: selectedTags } = useSelection();
    const hasSelection = useMemo(() => selectedTags.length > 0, [selectedTags]);

    // 1. Optimized Set for existing BOM IDs (O(m))
    const existingBomIdsSet = useMemo(() => {
        return new Set(bomDetails.map(item => String(item.tagId || item.TagId || item.id)));
    }, [bomDetails]);

    // 2. Identify missing BOM IDs (O(n))
    const missingBomIds = useMemo(() => {
        return selectedTags.filter(id => !existingBomIdsSet.has(String(id)));
    }, [selectedTags, existingBomIdsSet]);

    // Check if there are missing BOMs among selected tags for the warning toast
    const hasMissingBom = useMemo(() => {
        return hasSelection && missingBomIds.length > 0;
    }, [hasSelection, missingBomIds]);

    const hasExistingBom = useMemo(() => {
        return hasSelection && selectedTags.some(id => existingBomIdsSet.has(String(id)));
    }, [hasSelection, selectedTags, existingBomIdsSet]);

    // 3. Optimization: Active if ANY selected tag has BOM (Requirement #4)
    // Disabled if loading, or if no tags are selected at all, or if in import concept
    const isOpsFlow = viewMode === 'import' || activeTab === 'orderSheet' || showOrderSheetTab;
    
    const isSubmitDisabled = useMemo(() => {
        if (isOpsFlow || !hasSelection || isLoading) return true;
        // Enable if at least one selected tag is present in the BOM Set
        return !selectedTags.some(id => existingBomIdsSet.has(String(id)));
    }, [selectedTags, existingBomIdsSet, isLoading, hasSelection, isOpsFlow]);

    // Handlers
    const handleSubmitToOracle = useCallback((overrideTags = null) => {
        // If overrideTags not provided, respect the current disabled state
        if (!overrideTags && isSubmitDisabled) return;

        const tagsToSubmit = overrideTags || selectedTags;

        console.log('Submit to Oracle triggered with context:', {
            factory,
            customerId,
            quoteId,
            tags: tagsToSubmit
        });

        // TODO: Integrate with backend endpoint for Submit To Oracle
    }, [isSubmitDisabled, factory, customerId, quoteId, selectedTags]);

    const onFactoryChange = (val) => dispatch(setFactory(val));
    const onCustomerIdChange = (val) => dispatch(setCustomerId(val));
    const onQuoteIdChange = (val) => dispatch(setQuoteId(val));

    return {
        factory,
        customerId,
        quoteId,
        selectedTags,
        hasSelection,
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
    };
};
