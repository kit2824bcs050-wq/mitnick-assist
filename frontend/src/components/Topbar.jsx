import {
  Activity,
  Bell,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { useLocation } from "react-router-dom";
import { useSoc } from "../context/SocContext";


const pageNames = {
  "/overview": "Security Overview",
  "/alerts": "Security Alerts",
  "/assets": "Asset Inventory",
  "/ai-soc": "AI SOC Analyst",
  "/analytics": "Threat Analytics",
  "/reports": "Reports",
  "/settings": "Platform Settings",
};


function Topbar() {
  const location = useLocation();

  const {
    alerts,
    latest,
    online,
    lastUpdated,
    refresh,
  } = useSoc();

  const pageTitle =
    pageNames[location.pathname]
    || "MITNICK ASSIST";


  return (
    <header className="global-topbar">

      <div className="topbar-page">

        <span className="topbar-eyebrow">
          MITNICK ASSIST / SOC
        </span>

        <h2>{pageTitle}</h2>

      </div>


      <div className="topbar-actions">

        {latest?.attack && (

          <div className="topbar-threat">

            <Activity size={15} />

            <div>
              <span>
                LATEST THREAT
              </span>

              <strong>
                {latest.attack}
              </strong>
            </div>

          </div>

        )}


        <div className="topbar-alerts">

          <Bell size={18} />

          {alerts.length > 0 && (
            <span>
              {alerts.length > 99
                ? "99+"
                : alerts.length}
            </span>
          )}

        </div>


        <button
          className="topbar-refresh"
          onClick={refresh}
          title="Refresh SOC data"
        >
          <RefreshCw size={17} />
        </button>


        <div
          className={
            online
              ? "topbar-system online"
              : "topbar-system offline"
          }
        >

          <ShieldCheck size={17} />

          <div>
            <strong>
              {online
                ? "SYSTEM ONLINE"
                : "BACKEND OFFLINE"}
            </strong>

            <span>
              {lastUpdated
                ? `Synced ${lastUpdated.toLocaleTimeString()}`
                : "Waiting for telemetry"}
            </span>
          </div>

        </div>

      </div>

    </header>
  );
}


export default Topbar;
