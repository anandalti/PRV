import { useDispatch, useSelector } from "react-redux";
import { clearPayloadData, onUpdatePayloadData } from "../store/slices/workflowPayloadSlice";


const useTabPayload = () => {
    const dispatch = useDispatch();
    const {payloadData} = useSelector((state) => state.workflowPayload);
    
    
    const handleChange=(e, field) => {
        dispatch(onUpdatePayloadData({
            ...payloadData,
            [field.name]: field.value
        }));
    }

    const clearPayload = () => {
        dispatch(clearPayloadData());
    }
    
    return {
        payloadData,
        handleChange,
        clearPayload
    };
};

export default useTabPayload;