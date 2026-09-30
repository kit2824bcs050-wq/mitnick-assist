import {
  Activity,
  BarChart3,
  Bot,
  FileText,
  LayoutDashboard,
  Server,
  Settings,
  Shield,
  TriangleAlert,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";


const navigation = [
  {
    name: "Overview",
    path: "/overview",
    icon: LayoutDashboard,
  },
  {
    name: "Security Alerts",
    path: "/alerts",
    icon: TriangleAlert,
  },
  {
    name: "Assets",
    path: "/assets",
    icon: Server,
  },
  {
    name: "AI SOC",
    path: "/ai-soc",
    icon: Bot,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];


function Sidebar() {
  return (
    <aside className="soc-sidebar">

      <div className="soc-brand">

        <div className="soc-brand-logo">
          <Shield size={25} />
        </div>

        <div>
          <strong>
            MITNICK
          </strong>

          <span>
            ASSIST
          </span>
        </div>

      </div>


      <div className="sidebar-label">
        WORKSPACE
      </div>


      <nav className="soc-navigation">

        {navigation.map(
          ({
            name,
            path,
            icon: Icon,
          }) => (

            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive
                  ? "soc-nav-item active"
                  : "soc-nav-item"
              }
            >

              <Icon size={18} />

              <span>
                {name}
              </span>

            </NavLink>

          )
        )}

      </nav>


      <div className="sidebar-spacer" />


      <div className="sidebar-monitor">

        <Activity size={16} />

        <div>
          <strong>
            SOC Monitoring
          </strong>

          <span>
            Active
          </span>
        </div>

        <div className="online-indicator" />

      </div>

    </aside>
  );
}


export default Sidebar;
