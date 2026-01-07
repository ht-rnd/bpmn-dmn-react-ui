import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { AppProvider } from "./contexts/AppContext";
import { HomePage } from "./pages/HomePage";
import { BpmnPage } from "./pages/BpmnPage";
import { DmnPage } from "./pages/DmnPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <AppProvider>
      <App>
        <Outlet />
      </App>
    </AppProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const bpmnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bpmn",
  component: BpmnPage,
});

const dmnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dmn",
  component: DmnPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  bpmnRoute,
  dmnRoute,
]);

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  basepath: "/bpmn-dmn-react-ui",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
