import Home from "../pages/Home/Home";
import { type RouteObject, useRoutes } from "react-router";
import MainLayout from "../Layouts/MainLayout";
import ChatPanel from "../pages/Chat/ChatPanel";
import AnalysisHistoryPanel from "../components/AnalysisHistoryPanel/AnalysisHistoryPanel";
import DeveloperInfo from "../components/DeveloperInfo/DeveloperInfo";
import MobileOnly from "./guard/MobileOnly";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "chat/:policy_id", element: <ChatPanel /> },
      {
        path: "history",
        element: (
          <MobileOnly>
            <AnalysisHistoryPanel />
          </MobileOnly>
        ),
      },
      {
        path: "dev",
        element: (
          <MobileOnly>
            <DeveloperInfo />
          </MobileOnly>
        ),
      },
    ],
  },
];

const RouteLayout = () => {
  const element = useRoutes(routes);
  return element;
};

export default RouteLayout;
