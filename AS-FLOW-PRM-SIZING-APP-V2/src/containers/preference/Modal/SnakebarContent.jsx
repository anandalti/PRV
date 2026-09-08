import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Snakebar from '../../../components/hoc/Snakebar';
import { updateSnakebar } from '../../../store/slices/preferenceSlice';

const SnakebarContent = ({ status, message, severity }) => {
  const dispatch = useDispatch();
  const [content, setContent] = useState(null);

  const handleClose = () => {
    dispatch(updateSnakebar({ status: false, message: "", severity: "" }));
    // console.log("Clicked on Close Button in Snakebar");
  };

  useEffect(() => {
    if (Array.isArray(message)) {
      const messageElement = (
        <ul style={{ listStyleType: 'none' }}>
          {message.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      );
      setContent(messageElement);
    } else {
      setContent(message);
    }
  }, [message]);

  return (
    <Snakebar
      open={status}
      autoHideDuration={3500}
      onClose={handleClose}
      content={content}
      severity={severity}
    />
  );
};

export default SnakebarContent;