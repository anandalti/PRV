import PropTypes from 'prop-types';
const ValveCalculationField = ({ label, handleChange, inputname, selectname, items, value, valueUom }) => {
    return (
        <div style={{ width: "100%", float: "left" }}>
            <div style={{ width: "35%", float: "left" }}>
                <label>{label}</label>
            </div>
            <div style={{ width: "35%", float: "left" }}>
                <div className="input-group">
                    <input style={{ width: "95%" }} type="text" name={inputname} onChange={handleChange} value={value} className="form-control" />
                </div>
            </div>
            <div style={{ width: "30%", float: "left" }}>
                <select className="form-select" style={{ width: "95%" }} value={valueUom} name={selectname} onChange={handleChange}>
                    {
                        items.map((item) => {
                            return <option key={`${item.id}-${item.name}`} value={item.id}>{item.name}</option>;
                        })
                    }
                </select>
            </div>
            <div style={{ width: "100%", float: "left" }}>
                &nbsp;
            </div>
        </div>
    );
}

ValveCalculationField.propTypes = {
    label: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired,
    inputname: PropTypes.string.isRequired,
    selectname: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    value: PropTypes.string.isRequired,
    valueUom: PropTypes.string.isRequired
}

export default ValveCalculationField;