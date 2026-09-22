import { useSelector } from "react-redux";
import BasicLayout from "./BasicLayout";
import AdvancedLayout from "./AdvancedLayout";

const PageContent = () => {
    const isAdvanced = useSelector(state => state.layout.isAdvanced);
    return (
        <div className="layoutContent">
            {isAdvanced ? <AdvancedLayout /> : <BasicLayout />}
        </div>
    );a
}
export default PageContent;