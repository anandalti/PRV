import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import ValidationStatus from '../components/ValidationStatus';
import { useDispatch } from 'react-redux';
import { setShowOrderSheetTab, setActiveTab, setImportModalOpen, setIsOrderMapped } from '../store/slices/layoutSlice';
import { setImportedOrderData, setFileUploadId } from '../store/slices/tagsSlice';
import { readExcelFile } from '../helpers/importHelpers';
import { normalizeExcelToUI } from '../helpers/normalizeExcelToUI';
import { uploadExcelAPI } from '../store/api/excel';

const OrderImport = () => {
    const dispatch = useDispatch();
    const [step, setStep] = useState('upload'); // 'upload', 'validating', 'result'
    const [file, setFile] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [parsedData, setParsedData] = useState(null);

    const handleUpload = async (uploadedFile) => {
        setFile(uploadedFile);
        setStep('validating');
            try {
                const { base64 } = await readExcelFile(uploadedFile);
                setParsedData(null);

                if (base64) {
                    // Call API here to validate and get parsed data BEFORE "Process Order"
                    const resp = await uploadExcelAPI({ sourceFileBase64: base64 });
                    // store immutable fileUploadId returned by backend
                    const fileUploadId = resp?.fileUploadId || resp?.data?.fileUploadId || resp?.file_upload_id || null;
                    if (fileUploadId) {
                        dispatch(setFileUploadId(fileUploadId));
                    }
                    const serverData = resp?.excelData || resp?.data?.excelData || null;
                    const normalized = serverData ? normalizeExcelToUI(serverData) : null;
                    setParsedData(normalized);
                    setValidationResult({ status: 'success', metadata: { note: 'Server validation passed' } });
                } else {
                    setValidationResult({ status: 'error', errors: ['Failed to read file.'] });
                }
        } catch (err) {
            console.error("[OrderImport] Import API failed on upload:", err);
            const respErr = err?.response?.data || {};
            const errorMessage = respErr.error || respErr.message || err.message || 'Import API failed';
            const errorDetails = respErr.details || [];
            
            let errorsList = [];
            if (Array.isArray(errorDetails) && errorDetails.length > 0) {
                errorsList = errorDetails;
            } else if (typeof errorDetails === 'string') {
                errorsList = [errorDetails];
            } else {
                errorsList = [errorMessage];
            }

            
            setParsedData(null);
            setValidationResult({ status: 'error', errors: errorsList });
        }
        setStep('result');
    };

    const handleReset = () => {
        setFile(null);
        setValidationResult(null);
        setParsedData(null);
        setStep('upload');
    };

    const handleConfirm = async () => {
        if (!parsedData) return;

        dispatch(setImportedOrderData(parsedData));
        dispatch(setShowOrderSheetTab(true));
        dispatch(setActiveTab('orderSheet'));
        dispatch(setIsOrderMapped(false));
        dispatch(setImportModalOpen(false));
    };

    return (
        <div className="it-import-container">
            <div className={`it-import-card ${step === 'result' ? 'results-view' : ''}`}>
                <div className="it-import-header">
                    <h2>Order Processing Sheet</h2>
                    <p>Upload your Excel file to validate and import order details into the system.</p>
                </div>

                {step === 'upload' && (
                    <FileUploader onUpload={handleUpload} />
                )}

                {step === 'validating' && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="it-loading-spinner" style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid rgba(0, 74, 153, 0.1)',
                            borderTopColor: 'var(--brand-blue)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 20px'
                        }} />
                        <h3 style={{ color: 'var(--gray-700)', fontSize: '18px' }}>Validating order sheet...</h3>
                        <p style={{ color: 'var(--gray-500)' }}>Extracting form data from your file.</p>
                        <style>{`
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )}

                {step === 'result' && (
                    <ValidationStatus
                        file={file}
                        validationResult={validationResult}
                        onReset={handleReset}
                        onConfirm={handleConfirm}
                        onCancel={() => dispatch(setImportModalOpen(false))}
                    />
                )}
            </div>
        </div>
    );
};

export default OrderImport;
