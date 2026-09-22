import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import InputField from "../customComponents/InputField";
import { useDispatch, useSelector } from 'react-redux';
import TagPropertiesData from "../workflowSelection/TagProperties.json";
import { layoutActions } from '../store/layoutSlice';
import { Button } from '@mui/material';
import styles from '../styles/Home.module.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Form, Row, Col } from 'react-bootstrap';
import { fetchSizingDetails } from '../store/valveCalculationSlice';
import { updateTagProperty } from '../store/tagPropertiesSlice';
const TagPropertiesTab = () => {
    const [customLabel, setCustomLabel] = useState('');
    const [customInput, setCustomInput] = useState('');
    const dispatch = useDispatch();
    const { menus, sizingId, configId } = useSelector(state => state.layout);
    const prevMenu = menus.find(menu => menu.id === 1);
    const nextMenu = menus.find(menu => menu.id === 3);
    const { onSelectMenu, markComplete } = layoutActions;
    const { sizingDetails: { sizingData } } = useSelector((state) => state.valveCalculation);
    const tagPropertiesData = sizingData?.TagProperties?.[0];
    const SizingId = sizingData?.SizingDetails[0]?.Id
    const [initFormData, setInitFormData] = useState({});
    const [formData, setFormData] = useState({});
    useEffect(() => {
        console.log({tagPropertiesData})
        if (tagPropertiesData) {
            setFormData(tagPropertiesData);
            setInitFormData(tagPropertiesData);
        }
    }, [tagPropertiesData]);
    const handleChange = (fieldName, value, fieldType) => {
        const processedValue = fieldType === 'number' ? Number(value) : value;
        setFormData((prevData) => ({
            ...prevData,
            [fieldName]: processedValue,
        }));
    };
    const handleSave = async () => {
        const payloadWithSizingId = { ...formData, SizingId };
        if(JSON.stringify(formData) === JSON.stringify(initFormData)) {
            await dispatch(markComplete({ id: 2 }));
            dispatch(onSelectMenu(nextMenu));
        } else {
            try {
                dispatch(updateTagProperty([payloadWithSizingId])).then(r => {
                    if (r.meta.requestStatus === 'fulfilled') {
                        toast.success('Tag properties saved successfully!', {
                            position: toast?.POSITION?.TOP_RIGHT
                        });
                    }
                    dispatch(fetchSizingDetails({ sizingId })).then(r1 => {
                        dispatch(markComplete({ id: 2 }));
                        dispatch(onSelectMenu(nextMenu));
                    });
                })
            } catch (error) {
                console.error("Error saving tag properties:", error);
                toast.error('Failed to save tag properties. Please try again.', {
                    position: toast?.POSITION?.TOP_RIGHT
                });
            }
        }
    };

    const getFieldValue = (field) => {
        if (field.fieldType === 'number') {
            return formData[field.fieldName] !== undefined && !isNaN(formData[field.fieldName])
                ? Number(formData[field.fieldName])
                : "";
        }
        return formData[field.fieldName] ?? field.defaultValue;
    };

    return (
        <>
            <Modal.Header>
                <Modal.Title>Tag Properties</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    TagPropertiesData[0].fields.map((field, index) => (
                        <InputField
                            {...field}
                            key={index}
                            label={field.label}
                            type={field.fieldType}
                            grid={field.grid}
                            infoText={field.infoText}
                            value={getFieldValue(field)}
                            onChange={(e) => handleChange(field.fieldName, e.target.value, field.fieldType)}
                        />
                    ))
                }
                <Form.Group as={Row} style={{ marginBottom: '10px' }}>
                    <Col sm={4} style={{ textAlign: 'right', textWrap: 'nowrap' }}>
                        <Form.Control type="text" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} />
                    </Col>
                    <Col sm={6}>
                        <Form.Control type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} />
                    </Col>
                </Form.Group>
            </Modal.Body>
            <footer>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Button className={styles.footerButton} variant="secondary" onClick={() => {
                        dispatch(onSelectMenu(prevMenu));
                    }} style={{ marginRight: '10px' }}>
                        Previous
                    </Button>
                    <Button className={styles.footerButton} variant="primary" onClick={handleSave}>
                        Next
                    </Button>
                </div>
            </footer>
        </>
    );
};

export default TagPropertiesTab;