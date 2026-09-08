import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { processAvailabilityData } from '../helpers/availabilityHelpers';
import { setFactory, setLeadTime } from '../store/slices/checkAvailabilitySlice';

/**
 * Hook to access availability metadata.
 */
export const useAvailabilityTagdata = () => {
    return useSelector(state => state.checkAvailability.TagData);
};

/**
 * Hook to access and update editable form fields (factory, lead time).
 * Also exposes whether values differ from defaults.
 */
export const useAvailabilityForm = () => {
    const dispatch = useDispatch();
    const { factory, leadTime, defaultFactory, defaultLeadTime } = useSelector(
        state => state.checkAvailability
    );

    const isDirty = factory !== defaultFactory || Number(leadTime) !== Number(defaultLeadTime);

    return {
        factory,
        leadTime,
        isDirty,
        setFactory: (val) => dispatch(setFactory(val)),
        setLeadTime: (val) => dispatch(setLeadTime(val)),
    };
};

/**
 * Hook to manage and process availability items with expansion logic.
 */
export const useProcessedAvailabilityData = () => {
    const tableData = useSelector(state => state.checkAvailability.parentBOMS);
    const childBOMS = useSelector(state => state.checkAvailability.childBOMS);
    return { tableData, childBOMS };
};

/**
 * Hook to access loading and error states.
 */
export const useAvailabilityStatus = () => {
    const { isLoading, error } = useSelector(state => state.checkAvailability);
    return { isLoading, error };
};

/**
 * Hook to handle the "Check Availability" action.
 * When API is ready: replace console.log with dispatch(fetchAvailability({ factory, leadTime }))
 */
export const useCheckAvailabilityAction = () => {
    const { factory, leadTime } = useSelector(state => state.checkAvailability);
    // const dispatch = useDispatch(); // uncomment when API is ready

    const handleCheck = () => {
        console.log('Checking availability with:', { factory, leadTime });
        // TODO: dispatch(fetchAvailability({ factory, leadTime }));
    };

    return handleCheck;
};
