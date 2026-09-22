import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConfigDetails, fetchDimensionDetails, fetchSizingDetails } from '../store/valveCalculationSlice';
import NavigationComponent from "./NavigationComponent";
import { Col, Row, Form, InputGroup, Modal  } from 'react-bootstrap';
import { layoutActions } from '../store/layoutSlice';
import { TabPanel } from './TabPanel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { use } from 'react';

const BasicLayout = () => {
    const dispatch = useDispatch();
    const { menus, selectedMenu, sizingId, configId } = useSelector(state => state.layout);
    const { sizingDetails, sizingError, configError } = useSelector(state => state.valveCalculation);
    const [sizingIds, setSizingId] = useState(sizingId);
    const [configIds, setConfigId] = useState(configId);
    const { onSelectMenu, markComplete, disableMenus } = layoutActions;
    useEffect(() => {
        setSizingId(sizingId);
        setConfigId(configId);
    }, [sizingId, configId]);
    const { selectedReportType } = useSelector(state => state.reportTypes);
    const handleFetchSizingId = async () => {
        try {
            dispatch(fetchSizingDetails({ sizingId: sizingIds, configId: configIds }));
        } catch (error) {
            console.error("Error fetching sizing data:", error);
        }
    }
    useEffect(() => {
        if(!!sizingError) {
            dispatch(disableMenus());
        }
    }, [sizingError]);
    useEffect(() => {
        if (!sizingId) return;
        dispatch(fetchSizingDetails({ sizingId })).then(r => {
            if(r?.meta?.requestStatus === 'fulfilled') {
                if(r?.payload?.sizingData && configId) {
                    dispatch(fetchConfigDetails({ configId, sizingDetails: r.payload.sizingData })).then(r1 => {
                        if(r?.meta?.requestStatus === 'fulfilled' && r1?.payload?.sapData) {
                            dispatch(fetchDimensionDetails({ sizingDetails: r.payload.sizingData, ConfigId: configId }));
                        }
                    });
                }
            }
        });
    }, [sizingId, dispatch]);

    // useEffect(() => {
    //     if(sizingDetails && sizingDetails?.sizingData && !sizingDetails?.valveCalculation) {
    //         dispatch(fetchConfigDetails({configId, sizingDetails: sizingDetails.sizingData}));
    //     }
    // }, [sizingDetails?.sizingData, configId, dispatch]);

    return (
        <Row>
            <Col sm={9}>
                <Row className="mt-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Sizing ID and Input Group */}
                    <Col sm={6} style={{ display: 'flex', alignItems: 'center' }}>
                        <Form.Label style={{ marginRight: '10px', textAlign: 'right' }}>Sizing ID :</Form.Label>
                        <InputGroup style={{ flex: '1' }}>
                            <Form.Control
                                type="text"
                                value={sizingIds}
                                onBlur={handleFetchSizingId}
                                onChange={(e) => setSizingId(e.target.value)}
                                disabled={process.env.VITE_DEBUG === 'false'}
                                placeholder="Enter Sizing Id"
                                className={!!sizingError ? 'error' : ''}
                                />
                                
                            {
                                process.env.VITE_DEBUG !== 'false' &&
                                <InputGroup.Text
                                onClick={() => handleClickModal("sizing")}
                                style={{ cursor: 'pointer' }}
                                title="Fetch Sizing Data"
                                >
                                    <FontAwesomeIcon icon={faClipboard} />
                                </InputGroup.Text>
                            }
                        </InputGroup>
                    </Col>
                    <Col sm={6} style={{ display: 'flex', alignItems: 'center' }}>
                        <Form.Label style={{ marginRight: '10px', textAlign: 'right' }}>Config ID : </Form.Label>
                        <InputGroup style={{ flex: '1' }}>
                            <Form.Control
                                type="text"
                                value={configIds}
                                onBlur={handleFetchSizingId}
                                onChange={(e) => setConfigId(e.target.value)}
                                disabled={process.env.VITE_DEBUG === 'false'}
                                placeholder="Enter Config Id"
                                className={!!configError ? 'warning' : ''}
                            />
                            {
                                process.env.VITE_DEBUG !== 'false' &&
                                <InputGroup.Text
                                    onClick={() => handleClickModal("config")}
                                    style={{ cursor: 'pointer' }}
                                    title="Fetch Config Data"
                                >
                                    <FontAwesomeIcon icon={faClipboard} />
                                </InputGroup.Text>
                            }
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={6}>
                    {!!sizingError && <Form.Text id="sizingErrorText" as="div">
                            {sizingError}
                        </Form.Text>}
                    </Col>
                    <Col sm={6}>
                    {!!configError && <Form.Text id="configErrorText" as="div">
                        {configError}
                    </Form.Text>}
                    </Col>
                </Row>
                <TabPanel selectedMenu={selectedMenu} />
            </Col>
            <Col sm={3}>
                <NavigationComponent menus={menus} handleChange={(menu, index) => {
                    if(menu.id > selectedMenu.id && !selectedMenu.isCompleted) {
                        if(menu.id - selectedMenu.id > 1) {
                            const diff = menu.id - selectedMenu.id;
                            let ids = [];
                            let id = selectedMenu.id;
                            while(id < menu.id) {
                                ids.push(id);
                                id++;
                            }
                            dispatch(markComplete({ ids }));
                        }
                        dispatch(markComplete({ id: selectedMenu.id }));
                    };
                    dispatch(onSelectMenu(menu));
                }} />
            </Col>
        </Row>

    );
};

export default BasicLayout;
