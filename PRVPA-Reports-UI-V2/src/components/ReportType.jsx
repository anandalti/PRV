import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTemplateDataAPI, reportTypesActions } from "../store/reportTypesSlice";
import { Row, Col, Form, InputGroup, Modal } from "react-bootstrap";
import { fetchSizingDetails, valveCalculationActions } from "../store/valveCalculationSlice";
import axios from "axios";
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ExportButtons from "./ExportButtons";
import { valveActions } from "../store/valveSlice";
import { configActions } from "../store/configSlice";
import TemplateHtml from "./TemplateHtml";
import { Button } from '@mui/material'
import styles from '../styles/Home.module.css';

const ReportTypes = () => {
    const dispatch = useDispatch();
    const { reportTypes, selectedReportType } = useSelector(state => state.reportTypes);
    const { sizingDetails, refreshReport } = useSelector(state => state.valveCalculation);
    const { sizingId, configId } = useSelector(state => state.layout);
    const handleReportTypeSelected = (e) => {
        dispatch(reportTypesActions.onReportTypeSelected({ id: e.target.value ? parseInt(e.target.value) : '' }));
    }

    
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalData, setModalData] = useState(null);
    
    const handleClickModal = (type) => {
        if (type === "sizing") {
            setModalData(sizingDetails.sizingData);
            setModalTitle("Fetched SizingId Data");
        } else if (type === "config") {
            const { sizingData, ...sapData } = sizingDetails;
            setModalData(sapData);
            setModalTitle("Fetched Config Data");
        }
        setShowModal(true);
    }

    useEffect(() => {
        if (selectedReportType.id) {
            // dispatch(fetchTemplateDataAPI({ sizingId, reportType: selectedReportType.key, configId }));
            dispatch(valveCalculationActions.resetRefreshReport());
        }
    }, [selectedReportType, sizingId, configId, dispatch]);

    useEffect(() => {
        if (refreshReport && selectedReportType.id) {
            // dispatch(fetchTemplateDataAPI({ sizingId, reportType: selectedReportType.key, configId }));
        }
        dispatch(valveCalculationActions.resetRefreshReport());
    }, [refreshReport, sizingId, configId, dispatch]);

    const handleCloseModal = () => setShowModal(false);

    return (
        <>
            <br />
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', maxHeight: '300px', overflowY: 'auto' }}>
                        {modalData ? JSON.stringify(modalData, null, 2) : "No data fetched yet."}
                    </pre>
                </Modal.Body>
                <Modal.Footer>
                    <Button className={styles.footerButton} variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <br />
            <h5 style={{ marginRight: '10px' }}>Report Type</h5>
            <Row style={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                <Col sm={5} style={{ display: 'flex', alignItems: 'center' }}>
                    <Form.Select
                        value={selectedReportType.id}
                        onChange={handleReportTypeSelected}
                        style={{ marginRight: '10px' }}
                    >
                        <option value="">Select Report Type</option>
                        {
                            reportTypes.map((item, i) => (
                                item.id === 0 ? 
                                <option disabled key={`divider${i}`} value=''>{item.name}</option>
                                :
                                <option value={item.id} key={item.id}>{item.name}</option>
                            ))
                        }
                    </Form.Select>
                </Col>
                <Col sm="auto">
                    <ExportButtons />
                </Col>
            </Row>
            <TemplateHtml />
        </>
    );
}
export default ReportTypes;