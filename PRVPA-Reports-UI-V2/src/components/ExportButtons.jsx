import { useSelector } from "react-redux";
import IconButton from "../customComponents/IconButton"
import useExportOptions from "../customHooks/useExportOptions";
const ExportButtons = ({ disabled }) => {
    const reportTemplateHtml = useSelector(state => state.reportTypes.reportTemplateHtml);
    const { reportExportOptions } = useSelector(state => state.layout);
    const { downloadReport } = useExportOptions(reportTemplateHtml);
    return (
        <>
            {reportExportOptions.map((exportOption) => {
                if ((exportOption.name === "xlsx") || (exportOption.name === "pdf")) {
                    return (
                        <IconButton
                            disabled={disabled}
                            key={exportOption.name}
                            onClick={() => {
                                downloadReport(
                                    exportOption.name
                                )
                            }}
                            name={exportOption.name}
                            svgPath={exportOption.iconSvg}
                            color={exportOption.iconColor}
                        />
                    )
                }
            })}
        </>
    )
}

export default ExportButtons;