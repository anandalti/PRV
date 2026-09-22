import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Form } from 'react-bootstrap';
import { Button } from '@mui/material';
import InputField from "../customComponents/InputField";
import DropDown from "../customComponents/dropDown";
import ProjectPropertiesData from "../workflowSelection/ProjectProperties.json";
import { layoutActions } from '../store/layoutSlice';
import { fetchSizingDetails } from '../store/valveCalculationSlice';
import styles from '../styles/Home.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { addProjectDetails, setProjectPropertiesData  } from '../store/projectPropertiesSlice';

const ProjectPropertiesTab = () => {
    const dispatch = useDispatch();
    const { sizingId, configId, menus } = useSelector(state => state.layout);
    const nextMenu = menus.find(menu => menu.id === 2);
    const { onSelectMenu, markComplete } = layoutActions;
    const { sizingDetails: { sizingData }, sizingError } = useSelector((state) => state.valveCalculation);
    let SizingId = sizingData?.SizingDetails[0]?.Id;
    const CreatedBy = sizingData?.SizingDetails[0]?.UserId;
    const [selectedProject, setSelectedProject] = useState('');
    const [initFormData, setInitFormData] = useState({});
    const [formData, setFormData] = useState({});
    useEffect(() => {
        if (sizingData?.ProjectProperties?.length) {
            const selectedProjectData = sizingData?.ProjectProperties?.find(project => project.Id === sizingData.SizingDetails[0].ProjectId);
            console.log({selectedProjectData});
            if (selectedProjectData) {
                setSelectedProject(selectedProjectData.Id);
                setFormData(selectedProjectData);
                setInitFormData(selectedProjectData);
                dispatch(setProjectPropertiesData(selectedProjectData));
            }
        }
    }, [sizingData?.ProjectProperties]);
    useEffect(() => {
        if (selectedProject !== 'Add New Project' && selectedProject) {
            const selectedProjectData = sizingData?.ProjectProperties?.find(project => project.Id === Number(selectedProject));
            if (selectedProjectData) {
                setFormData(selectedProjectData);
            } else {
                setFormData({});
            }
        } else {
            setFormData({});
        }
    }, [selectedProject, sizingData?.ProjectProperties, dispatch]);


    const handleProjectChange = (e) => {
        setSelectedProject(e.target.value);
    };

    const handleInputChange = (fieldName, value) => {
        setFormData(prevData => ({
            ...prevData,
            [fieldName]: value,
        }));
    };

    const handleAdd = async () => {
        const sizingIds = sizingData?.SizingDetails[0]?.Id;
        const IsActive = true;
        SizingId = sizingIds;
        const jsonData = { ...formData, SizingId, CreatedBy, IsActive };
        try {
            dispatch(addProjectDetails([jsonData])).then(r => {
                console.log({r});
                if (r.meta.requestStatus === 'fulfilled') {
                    toast.success('Project properties saved successfully!', {
                        position: toast?.POSITION?.TOP_RIGHT
                    });
                    dispatch(fetchSizingDetails({ sizingId })).then(r1 => {
                        dispatch(markComplete({ id: 1 }));
                        dispatch(onSelectMenu(nextMenu));
                    })
                }
            });
        } catch (error) {
            console.error("Error saving Project properties:", error);
            toast.error('Failed to add Project Properties. Please try again.', {
                position: toast?.POSITION?.TOP_RIGHT
            });
        }
    };

    const handleSave = async () => {
        const IsActive = true;
        const Id = Number(selectedProject);
        const jsonData = { ...formData, SizingId, CreatedBy, Id, IsActive };
        if (JSON.stringify(formData) === JSON.stringify(initFormData)) {
            await dispatch(markComplete({ id: 1 }));
            dispatch(onSelectMenu(nextMenu));
        } else {
            try {
                dispatch(addProjectDetails([jsonData])).then(r => {
                    if (r.meta.requestStatus === 'fulfilled') {
                        toast.success('Project properties saved successfully!', {
                            position: toast?.POSITION?.TOP_RIGHT
                        });
                        dispatch(fetchSizingDetails({ sizingId })).then(r1 => {
                            dispatch(markComplete({ id: 1 }));
                            dispatch(onSelectMenu(nextMenu));
                        })
                    }
                });
            } catch (error) {
                console.error("Error saving Project properties:", error);
                toast.error('Failed to save Project Properties. Please try again.', {
                    position: toast?.POSITION?.TOP_RIGHT
                });
            }
        }
    };
    const handleDelete = async () => {
        const IsActive = false;
        const Id = Number(selectedProject);
        const jsonData = { ...formData, SizingId, CreatedBy, Id, IsActive };
        try {
            const apiUrl = `${process.env.VITE_API_URL}/project/`;
            const response = await axios.post(apiUrl, [jsonData]);
            if (response.status === 200) {
                toast.success('Project deleted successfully', {
                    position: toast?.POSITION?.TOP_RIGHT
                });
                dispatch(fetchSizingDetails({ sizingId }));
            }
        } catch (error) {
            console.error("Error deleting the project:", error);
            toast.error('Failed to delete the project. Please try again.', {
                position: toast?.POSITION?.TOP_RIGHT
            });
        }
    };
    const projectOptions = [
        ...(sizingData?.ProjectProperties?.filter(project => project.IsActive === true)
            .map(project => ({
                label: project.ProjectName,
                value: project.Id
            })) || [])
    ];

    return (
        <>
            <Modal.Header>
                <Modal.Title>Project Properties</Modal.Title>
            </Modal.Header>
            <div>
                {
                    ProjectPropertiesData[0].fields.map((field, index) => (
                        field.type === 'dropdown' ? (
                            <>
                            <Row>
                                 <Col sm={4} style={{display: 'flex', alignItems: 'center', justifyContent: 'right'}}>
                                    <Form.Label>{'Select Project'}</Form.Label>
                                </Col>
                                <Col sm={6} >
                                    <DropDown
                                        label=""
                                        value={selectedProject}
                                        options={projectOptions}
                                        defaultValue="Add New Project"
                                        onChange={handleProjectChange}
                                    />
                                </Col>
                                <Col sm={2}>
                                    {
                                        selectedProject !== '' &&
                                        <>
                                            <FontAwesomeIcon icon={faTrash} onClick={handleDelete} />
                                        </>
                                    }
                                </Col>
                            </Row>
                            <hr />
                            </>
                        ) : (
                            <InputField
                                key={index}
                                label={field.label}
                                infoText={field.infoText}
                                type={field.fieldType}
                                value={formData[field?.fieldName] || field?.defaultValue}
                                defaultValue={field.defaultValue}
                                onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                            />
                        )
                    ))
                }
            </div>
            <footer>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'end', marginBottom: '1rem' }}>
                    <Button className={styles.footerButton} variant="primary" onClick={() => { selectedProject === '' ? handleAdd() : handleSave(); }} disabled={!!sizingError}>
                        Next
                    </Button>
                </div>
            </footer>
        </>
    );
};

export default ProjectPropertiesTab;