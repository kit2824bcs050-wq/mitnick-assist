import {
  useState,
} from "react";


function Settings() {
  const [apiUrl, setApiUrl] =
    useState(
      localStorage.getItem(
        "mitnick_api_url"
      )
      ||
      "http://127.0.0.1:8000"
    );


  const [
    pollInterval,
    setPollInterval,
  ] = useState(
    localStorage.getItem(
      "mitnick_poll_interval"
    )
    ||
    "3000"
  );


  const save = () => {

    localStorage.setItem(
      "mitnick_api_url",
      apiUrl
    );

    localStorage.setItem(
      "mitnick_poll_interval",
      pollInterval
    );

    window.location.reload();
  };


  return (
    <div className="page-shell">

      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            PLATFORM CONFIGURATION
          </span>

          <h1>Settings</h1>

          <p>
            Configure frontend communication with MITNICK backend.
          </p>
        </div>

      </div>


      <div className="panel settings-panel">

        <label>
          FastAPI URL
        </label>

        <input
          value={apiUrl}
          onChange={(e) =>
            setApiUrl(
              e.target.value
            )
          }
        />


        <label>
          Dashboard refresh interval
        </label>

        <select
          value={pollInterval}
          onChange={(e) =>
            setPollInterval(
              e.target.value
            )
          }
        >

          <option value="1000">
            1 second
          </option>

          <option value="3000">
            3 seconds
          </option>

          <option value="5000">
            5 seconds
          </option>

          <option value="10000">
            10 seconds
          </option>

        </select>


        <button
          className="primary-button"
          onClick={save}
        >
          Save Settings
        </button>

      </div>

    </div>
  );
}


export default Settings;
