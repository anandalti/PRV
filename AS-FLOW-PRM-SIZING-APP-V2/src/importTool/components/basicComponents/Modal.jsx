import React from 'react';
import { useDispatch } from 'react-redux';
import { setImportModalOpen } from '../../store/slices/layoutSlice';

const Modal = ({ title, children, isOpen }) => {
    const dispatch = useDispatch();

    if (!isOpen) return null;

    return (
        <div className="it-modal-backdrop" onClick={() => dispatch(setImportModalOpen(false))}>
            <div className="it-modal-container" onClick={e => e.stopPropagation()}>
                <div className="it-modal-header">
                    <h3>{title}</h3>
                    <button 
                        className="it-modal-close" 
                        onClick={() => dispatch(setImportModalOpen(false))}
                    >
                        ×
                    </button>
                </div>
                <div className="it-modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
