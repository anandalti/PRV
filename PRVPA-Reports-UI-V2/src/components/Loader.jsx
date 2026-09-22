import { Spinner } from 'react-bootstrap';

const Loader = () => (
  <div className="loader-backdrop">
    <Spinner animation="border" role="status" />
  </div>
);

export default Loader;