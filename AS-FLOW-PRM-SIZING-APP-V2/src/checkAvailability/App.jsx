import { Helmet } from "react-helmet";
import Home from "./containers/Home";
import "./styles/index.css";

function App() {
  return (
    <>
      <Helmet>
        <title>Check Availability</title>
      </Helmet>
      <Home />
    </>
  );
}

export default App;
