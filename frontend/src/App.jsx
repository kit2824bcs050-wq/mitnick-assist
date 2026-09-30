import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import SocChat from "./components/SocChat";

import Overview from "./pages/Overview";
import SecurityAlerts from "./pages/SecurityAlerts";
import Assets from "./pages/Assets";
import AiSoc from "./pages/AiSoc";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Topbar from "./components/Topbar";

function App() {
  return (
    <div className="soc-app">

      <Sidebar />

      <div className="soc-main">
        <Topbar />

        <div className="soc-content">
        <Routes>

          <Route
            path="/"
            element={
              <Navigate
                to="/overview"
                replace
              />
            }
          />

          <Route
            path="/overview"
            element={<Overview />}
          />

          <Route
            path="/alerts"
            element={<SecurityAlerts />}
          />

          <Route
            path="/assets"
            element={<Assets />}
          />

          <Route
            path="/ai-soc"
            element={<AiSoc />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Routes>

      </div>
    </div>

      <SocChat />

    </div>
  );
}

export default App;
