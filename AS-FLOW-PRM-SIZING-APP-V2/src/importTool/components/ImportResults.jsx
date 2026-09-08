import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsOrderMapped, setLeftPanelVisible } from '../store/slices/layoutSlice';
import { setSseJobId, setSseStatus, addSseMessage, clearSseStatus } from '../store/slices/sseStatusSlice';
import { getImportTabIcon } from './basicComponents/ImportIcons';
import CustomTable from './CustomTable';
import OrderProcessingForm from './OrderProcessingForm';
import { submitToOracleAPI } from '../store/api/submit';
import { fetchPayloadAPI } from '../store/api/payload';
import { IMPORT_MESSAGES, FORM_TITLES } from '../constants/ErrorMessages';
import { useSelection } from '../hooks/useSelection';
import { Snackbar, Alert, CircularProgress } from '@mui/material';
import { parseSseEventPayload, getSseStatusSummary } from '../utils/sseStatusUtils';

const TABS = [
    { id: 'header', label: 'Header', icon: 'file' },
    { id: 'tsf', label: 'TSF', icon: 'shield' },
    { id: 'items', label: FORM_TITLES.ITEM_DETAILS, icon: 'grid' }
];

const ImportResults = ({ data, onReset }) => {
    const dispatch = useDispatch();
    const tagDetails = useSelector(state => state.tags.tagDetails) || [];
    const bomDetails = useSelector(state => state.tags.bomDetails) || [];
    const isOrderMapped = useSelector(state => state.layout.isOrderMapped);
    const { selectedTagIds, setSelectedTagIds } = useSelection();

    const [activeTab, setActiveTab] = useState('header');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [isReviewing, setIsReviewing] = useState(false);
    const [reviewResult, setReviewResult] = useState(null);
    const [reviewError, setReviewError] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
    const [submissionPhase, setSubmissionPhase] = useState('idle');
    const [submissionTitle, setSubmissionTitle] = useState('');
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [submissionDetails, setSubmissionDetails] = useState(null);
    const [lastSseMessage, setLastSseMessage] = useState('');
    const [activeJobId, setActiveJobId] = useState(null);
    const [sseTestStatus, setSseTestStatus] = useState('idle');
    const [sseTestLog, setSseTestLog] = useState([]);
    const eventSourceRef = useRef(null);
    const sseTestEventSourceRef = useRef(null);
    const sseTestTimeoutRef = useRef(null);

    const fileUploadId = useSelector(state => state.tags.fileUploadId);

    const normalizeValue = (value) => {
        if (value === null || value === undefined) return '';
        return String(value).trim().toLowerCase();
    };

    const closeSseConnection = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    };

    const closeSseTestConnection = () => {
        if (sseTestEventSourceRef.current) {
            sseTestEventSourceRef.current.close();
            sseTestEventSourceRef.current = null;
        }
        if (sseTestTimeoutRef.current) {
            clearTimeout(sseTestTimeoutRef.current);
            sseTestTimeoutRef.current = null;
        }
    };

    const appendSseTestLog = (message) => {
        setSseTestLog((prev) => [...prev, message]);
    };

    const getImportToolApiUrl = () => {
        const rawUrl = import.meta.env.VITE_IMPORT_TOOL_API_URL || window.location.origin;
        const sanitized = rawUrl.replace(/\/$/, '');
        if (sanitized.endsWith('/import-tool/api')) return sanitized;
        if (sanitized.endsWith('/import-tool')) return `${sanitized}/api`;
        return `${sanitized}/import-tool/api`;
    };

    const startSseTest = () => {
        closeSseTestConnection();
        dispatch(clearSseStatus());
        dispatch(setSseJobId('test-123'));
        dispatch(setSseStatus('connecting'));
        dispatch(addSseMessage({ text: 'Starting static SSE test...', timestamp: Date.now() }));
        setSseTestStatus('connecting');
        setSseTestLog(['Starting static SSE test...']);

        const baseUrl = getImportToolApiUrl();
        const sseUrl = `${baseUrl}/test-sse?jobId=test-123`;
        const eventSource = new EventSource(sseUrl, { withCredentials: true });

        sseTestEventSourceRef.current = eventSource;

        sseTestTimeoutRef.current = setTimeout(() => {
            appendSseTestLog('No event received within 6 seconds.');
            dispatch(addSseMessage({ text: 'No event received within 6 seconds.', timestamp: Date.now() }));
            setSseTestStatus('timeout');
            dispatch(setSseStatus('failed'));
            closeSseTestConnection();
        }, 6000);

        eventSource.onopen = () => {
            appendSseTestLog('SSE connection opened.');
            dispatch(addSseMessage({ text: 'SSE connection opened.', timestamp: Date.now() }));
            setSseTestStatus('connected');
            dispatch(setSseStatus('connected'));
        };

        eventSource.onmessage = (event) => {
            if (sseTestTimeoutRef.current) {
                clearTimeout(sseTestTimeoutRef.current);
                sseTestTimeoutRef.current = null;
            }

            const dataText = String(event.data || '');
            appendSseTestLog(`message event: ${dataText}`);
            dispatch(addSseMessage({ text: `message event: ${dataText}`, timestamp: Date.now() }));

            if (event.event === 'done' || /done|completed/i.test(dataText)) {
                appendSseTestLog('Done event received.');
                dispatch(addSseMessage({ text: 'Done event received.', timestamp: Date.now() }));
                setSseTestStatus('success');
                dispatch(setSseStatus('completed'));
                closeSseTestConnection();
            }
        };

        eventSource.onerror = () => {
            appendSseTestLog('SSE connection error or closed.');
            dispatch(addSseMessage({ text: 'SSE connection error or closed.', timestamp: Date.now() }));
            setSseTestStatus('failed');
            dispatch(setSseStatus('failed'));
            closeSseTestConnection();
        };
    };

    const extractJobIdFromResponse = (response) => {
        if (!response || typeof response !== 'object') return null;

        const directCandidates = [response.jobId, response.job_id, response.JobId, response.jobID, response.id];
        const nestedCandidates = [response?.data?.jobId, response?.data?.job_id, response?.result?.jobId, response?.result?.job_id];
        const candidates = [...directCandidates, ...nestedCandidates];

        return candidates.find(value => value !== undefined && value !== null && value !== '');
    };

    const startSseSubscription = (jobId) => {
        closeSseConnection();
        dispatch(clearSseStatus());
        dispatch(setSseJobId(jobId));
        dispatch(setSseStatus('connected'));
        dispatch(addSseMessage({ text: 'Subscribed to Oracle SSE status stream.', timestamp: Date.now() }));
        setActiveJobId(jobId);
        setSubmissionPhase('connected');
        setSubmissionTitle('Waiting for Oracle response…');
        setSubmissionMessage('Waiting for Oracle response…');
        setSubmissionDetails(null);
        setLastSseMessage('Connected to Oracle status stream.');

        const baseUrl = getImportToolApiUrl();
        const jobStatusUrl = `${baseUrl}/test-sse?jobId=${encodeURIComponent(jobId)}`;
        const eventSource = new EventSource(jobStatusUrl, { withCredentials: true });

        eventSource.onopen = () => {
            console.log('[SSE] Connected', { jobId, url: jobStatusUrl });
            dispatch(addSseMessage({ text: 'SSE subscription opened.', timestamp: Date.now() }));
            setSubmissionPhase('connected');
            setSubmissionTitle('Waiting for Oracle response…');
            setSubmissionMessage('Waiting for Oracle response…');
            setLastSseMessage('Connected to Oracle status stream.');
        };

        eventSource.onmessage = (event) => {
            console.log('[SSE] Message received', { jobId, data: event.data });
            const payload = parseSseEventPayload(event.data);
            const summary = getSseStatusSummary(payload);
            setSubmissionPhase(summary.phase);
            setSubmissionTitle(summary.title);
            setSubmissionMessage(summary.message);
            setSubmissionDetails(summary.details);
            const messageText = typeof payload === 'string' ? payload : JSON.stringify(payload);
            setLastSseMessage(messageText);
            dispatch(addSseMessage({ text: messageText, timestamp: Date.now() }));

            if (summary.isFinal) {
                dispatch(setSseStatus('completed'));
                closeSseConnection();
            }
        };

        eventSource.onerror = () => {
            const errorText = 'Connection lost. Please retry.';
            setSubmissionPhase('failed');
            setSubmissionTitle('Failed');
            setSubmissionMessage(errorText);
            setSubmissionDetails(null);
            setLastSseMessage(errorText);
            dispatch(addSseMessage({ text: errorText, timestamp: Date.now() }));
            dispatch(setSseStatus('failed'));
            closeSseConnection();
        };

        eventSourceRef.current = eventSource;
    };

    useEffect(() => {
        return () => {
            closeSseConnection();
            closeSseTestConnection();
        };
    }, []);

    const handleCloseReviewModal = () => {
        closeSseConnection();
        setShowReviewModal(false);
        setSubmissionPhase('idle');
        setSubmissionTitle('');
        setSubmissionMessage('');
        setSubmissionDetails(null);
        setLastSseMessage('');
        setActiveJobId(null);
    };

    const getColVal = (row, possibleKeys) => {
        const keys = Object.keys(row);
        for (const pk of possibleKeys) {
            const match = keys.find(k => k.trim().toLowerCase() === pk.toLowerCase());
            if (match && row[match] !== undefined && row[match] !== null) return String(row[match]);
        }
        return '';
    };

    const getColKey = (row, possibleKeys) => {
        const keys = Object.keys(row);
        for (const pk of possibleKeys) {
            const match = keys.find(k => k.trim().toLowerCase() === pk.toLowerCase());
            if (match) return match;
        }
        return null;
    };

    const getTagMatchValue = (tag) => {
        const candidates = [
            tag.PRV2SIZETAGNAME,
            tag.Prv2SizeTagName,
            tag.tagName,
            tag.TagName,
            tag.name,
            tag.TagNumber,
            tag.tagNumber,
            tag.tagNumber,
            tag.TagId,
            tag.tagId
        ];
        return candidates.map(normalizeValue).find(v => v) || '';
    };

    const getCatalogMatchValue = (tag) => {
        const candidates = [
            tag.CATALOGCODE,
            tag.catalogCode,
            tag.CatalogCode,
            tag.catalogNumber,
            tag.CatalogNumber,
            tag.catalogNumber,
            tag.ERPCode,
            tag.erpCode,
            tag.Code
        ];
        return candidates.map(normalizeValue).find(v => v) || '';
    };

    const rowMatchesTag = (importTag, importCatalog, tag) => {
        const tagValue = getTagMatchValue(tag);
        const catalogValue = getCatalogMatchValue(tag);
        if (importTag && importCatalog) {
            return tagValue === importTag && catalogValue === importCatalog;
        }
        if (importTag) {
            return tagValue === importTag;
        }
        return importCatalog ? catalogValue === importCatalog : false;
    };

    const getImportTagValue = (item) => normalizeValue(getColVal(item, ["TAG #", "Tag Number", "TagNumber", "Tag", "Tag No", "TagNo"]));
    const getImportCatalogValue = (item) => normalizeValue(getColVal(item, ["PRODUCT NUMBER", "Catalog Code", "CatalogCode", "Product Number", "PRODUCT NO", "Catalog No", "CatalogNo", "Product #"]));

    const getBomEntryForTag = (tag) => {
        const tagId = tag?.id || tag?.tagId || tag?.TagId;
        return bomDetails.find(b => String(b.tagId || b.TagId || b.id) === String(tagId)) || null;
    };

    const getBomTagValue = (entry) => {
        const candidates = [
            entry.PRV2SIZETAGNAME,
            entry.Prv2SizeTagName,
            entry.tagName,
            entry.TagName,
            entry.name,
            entry.TagNumber,
            entry.tagNumber,
            entry.TagId,
            entry.tagId
        ];
        return candidates.map(normalizeValue).find(v => v) || '';
    };

    const getBomCatalogValues = (entry) => {
        const values = [];
        const candidates = [
            entry.CATALOGCODE,
            entry.catalogCode,
            entry.CatalogCode,
            entry.catalogNumber,
            entry.CatalogNumber,
            entry.productNumber,
            entry.ProductNumber,
            entry.ERPCode,
            entry.erpCode,
            entry.Code
        ];
        values.push(...candidates.map(normalizeValue).filter(v => v));

        const models = Array.isArray(entry.models) ? entry.models : [];
        models.forEach(model => {
            const modelValues = [model.modelNumber, model.productNumber, model.CatalogCode, model.catalogCode, model.Code, model.modelId, model.name];
            values.push(...modelValues.map(normalizeValue).filter(v => v));
            const bomItems = Array.isArray(model.bomItems) ? model.bomItems : (Array.isArray(model.items) ? model.items : (Array.isArray(model.products) ? model.products : []));
            bomItems.forEach(bi => {
                const biValues = [bi.ProductNumber, bi.productNumber, bi.CatalogCode, bi.catalogCode, bi.Code, bi.Item, bi.ItemNo, bi.ItemName, bi.PRODUCTID, bi.productId];
                values.push(...biValues.map(normalizeValue).filter(v => v));
            });
        });

        const entryItems = Array.isArray(entry.bomItems) ? entry.bomItems : (Array.isArray(entry.products) ? entry.products : []);
        if (entryItems.length) {
            entryItems.forEach(bi => {
                const biValues = [bi.ProductNumber, bi.productNumber, bi.CatalogCode, bi.catalogCode, bi.Code, bi.Item, bi.ItemNo, bi.ItemName, bi.PRODUCTID, bi.productId];
                values.push(...biValues.map(normalizeValue).filter(v => v));
            });
        }

        return Array.from(new Set(values));
    };

    const findBomEntryForImportRow = (item) => {
        const importTag = getImportTagValue(item);
        const importCatalog = getImportCatalogValue(item);
        if (!importTag && !importCatalog) return null;



        const exactMatch = bomDetails.find(entry => {
            const tagValue = getBomTagValue(entry);
            const catalogValues = getBomCatalogValues(entry);
            const isMatch = importTag && importCatalog ? tagValue === importTag && catalogValues.includes(importCatalog) : false;
            if (tagValue === importTag) {
            }
            return isMatch;
        });
        if (exactMatch) return exactMatch;

        if (importTag) {
            const tagMatch = bomDetails.find(entry => getBomTagValue(entry) === importTag);
            if (tagMatch) {
                return tagMatch;
            }
        }

        if (importCatalog) {
            const catalogMatch = bomDetails.find(entry => getBomCatalogValues(entry).includes(importCatalog));
            if (catalogMatch) return catalogMatch;
        }

        return null;
    };

    const findLinkableBomForImportRow = (item) => {
        return findBomEntryForImportRow(item);
    };

    const normalizeBomValue = (value) => {
        if (value === null || value === undefined) return '';
        return String(value).trim().toLowerCase();
    };

    const buildBomChildrenForRow = (row, bomEntry, importCatalog) => {

        const children = [];
        const itemKey = getColKey(row, ["Item", "Item No", "ITEM", "ItemNo", "Line Item", "Line", "No", "Line No"]) || "Item";
        const tagKey = getColKey(row, ["TAG #", "Tag Number", "TagNumber", "Tag", "Tag No", "TagNo"]) || "Tag Number";
        const qtyKey = getColKey(row, ["Qty", "QTY", "Quantity", "QTY.", "Order Qty"]) || "Qty";
        const descKey = getColKey(row, ["Description", "DESCRIPTION", "Desc", "Item Description", "Product Description"]) || "Description";
        const productNumberKey = getColKey(row, ["PRODUCT NUMBER", "Catalog Code", "CatalogCode", "Product Number", "PRODUCT NO", "Catalog No", "CatalogNo", "Product #"]) || "Product Number";

        const childBaseRow = {};
        Object.keys(row).forEach(k => {
            childBaseRow[k] = null;
        });

        const baseItem = String(row[itemKey] || '').trim();
        if (!baseItem || baseItem.includes('.')) {
            return children;
        }

        const models = Array.isArray(bomEntry.models) ? bomEntry.models : [];
        if (!models.length && Array.isArray(bomEntry.bomItems)) {
            models.push({ modelNumber: bomEntry.modelNumber || 'BOM', bomItems: bomEntry.bomItems });
        }
        if (!models.length && Array.isArray(bomEntry.products)) {
            models.push({ modelNumber: bomEntry.modelNumber || 'BOM', products: bomEntry.products });
        }

        if (!models.length) {
        }

        let overallChildIndex = 1;
        models.forEach(model => {
            const bomItems = Array.isArray(model.bomItems) ? model.bomItems : (Array.isArray(model.items) ? model.items : (Array.isArray(model.products) ? model.products : []));
            if (!bomItems.length) return;

            bomItems.forEach(bi => {
                const productValue = bi.PRODUCTID || bi.productId || bi.ProductNumber || bi.CatalogCode || bi.ItemName || bi.Item || null;
                const descValue = bi.Description || bi.description || bi.JUSTIFICATION || bi.STATE || null;

                children.push({
                    ...childBaseRow,
                    [itemKey]: `${baseItem}.${overallChildIndex}`,
                    [tagKey]: null,
                    [qtyKey]: bi.Qty || bi.qty || bi.Quantity || bi.quantity || bi.QUANTITYVALUE || bi.quantityValue || '1',
                    [descKey]: descValue,
                    [productNumberKey]: productValue
                });
                overallChildIndex += 1;
            });
        });

        return children;
    };

    const selectedTagRows = useMemo(() => {
        if (!selectedTagIds || selectedTagIds.size === 0) return [];
        const selectedIds = new Set(Array.from(selectedTagIds, id => String(id)));
        return tagDetails.filter(tag =>
            selectedIds.has(String(tag.TagId)) ||
            selectedIds.has(String(tag.tagId)) ||
            selectedIds.has(String(tag.id))
        );
    }, [selectedTagIds, tagDetails]);

    const currentImportItems = useMemo(() => {
        return (data?.itemDetails?.data || []).filter(row => {
            const itemKey = getColKey(row, ["Item", "Item No", "ITEM", "ItemNo", "Line Item", "Line", "No", "Line No"]) || "Item";
            const itemVal = String(row[itemKey] || '').trim().toLowerCase();
            return itemVal !== 'column1';
        });
    }, [data]);

    const hasPotentialLinkMatch = useMemo(() => {
        if (!currentImportItems.length || !bomDetails.length) return false;
        return currentImportItems.some(item => !!findLinkableBomForImportRow(item));
    }, [currentImportItems, bomDetails]);

    if (!data) return <div className="it-empty-state">{IMPORT_MESSAGES.NO_DATA_AVAILABLE}</div>;

    const handleLinkItemClick = (silent = false) => {

        if (isOrderMapped) {
            return;
        }
        if (!data?.itemDetails?.data) {
            return;
        }

        const matchedTagIds = [];
        const notFoundTags = [];

        data.itemDetails.data.forEach((item, index) => {
            const displayTag = getColVal(item, ["TAG #", "Tag Number", "TagNumber", "Tag", "Tag No", "TagNo"]).trim();
            const bomEntry = findLinkableBomForImportRow(item);
            if (bomEntry) {
                const id = bomEntry.tagId || bomEntry.TagId || bomEntry.id;
                if (id) matchedTagIds.push(String(id));
            } else if (!silent && displayTag && displayTag !== '-') {
                if (!notFoundTags.includes(displayTag)) notFoundTags.push(displayTag);
            }
        });


        if (matchedTagIds.length > 0) {
            setSelectedTagIds(prev => new Set([...prev, ...matchedTagIds]));
            dispatch(setIsOrderMapped(true));
            dispatch(setLeftPanelVisible(true));
        } else if (!silent) {
            setSnack({ open: true, message: 'No matching tags were found for the imported order items. Please verify the item Tag/ Catalog values.', severity: 'warning' });
        }

        if (!silent && notFoundTags.length > 0) {
            setSnack({ open: true, message: `Warning: The following tags from the OPS sheet were not found in the system: ${notFoundTags.join(', ')}`, severity: 'warning' });
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'header':
                return data.header ? (
                    <OrderProcessingForm data={data.header} mode="header" title={FORM_TITLES.ORDER_PROCESSING_SHEET} />
                ) : <div className="it-empty-state">{IMPORT_MESSAGES.NO_HEADER_DATA}</div>;
            case 'tsf':
                return data.tsf ? (
                    <OrderProcessingForm data={data.tsf} mode="tsf" title={FORM_TITLES.TRANSACTION_SCREENING_FORM} />
                ) : <div className="it-empty-state">{IMPORT_MESSAGES.NO_TSF_DATA}</div>;
            case 'items':
                let filteredData = (data?.itemDetails?.data || []).filter(row => {
                    const itemKey = getColKey(row, ["Item", "Item No", "ITEM", "ItemNo", "Line Item", "Line", "No", "Line No"]) || "Item";
                    const itemVal = String(row[itemKey] || '').trim().toLowerCase();
                    return itemVal !== 'column1';
                });

                if (isOrderMapped) {
                    const linkedData = [];
                    filteredData.forEach(row => {
                        linkedData.push(row);
                        const itemKey = getColKey(row, ["Item", "Item No", "ITEM", "ItemNo", "Line Item", "Line", "No", "Line No"]) || "Item";
                        const baseItem = String(row[itemKey] || '').trim();
                        if (baseItem && !baseItem.includes('.')) {
                            const importCatalog = getImportCatalogValue(row);
                            const bomEntry = findLinkableBomForImportRow(row);
                            if (bomEntry) {
                                const bomChildren = buildBomChildrenForRow(row, bomEntry, importCatalog);
                                if (bomChildren.length) {
                                    linkedData.push(...bomChildren);
                                }
                            }
                        }
                    });
                    filteredData = linkedData;
                }

                return filteredData.length ? (
                    <div className="it-table-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                                Showing <strong>{filteredData.length}</strong> items from the order.
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleLinkItemClick}
                                    disabled={isOrderMapped || !hasPotentialLinkMatch}
                                    className="it-action-btn-primary"
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: isOrderMapped ? '#16a34a' : '',
                                        opacity: isOrderMapped || !hasPotentialLinkMatch ? 0.55 : 1,
                                        cursor: isOrderMapped || !hasPotentialLinkMatch ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                                    </svg>
                                    {isOrderMapped ? 'BOM Linked' : 'Item Link'}
                                </button>
                                <button onClick={async () => {
                                    // On top-level Review & Submit click, fetch payload for this fileUploadId and open modal
                                    setIsReviewing(true);
                                    setReviewError(null);
                                    try {
                                        const resp = await fetchPayloadAPI(fileUploadId || null);
                                        const parsed = extractServerPayload(resp);
                                        setReviewResult(parsed);
                                        setShowReviewModal(true);
                                    } catch (err) {
                                        const msg = err?.response?.data?.message || err?.message || 'Failed to fetch payload.';
                                        setReviewError(msg);
                                        setSnack({ open: true, message: `Review failed: ${msg}`, severity: 'error' });
                                    } finally {
                                        setIsReviewing(false);
                                    }
                                }} className="it-action-btn-primary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: '#0284c7' }}>
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {isReviewing ? 'Fetching payload...' : 'Review & Submit Order'}
                                </button>
                            </div>
                        </div>
                        <CustomTable
                            data={filteredData}
                            columns={data?.itemDetails?.columns || []}
                            variant="excel"
                        />
                    </div>
                ) : <div className="it-empty-state">{IMPORT_MESSAGES.NO_ITEMS_DATA}</div>;

            default:
                return null;
        }
    };

    const isFormView = activeTab === 'header' || activeTab === 'tsf';

    const generatePayloadObject = () => {
        return {
            OrderHeader: data?.header || null,
            TransactionScreening: data?.tsf || null,
            LineItems: (data?.itemDetails?.data || []).map(item => ({
                ItemNo: item.Item,
                Qty: item.Qty,
                Description: item.Description,
                TagNumber: item["Tag Number"],
                IsBOM: String(item.Item).includes('.')
            }))
        };
    };

    const extractServerPayload = (reviewResp) => {
        if (!reviewResp) return null;
        // If server returned an object with a 'payload' property (possibly a JSON string), extract it
        try {
            if (typeof reviewResp === 'string') {
                return JSON.parse(reviewResp);
            }
        } catch (e) {
            // fallthrough
        }

        if (typeof reviewResp === 'object') {
            if (reviewResp.payload) {
                try {
                    return typeof reviewResp.payload === 'string' ? JSON.parse(reviewResp.payload) : reviewResp.payload;
                } catch (e) {
                    return reviewResp.payload;
                }
            }
            return reviewResp;
        }

        return null;
    };

    if (data && data.__importError) {
        return (
            <div className="it-import-results">
                <div style={{ padding: 24 }}>
                    <h3 style={{ color: '#b91c1c' }}>Import Failed</h3>
                    <p style={{ color: '#374151' }}>{data.details || data.error || 'Failed to parse and ingest Excel data.'}</p>
                    <div style={{ marginTop: 12 }}>
                        <button onClick={onReset} className="it-browse-btn">Upload Again</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="it-import-results">
            {(isSubmitting || submissionPhase !== 'idle') && (
                <div style={{
                    marginBottom: '12px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: submissionPhase === 'failed' ? '1px solid #fecaca' : submissionPhase === 'completed' ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
                    background: submissionPhase === 'failed' ? '#fff1f2' : submissionPhase === 'completed' ? '#f0fdf4' : '#eff6ff',
                    color: submissionPhase === 'failed' ? '#991b1b' : submissionPhase === 'completed' ? '#166534' : '#1d4ed8'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {(isSubmitting || submissionPhase === 'connected' || submissionPhase === 'submitted' || submissionPhase === 'waiting') && <CircularProgress size={16} />} 
                        <strong>{submissionTitle || 'Submission status'}</strong>
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>{submissionMessage || 'Waiting for Oracle response…'}</div>
                    {activeJobId && <div style={{ fontSize: '12px', opacity: 0.9 }}>Job ID: {activeJobId}</div>}
                </div>
            )}

            <div className="it-results-tabs-container">
                <div className="it-results-tabs">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className={`it-premium-tab ${isActive ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {getImportTabIcon(tab.icon)}
                                <span>{tab.label}</span>
                                {isActive && <div className="it-tab-indicator" />}
                            </button>
                        );
                    })}
                </div>
            </div>



            <div className="it-results-content" style={{
                minHeight: '500px',
                background: isFormView ? '#f1f5f9' : 'var(--brand-white)',
                padding: isFormView ? '20px' : '0'
            }}>
                {renderContent()}
            </div>

            {/* Review Payload Modal */}
            {showReviewModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', width: '800px', maxWidth: '90%', maxHeight: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Review Oracle Payload</h3>
                            <button onClick={handleCloseReviewModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#64748b' }}>&times;</button>
                        </div>
                        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, background: '#1e293b' }}>
                            <pre style={{ margin: 0, color: '#a5b4fc', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                {reviewResult ? JSON.stringify(reviewResult, null, 2) : JSON.stringify(generatePayloadObject(), null, 2)}
                            </pre>
                        </div>
                        {(submitError || reviewError) && (
                            <div style={{ padding: '12px 20px', background: '#fff1f2', color: '#991b1b', borderTop: '1px solid #fecaca' }}>
                                <strong>Error:</strong>&nbsp;{submitError || reviewError}
                            </div>
                        )}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            {(isSubmitting || submissionPhase !== 'idle') && (
                                <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '8px', background: '#fff', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        {(isSubmitting || submissionPhase === 'connected' || submissionPhase === 'submitted' || submissionPhase === 'waiting') && <CircularProgress size={16} />}
                                        <strong style={{ color: '#0f172a' }}>{submissionTitle || 'Submission status'}</strong>
                                    </div>
                                    <div style={{ color: '#475569', fontSize: '14px', marginBottom: '4px' }}>{submissionMessage || 'Waiting for Oracle response…'}</div>
                                    {activeJobId && <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Job ID: {activeJobId}</div>}
                                    {submissionDetails && (
                                        <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px', color: '#334155' }}>
                                            {typeof submissionDetails === 'string' ? submissionDetails : JSON.stringify(submissionDetails, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button onClick={handleCloseReviewModal} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>

                                <button
                                    onClick={async () => {
                                        setSubmitError(null);
                                        setIsSubmitting(true);
                                        setSubmissionPhase('submitting');
                                        setSubmissionTitle('Submitting order…');
                                        setSubmissionMessage('Submitting order…');
                                        setSubmissionDetails(null);
                                        setLastSseMessage('');
                                        closeSseConnection();

                                        const serverPayload = extractServerPayload(reviewResult);
                                        const payloadToSend = serverPayload || generatePayloadObject();
                                        try {
                                            const submitResponse = await submitToOracleAPI(payloadToSend);
                                            const jobId = extractJobIdFromResponse(submitResponse);

                                            if (!jobId) {
                                                throw new Error('The submit response did not include a jobId.');
                                            }

                                            setSubmissionPhase('submitted');
                                            setSubmissionTitle('Submitted');
                                            setSubmissionMessage('Submitted. Waiting for Oracle response…');
                                            setLastSseMessage('Submit accepted. Waiting for Oracle response…');
                                            setSnack({ open: true, message: 'Order submitted. Waiting for Oracle response…', severity: 'info' });
                                            startSseSubscription(jobId);
                                        } catch (err) {
                                            const msg = err?.response?.data?.message || err?.message || 'Failed to submit payload.';
                                            setSubmitError(msg);
                                            setSubmissionPhase('failed');
                                            setSubmissionTitle('Failed');
                                            setSubmissionMessage(msg);
                                            setSubmissionDetails(msg);
                                            setLastSseMessage(msg);
                                            setSnack({ open: true, message: `Submit failed: ${msg}`, severity: 'error' });
                                        } finally {
                                            setIsSubmitting(false);
                                        }
                                    }}
                                    disabled={isSubmitting || submissionPhase === 'submitting' || submissionPhase === 'submitted' || submissionPhase === 'connected' || submissionPhase === 'waiting'}
                                    className="it-action-btn-primary"
                                    style={{ padding: '8px 16px', background: '#0ea5e9' }}
                                >
                                    {isSubmitting ? 'Submitting order…' : submissionPhase === 'connected' || submissionPhase === 'submitted' || submissionPhase === 'waiting' ? 'Waiting for Oracle response…' : submissionPhase === 'completed' ? 'Completed' : submissionPhase === 'failed' ? 'Failed' : 'Send to Oracle'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Snackbar
                open={snack.open}
                autoHideDuration={6000}
                onClose={() => setSnack(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnack(prev => ({ ...prev, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ImportResults;
