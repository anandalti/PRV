import { Container, Nav, Col, Navbar } from "react-bootstrap";

const PageFooter = () => {
    // return ();
    return (
        <div className="footer bg-dark text-white">
            <Container>
                <Col xs="12" className="copyright pt-4 pb-3">
                    &copy;{new Date().getFullYear()} PRV<sup>2</sup>Size Online Sizing All rights reserved.
                </Col>
                <Col xs="12"  className="footer-menu">
                    <Navbar bg="dark" expand="lg" variant="dark">
                        <Nav className="me-auto align-items-center w-100">
                            <Nav.Link href="#">Privacy Notice</Nav.Link>
                            <Nav.Link href="#">Terms of Use</Nav.Link>
                            <Nav.Link href="#">Cookies</Nav.Link>
                        </Nav>
                    </Navbar>
                </Col>
            </Container>
        </div>
    );
}
export default PageFooter;