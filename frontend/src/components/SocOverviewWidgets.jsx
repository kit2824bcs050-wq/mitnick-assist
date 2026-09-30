import {
  Activity,
  ShieldCheck,
  Server,
  BrainCircuit,
  Wifi,
} from "lucide-react";

import "./SocOverviewWidgets.css";


function calculateRiskScore(
  latest,
  stats
) {
  if (!latest) {
    return 0;
  }

  let score = 0;

  const severity =
    latest.severity?.toUpperCase();

  if (severity === "CRITICAL") {
    score += 80;
  } else if (severity === "HIGH") {
    score += 65;
  } else if (severity === "MEDIUM") {
    score += 45;
  } else if (severity === "LOW") {
    score += 20;
  }

  const attackRatio =
    stats.total_events > 0
      ? stats.attacks /
        stats.total_events
      : 0;

  score += attackRatio * 20;

  return Math.min(
    100,
    Math.round(score)
  );
}


function riskLabel(score) {
  if (score >= 80) {
    return "CRITICAL";
  }

  if (score >= 60) {
    return "HIGH";
  }

  if (score >= 35) {
    return "MEDIUM";
  }

  return "LOW";
}


function formatTime(timestamp) {
  if (!timestamp) {
    return "--";
  }

  return new Date(
    timestamp
  ).toLocaleTimeString();
}


function SocOverviewWidgets({
  latest,
  alerts,
  stats,
  backendOnline,
}) {

  const score =
    calculateRiskScore(
      latest,
      stats
    );

  const level =
    riskLabel(score);

  const recentAlerts =
    alerts.slice(0, 8);


  return (

    <section className="soc-widget-grid">

      {/* =========================
          RISK SCORE
      ========================== */}

      <div className="soc-widget risk-widget">

        <div className="soc-widget-heading">

          <div>
            <span>
              SECURITY POSTURE
            </span>

            <h3>
              Dynamic Risk Score
            </h3>
          </div>

          <ShieldCheck size={21} />

        </div>


        <div className="risk-layout">

          <div
            className={
              `risk-ring risk-${level.toLowerCase()}`
            }
            style={{
              "--risk":
                `${score * 3.6}deg`,
            }}
          >

            <div className="risk-ring-inner">

              <strong>
                {score}
              </strong>

              <span>
                / 100
              </span>

            </div>

          </div>


          <div className="risk-info">

            <span>
              Current Risk
            </span>

            <strong
              className={
                `risk-text risk-text-${level.toLowerCase()}`
              }
            >
              {level}
            </strong>

            <p>
              Calculated from the
              latest incident severity
              and observed attack ratio.
            </p>

          </div>

        </div>

      </div>


      {/* =========================
          LIVE TIMELINE
      ========================== */}

      <div className="soc-widget timeline-widget">

        <div className="soc-widget-heading">

          <div>
            <span>
              LIVE DETECTIONS
            </span>

            <h3>
              Threat Timeline
            </h3>
          </div>

          <Activity size={21} />

        </div>


        <div className="threat-timeline">

          {recentAlerts.length === 0 ? (

            <div className="timeline-empty">
              No recent threats
            </div>

          ) : (

            recentAlerts.map(
              (
                alert,
                index
              ) => (

                <div
                  className="timeline-item"
                  key={
                    `${alert.timestamp}-${index}`
                  }
                >

                  <div
                    className={
                      `timeline-dot ${
                        alert.severity
                          ?.toLowerCase()
                      }`
                    }
                  />


                  <div className="timeline-line-content">

                    <div className="timeline-top">

                      <strong>
                        {alert.attack}
                      </strong>

                      <span>
                        {formatTime(
                          alert.timestamp
                        )}
                      </span>

                    </div>


                    <div className="timeline-bottom">

                      <span>
                        {alert.node}
                      </span>

                      <span>
                        {alert.confidence}%
                      </span>

                    </div>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </div>


      {/* =========================
          SOC HEALTH
      ========================== */}

      <div className="soc-widget health-widget">

        <div className="soc-widget-heading">

          <div>
            <span>
              PLATFORM STATUS
            </span>

            <h3>
              SOC Health
            </h3>
          </div>

          <Server size={21} />

        </div>


        <HealthRow
          icon={<Server size={17} />}
          name="FastAPI"
          detail={
            backendOnline
              ? "Operational"
              : "Offline"
          }
          active={backendOnline}
        />


        <HealthRow
          icon={
            <BrainCircuit size={17} />
          }
          name="DNN Engine"
          detail="Detection Active"
          active
        />


        <HealthRow
          icon={<Wifi size={17} />}
          name="Sandbox Node"
          detail="SANDBOX-01"
          active
        />


        <HealthRow
          icon={
            <BrainCircuit size={17} />
          }
          name="MITNICK AI"
          detail="RAG + Ollama"
          active
        />

      </div>

    </section>

  );
}


function HealthRow({
  icon,
  name,
  detail,
  active,
}) {

  return (

    <div className="health-row">

      <div className="health-icon">
        {icon}
      </div>


      <div className="health-info">

        <strong>
          {name}
        </strong>

        <span>
          {detail}
        </span>

      </div>


      <div
        className={
          active
            ? "health-state active"
            : "health-state offline"
        }
      >
        {active
          ? "ONLINE"
          : "OFFLINE"}
      </div>

    </div>

  );
}


export default SocOverviewWidgets;
