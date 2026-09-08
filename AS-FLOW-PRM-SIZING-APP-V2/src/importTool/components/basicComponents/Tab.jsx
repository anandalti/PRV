export function Tab({ id, label, isActive, onClick, disabled }) {
    return (
        <button
            id={`it-tab-${id}`}
            role="tab"
            aria-selected={isActive}
            className={`it-tab-btn${isActive ? ' active' : ''}${disabled ? ' disabled' : ''}`}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
        >
            {label}
        </button>
    );
}