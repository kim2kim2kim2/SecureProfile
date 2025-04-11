import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import NotFound from "@/pages/not-found";

import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">Auth App</span>
            </div>

            <NavigationMenuList className="ml-6 hidden sm:flex sm:space-x-8">
              <NavigationMenuItem>
                <Link href="/">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "border-transparent hover:text-primary-600 dark:hover:text-primary-400",
                      location === "/" && "border-b-2 border-primary-600 dark:border-primary-400"
                    )}
                  >
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/profile">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "border-transparent hover:text-primary-600 dark:hover:text-primary-400",
                      location === "/profile" && "border-b-2 border-primary-600 dark:border-primary-400"
                    )}
                  >
                    Profile
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/settings">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "border-transparent hover:text-primary-600 dark:hover:text-primary-400",
                      location === "/settings" && "border-b-2 border-primary-600 dark:border-primary-400"
                    )}
                  >
                    Settings
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </div>

          <div className="flex items-center">
            <button 
              onClick={() => logoutMutation.mutate()}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span className="ml-1">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <main>
        <Switch>
          <ProtectedRoute path="/" component={HomePage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/settings" component={SettingsPage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
