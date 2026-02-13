import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MitreNavigator from "./pages/MitreNavigator";
import AIQueryTools from "./pages/AIQueryTools";
import Login from "./pages/Login";
import AdminUsers from "./pages/AdminUsers";
import TopBar from "./components/TopBar";
import { useAuth } from "@/_core/hooks/useAuth";

function Router() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path={"/login"} component={Login} />
        <Route path={"*"} component={Login} />
      </Switch>
    );
  }

  return (
    <>
      <TopBar />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/mitre"} component={MitreNavigator} />
        <Route path={"/ai-tools"} component={AIQueryTools} />
        <Route path={"/admin/users"} component={AdminUsers} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
