import HeaderText from "./HeaderText";
import PageContent from "./PageContent";
import Loader from "./Loader";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Container } from "@mui/material"
import { paddingZero } from "../styles/StyleObjectProperties";
import { fetchUOM } from "../store/layoutSlice";

const Layout = () => {
    const reportTypes = useSelector(state => state.reportTypes);
    const valveCalculation = useSelector(state => state.valveCalculation);
    const layout = useSelector(state => state.layout);
    const tagProperties = useSelector(state => state.tagProperties);
    const projectProperties = useSelector(state => state.projectProperties);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchUOM());
    }, []);

    useEffect(() => {
        const isLoadingUpdate = !(
            reportTypes.idle &&
            valveCalculation.idle &&
            layout.idle &&
            tagProperties.idle &&
            projectProperties.idle
        );
        setIsLoading(isLoadingUpdate);
    }, [reportTypes, valveCalculation, layout, tagProperties, projectProperties]);
    return (
        <>
            {!!valveCalculation.error && <div id="service-down">{valveCalculation.error}</div>}
            <Container maxWidth={"lg"} sx={paddingZero}>
                {isLoading && <Loader />}
                <HeaderText />
                <Container style={{ "background": "whitesmoke", "marginTop": "16px" }}>
                    <PageContent />
                </Container>
            </Container>
        </>
    );
}
export default Layout;