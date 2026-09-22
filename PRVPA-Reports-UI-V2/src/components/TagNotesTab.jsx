import React, { useEffect, useState, Fragment } from 'react';
import { Modal, Form, Col, Row, } from 'react-bootstrap';
import Textarea from "../customComponents/Textarea";
import Checkbox from "../customComponents/Checkbox";
import { useDispatch, useSelector } from 'react-redux';
import TagNotesData from "../workflowSelection/TagNotes.json";
import { layoutActions } from '../store/layoutSlice';``
import { Button } from '@mui/material';
import styles from '../styles/Home.module.css';
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchSizingDetails } from '../store/valveCalculationSlice';
import { updateTagProperty } from '../store/tagPropertiesSlice';
const TagNotesTab = () => {
    const dispatch = useDispatch();
    const { menus, sizingId, configId } = useSelector(state => state.layout);
    const prevMenu = menus.find(menu => menu.id === 2);
    const nextMenu = menus.find(menu => menu.id === 4);
    const { onSelectMenu, markComplete } = layoutActions;
    const { sizingDetails: { sizingData } } = useSelector((state) => state.valveCalculation);
    const tagPropertiesData = sizingData?.TagProperties?.[0];
    const SizingId = sizingData?.SizingDetails[0]?.Id
    const [initFormData, setInitFormData] = useState({});
    const [formData, setFormData] = useState({});
    const [tagNotesSection, setTagNotesSection] = useState({});

    useEffect(() => {
        setTagNotesSection(TagNotesData);
        conmfigureFieldDefaultValue();
    }, []);

    useEffect(() => {
        if (tagPropertiesData) {
            setFormData(tagPropertiesData);
            setInitFormData(tagPropertiesData);
        }
    }, [tagPropertiesData]);

    const conmfigureFieldDefaultValue = () => {
        if (!TagNotesData || !TagNotesData.length) return;
        let configDefault = {};
        TagNotesData[0].blocks.forEach((block) => {
            block.fields.forEach(e => {
                configDefault[e.fieldName] = e.defaultValue;
            });
        });
        setFormData((prevData) => ({
            ...prevData,
            ...configDefault,
        }));
    }

    const refreshFieldConfig = (fieldName, value, fieldType) => {
        if (fieldType === "checkbox") {
            setTagNotesSection((prevSection) => {
                const updatedBlocks = prevSection[0].blocks.map((block) => ({
                    ...block,
                    fields: block.fields.map((field) =>
                        field.dependsOn === fieldName ? { ...field, isNumbered: value } : field
                    )
                }));
                const clonedSection = [...prevSection];
                clonedSection[0] = {
                    ...clonedSection[0],
                    blocks: updatedBlocks
                };
                return clonedSection;
            });
        }
    };
    
    const handleChange = (fieldName, value, fieldType) => {
        refreshFieldConfig(fieldName, value, fieldType);
        setFormData((prevData) => ({
            ...prevData,
            [fieldName]: fieldType === 'number' ? Number(value) : value,
        }));
    };
    
    const handleSave = async () => {
        const payloadWithSizingId = { ...formData, SizingId };

        if(JSON.stringify(formData) === JSON.stringify(initFormData)) {
            await dispatch(markComplete({ id: 3 }));
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
                        dispatch(markComplete({ id: 3 }));
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

    const renderBlock = () => {
        const blocks = tagNotesSection && tagNotesSection.length > 0 ? tagNotesSection[0].blocks : [];
        return (
          <>
            {blocks.length > 0 && blocks.map((block, index) => (
              <div className="input-group-border" key={index}>
                {renderFormFields(block)}
              </div>
            ))}
          </>
        );
    };

    const renderFormFields = (block) => {
        const fields = block && block.fields.length > 0 ? block.fields : [];
        return (
            fields.length > 0 && fields.map((field, index) => {
                switch (field.fieldType) {
                    case "textarea":
                        return (
                            <Textarea
                                key={index}
                                label={field.label}
                                type={field.fieldType}
                                grid={field.grid}
                                infoText={field.infoText}
                                value={formData[field.fieldName] || field.defaultValue}
                                isNumbered={field.isNumbered}
                                onChange={(e) => handleChange(field.fieldName, e.target.value, field.fieldType)}
                            />
                        );
                    case "checkbox":
                        return (
                            <Checkbox
                                key={index}
                                label={field.label}
                                grid={field.grid}
                                infoText={field.infoText}
                                checked={formData[field.fieldName] || field.defaultValue}
                                onChange={(e) => handleChange(field.fieldName, e.target.checked, field.fieldType)}
                            />
                        );
                    default:
                        return null;
                }
            })
        );
    };
    
    return (
        <>
            <Modal.Header>
                <Modal.Title>Tag Notes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { renderBlock() }
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

export default TagNotesTab;