import { IMPORT_MESSAGES } from '../constants/ErrorMessages';

const ValidationStatus = ({ file, validationResult, onReset, onConfirm, onCancel }) => {
    const isSuccess = validationResult.status === 'success';

    return (
        <div className="it-validation-summary">
            <div className={`it-status-banner ${isSuccess ? 'success' : 'error'}`}>
                <div className="it-status-icon">
                    {isSuccess ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    )}
                </div>
                <div className="it-status-content">
                    <h4>{isSuccess ? IMPORT_MESSAGES.VALIDATION_SUCCESS_TITLE : IMPORT_MESSAGES.VALIDATION_FAILED_TITLE}</h4>
                    <p>
                        {isSuccess 
                            ? IMPORT_MESSAGES.VALIDATION_SUCCESS_DESC 
                            : IMPORT_MESSAGES.VALIDATION_FAILED_DESC}
                    </p>

                    {!isSuccess && (
                        <div className="it-error-list">
                            {validationResult.errors.map((err, index) => (
                                <div key={index} className="it-error-item">
                                    <div className="it-error-dot" />
                                    <span>{err}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="it-file-meta">
                <div className="it-file-info">
                    <span className="it-file-name">{file.name}</span>
                    <span className="it-file-details">
                        {(file.size / 1024).toFixed(1)} KB • Uploaded at {new Date().toLocaleTimeString()}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="it-btn-link" 
                        onClick={onCancel || onReset}
                        style={{ textTransform: 'none', color: '#64748b' }}
                    >
                        Cancel
                    </button>
                    <button
                        className="it-browse-btn"
                        onClick={onConfirm}
                        disabled={!isSuccess}
                        style={{
                            opacity: !isSuccess ? 0.6 : 1,
                            cursor: !isSuccess ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Process Order
                    </button>
                    <button className="it-browse-btn" onClick={onReset} style={{ background: 'transparent', color: '#64748b', marginLeft: 8 }}>
                        Upload Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValidationStatus;
