import { ExportTableToPdf } from "../helper/exportPdf";
import { useExportExcel } from "../helper/exportExcel";
import { useSelector } from "react-redux";

const useExportOptions = (data) => {
  const { sizingId } = useSelector((state) => state.layout);
  const { selectedReportType } = useSelector((state) => state.reportTypes);
  const { exportTableToExcel } = useExportExcel();

  const downloadReport = (type) => {
    if (type === "pdf") ExportTableToPdf(sizingId);
    else if (type === "xlsx")
      exportTableToExcel(sizingId, selectedReportType.key);
  };

  return { downloadReport };
};

export default useExportOptions;
