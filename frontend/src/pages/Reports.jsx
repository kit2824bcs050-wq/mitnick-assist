import {
  Download,
  FileJson,
  FileText,
} from "lucide-react";

import {
  useSoc,
} from "../context/SocContext";


function Reports() {
  const {
    alerts,
    stats,
  } = useSoc();


  const download = (
    content,
    filename,
    type
  ) => {

    const blob =
      new Blob(
        [content],
        { type }
      );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download = filename;

    anchor.click();

    URL.revokeObjectURL(url);
  };


  const exportJSON = () => {

    download(
      JSON.stringify(
        {
          generated:
            new Date()
              .toISOString(),

          statistics: stats,
          alerts,
        },
        null,
        2
      ),

      "mitnick-soc-report.json",

      "application/json"
    );
  };


  const exportCSV = () => {

    const header =
      "timestamp,node,attack,confidence,severity,status";


    const rows =
      alerts.map(
        (alert) =>
          [
            alert.timestamp,
            alert.node,
            alert.attack,
            alert.confidence,
            alert.severity,
            alert.status,
          ].join(",")
      );


    download(
      [
        header,
        ...rows,
      ].join("\n"),

      "mitnick-alerts.csv",

      "text/csv"
    );
  };


  return (
    <div className="page-shell">

      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            SOC DOCUMENTATION
          </span>

          <h1>Reports</h1>

          <p>
            Export detection and incident data.
          </p>
        </div>

      </div>


      <div className="report-grid">

        <button
          className="report-card"
          onClick={exportJSON}
        >

          <FileJson size={26} />

          <strong>
            JSON SOC Report
          </strong>

          <span>
            Statistics + full alert data
          </span>

          <Download size={18} />

        </button>


        <button
          className="report-card"
          onClick={exportCSV}
        >

          <FileText size={26} />

          <strong>
            CSV Alert Report
          </strong>

          <span>
            Export alert dataset
          </span>

          <Download size={18} />

        </button>

      </div>

    </div>
  );
}


export default Reports;
