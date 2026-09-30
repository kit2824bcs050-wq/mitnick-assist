import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";


const SocContext = createContext(null);


export function SocProvider({ children }) {
  const apiUrl =
    localStorage.getItem("mitnick_api_url")
    || "http://127.0.0.1:8000";

  const pollInterval =
    Number(
      localStorage.getItem(
        "mitnick_poll_interval"
      )
    ) || 3000;


  const [stats, setStats] = useState({
    total_events: 0,
    attacks: 0,
    normal: 0,
    brute_force: 0,
    port_scan: 0,
  });

  const [alerts, setAlerts] = useState([]);
  const [latest, setLatest] = useState(null);

  const [health, setHealth] = useState(null);

  const [online, setOnline] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState(null);


  const refresh = async () => {
    try {
      const [
        healthResult,
        statsResult,
        alertsResult,
        latestResult,
      ] = await Promise.allSettled([
        axios.get(`${apiUrl}/health`),
        axios.get(`${apiUrl}/stats`),
        axios.get(`${apiUrl}/alerts`),
        axios.get(`${apiUrl}/alerts/latest`),
      ]);


      if (
        healthResult.status === "fulfilled"
      ) {
        setHealth(healthResult.value.data);
        setOnline(true);
      } else {
        setOnline(false);
      }


      if (
        statsResult.status === "fulfilled"
      ) {
        setStats(statsResult.value.data);
      }


      if (
        alertsResult.status === "fulfilled"
        &&
        Array.isArray(
          alertsResult.value.data
        )
      ) {
        setAlerts(
          alertsResult.value.data
        );
      }


      if (
        latestResult.status === "fulfilled"
      ) {
        setLatest(
          latestResult.value.data
        );
      }


      setLastUpdated(new Date());

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    refresh();

    const timer = setInterval(
      refresh,
      pollInterval
    );

    return () =>
      clearInterval(timer);

  }, [apiUrl, pollInterval]);


  return (
    <SocContext.Provider
      value={{
        apiUrl,
        stats,
        alerts,
        latest,
        health,
        online,
        loading,
        lastUpdated,
        refresh,
      }}
    >
      {children}
    </SocContext.Provider>
  );
}


export function useSoc() {
  return useContext(SocContext);
}
