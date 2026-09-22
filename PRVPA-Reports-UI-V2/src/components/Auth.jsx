import { useDispatch } from "react-redux";
import { authActions } from "../store/authSlice";
import { Container, Row, Form, Button, Col } from "react-bootstrap";

const Auth = () => {
    const dispatch = useDispatch();
    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(authActions.login());
    }
    return (
        <>
            <Container className="d-flex justify-content-center align-items-center " style={{ height: "100vh" }}>
                <Row className="text-center text-white w-25">
                    <Col sm={{ span: "12" }} className="bg-black py-4">
                        <h1 className="mb-3">
                            Login
                        </h1>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Control type="email" placeholder="Enter email" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Control type="password" placeholder="Password" />
                            </Form.Group>
                            <Button variant="success" type="submit">
                                Login
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
export default Auth;