import { useState, useEffect } from 'react';
import { convertUnit } from '../helper/convertUnit'

const useUnitConverter = (initialValue, fromUom, dimensionUoms) => {
  const [value, setValue] = useState(initialValue ? parseFloat(initialValue).toFixed(3) : 0);
  const [uom, setUom] = useState(fromUom);
  useEffect(() => {
    setValue(convertUnit(dimensionUoms, value, fromUom, uom));
  }, [uom]);
  return { value, uom, setUom, setValue };
};

export default useUnitConverter;