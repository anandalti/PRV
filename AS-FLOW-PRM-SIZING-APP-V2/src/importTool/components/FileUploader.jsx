import React, { useState, useRef } from 'react';

const FileUploader = ({ onUpload }) => {
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const allowedExtensions = ['.xlsx', '.xlsb'];

    const isAllowedFile = (file) => {
        if (!file || !file.name) return false;
        const name = String(file.name).toLowerCase();
        return allowedExtensions.some(ext => name.endsWith(ext));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (!isAllowedFile(file)) {
                setError('Please upload an Excel file (.xlsx or .xlsb).');
                return;
            }
            setError(null);
            onUpload(file);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!isAllowedFile(file)) {
                setError('Please upload an Excel file (.xlsx or .xlsb).');
                return;
            }
            setError(null);
            onUpload(file);
        }
    };

    return (
        <div className="it-file-uploader">
            <div
                className={`it-dropzone ${dragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    accept=".xlsx,.xlsb"
                />

                <div className="it-upload-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </div>

                <div className="it-upload-text">
                    <h3>Drag and drop your order processing sheet here</h3>
                    <span>Upload an Excel file (.xlsx or .xlsb)</span>
                </div>

                <button className="it-browse-btn" type="button">
                    Browse Files
                </button>

                {error && (
                    <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px', fontWeight: '500' }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploader;
