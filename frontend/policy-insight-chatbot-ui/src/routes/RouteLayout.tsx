import React, { type JSX } from "react";
import Header from "../components/Header/Header";
import FileUploader from "../components/FileUploader/FileUploader";
import { Routes, Route } from "react-router";
import Chat from "../pages/chat/Chat";

interface IRoute {
  path: string;
  element: JSX.Element;
}

const routes: IRoute[] = [
  { path: "/", element: <FileUploader /> },
  { path: "/chat/:policy_id", element: <Chat /> },
];

const RouteLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 min-h-0">
        <Routes>
          {routes.map((route : IRoute) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
    </div>
  );
};

export default RouteLayout;
