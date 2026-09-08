import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import {
  createHandleTagToggle,
  createHandleProjectToggle,
  createHandleCompanyToggle,
  createHandleSelectAll,
  createHandleDeselectAll,
} from '../helpers/selectionHandlers';
import { useSelector } from 'react-redux';

const SelectionContext = createContext();

export const SelectionProvider = ({ children, initialSelectedTagIds = [] }) => {
  const [selectedTagIds, setSelectedTagIds] = useState(() => new Set(initialSelectedTagIds.map(String)));

  const selectedTagIdsArray = useMemo(() => Array.from(selectedTagIds), [selectedTagIds]);

  const handleTagToggle = useMemo(() => createHandleTagToggle(setSelectedTagIds), [setSelectedTagIds]);
  const handleProjectToggle = useMemo(() => createHandleProjectToggle(setSelectedTagIds), [setSelectedTagIds]);
  const handleCompanyToggle = useMemo(() => createHandleCompanyToggle(setSelectedTagIds), [setSelectedTagIds]);
  const handleDeselectAll = useMemo(() => createHandleDeselectAll(setSelectedTagIds), [setSelectedTagIds]);

  const handleSelectAll = useCallback(
    (idsToSelect, allTagIds) => {
      const handler = createHandleSelectAll(setSelectedTagIds, allTagIds, selectedTagIds);
      handler(idsToSelect);
    },
    [setSelectedTagIds, selectedTagIds]
  );

  const value = {
    selectedTagIds,
    selectedTagIdsArray,
    handleTagToggle,
    handleProjectToggle,
    handleCompanyToggle,
    handleSelectAll,
    handleDeselectAll,
    setSelectedTagIds,
  };

  return React.createElement(SelectionContext.Provider, { value }, children);
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};

export const useSelectedTagRows = () => {
  const { selectedTagIds } = useSelection();
  const tagDetails = useSelector(state => state.tags.tagDetails) || [];

  return useMemo(() => {
    const selectedStr = new Set(Array.from(selectedTagIds || []).map(id => String(id)));
    return tagDetails.filter(t => 
        selectedStr.has(String(t.TagId)) || 
        selectedStr.has(String(t.tagId)) || 
        selectedStr.has(String(t.id))
    );
  }, [selectedTagIds, tagDetails]);
};

export const useSelectedSizingRows = () => {
  const { selectedTagIds } = useSelection();
  const sizingDetails = useSelector(state => state.tags.sizingDetails) || [];

  return useMemo(() => {
    const selectedStr = new Set(Array.from(selectedTagIds || []).map(id => String(id)));
    return sizingDetails.filter(s => 
        selectedStr.has(String(s.TagId)) || 
        selectedStr.has(String(s.tagId)) || 
        selectedStr.has(String(s.id))
    );
  }, [selectedTagIds, sizingDetails]);
};

export const useSelectedConfigRows = () => {
  const { selectedTagIds } = useSelection();
  const configDetails = useSelector(state => state.tags.configDetails) || [];

  return useMemo(() => {
    const selectedStr = new Set(Array.from(selectedTagIds || []).map(id => String(id)));
    return configDetails.filter(c => 
        selectedStr.has(String(c.TagId)) || 
        selectedStr.has(String(c.tagId)) || 
        selectedStr.has(String(c.id))
    );
  }, [selectedTagIds, configDetails]);
};

export const useSelectedPricingRows = () => {
  const { selectedTagIds } = useSelection();
  const pricingDetails = useSelector(state => state.tags.pricingDetails) || [];

  return useMemo(() => {
    const selectedStr = new Set(Array.from(selectedTagIds || []).map(id => String(id)));
    return pricingDetails.filter(p => 
        selectedStr.has(String(p.TagId)) || 
        selectedStr.has(String(p.tagId)) || 
        selectedStr.has(String(p.id))
    );
  }, [selectedTagIds, pricingDetails]);
};

export const useSelectedBomRows = () => {
  const { selectedTagIds } = useSelection();
  const bomDetails = useSelector(state => state.tags.bomDetails) || [];

  return useMemo(() => {
    const selectedStr = new Set(Array.from(selectedTagIds || []).map(id => String(id)));
    return bomDetails.filter(b => 
        selectedStr.has(String(b.TagId)) || 
        selectedStr.has(String(b.tagId)) || 
        selectedStr.has(String(b.id))
    );
  }, [selectedTagIds, bomDetails]);
};
