import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../store/authSlice";
import { Container, Row, Nav, Navbar, Form, Col } from 'react-bootstrap';

const PageHeader = () => {
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(authActions.logout());
    }
    return (
        <Navbar bg="black" expand="lg" variant="dark">
            <Container>
                <Row className="w-100 justify-content-center align-items-center">
                    <Col sm="3" className="my-1">
                        <Navbar.Brand href="#home">
                            <img src="logo.png" className="logo" />
                        </Navbar.Brand>
                    </Col>
                    <Col sm="5" className="my-1 text-center text-white">
                        <h1>PRV<sup>2</sup>Size Reports Tool</h1>
                    </Col>
                    <Col sm="4">
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto justify-content-end w-100">
                                <Nav.Link href="#">About Us</Nav.Link>
                                <Nav.Link href="#">Careers</Nav.Link>
                                <Nav.Link href="#">Contact Us</Nav.Link>
                                <Nav.Link href="#" onClick={handleLogout} className="btn btn-secondary">Logout</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Col>
                </Row>
            </Container>
        </Navbar>
    );
}
export default PageHeader;