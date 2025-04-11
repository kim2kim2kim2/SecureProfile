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
import UploadPage from "@/pages/upload-page";
import GalleryPage from "@/pages/gallery-page";
import GalleryDetailPage from "@/pages/gallery-detail-page";
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
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Home, Upload, Grid, User, LogOut, Settings } from "lucide-react";

function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-16 z-50">
      <div className="grid grid-cols-4 h-full">
        <Link href="/">
          <a className={cn(
            "flex flex-col items-center justify-center h-full",
            location === "/" ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"
          )}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Hjem</span>
          </a>
        </Link>
        
        <Link href="/upload">
          <a className={cn(
            "flex flex-col items-center justify-center h-full",
            location === "/upload" ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"
          )}>
            <Upload className="h-6 w-6" />
            <span className="text-xs mt-1">Last opp</span>
          </a>
        </Link>
        
        <Link href="/gallery">
          <a className={cn(
            "flex flex-col items-center justify-center h-full",
            location === "/gallery" || location.startsWith("/gallery/") ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"
          )}>
            <Grid className="h-6 w-6" />
            <span className="text-xs mt-1">Galleri</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className={cn(
            "flex flex-col items-center justify-center h-full",
            (location === "/profile" || location === "/settings") ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"
          )}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profil</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

function TopNav() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">Bilde Analyzer</span>
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
                    Hjem
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/upload">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "border-transparent hover:text-primary-600 dark:hover:text-primary-400",
                      location === "/upload" && "border-b-2 border-primary-600 dark:border-primary-400"
                    )}
                  >
                    Last opp
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/gallery">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "border-transparent hover:text-primary-600 dark:hover:text-primary-400",
                      (location === "/gallery" || location.startsWith("/gallery/")) && "border-b-2 border-primary-600 dark:border-primary-400"
                    )}
                  >
                    Galleri
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
                    Profil
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
                    Innstillinger
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
              <span className="ml-1">Logg ut</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function ProfileMenu() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;
  if (location !== "/profile" && location !== "/settings") return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 py-4 px-4 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
        <Link href="/profile">
          <a className={cn(
            "px-4 py-2 rounded-md text-sm",
            location === "/profile" 
              ? "bg-primary-600 text-white dark:bg-primary-700" 
              : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm"
          )}>
            Profilside
          </a>
        </Link>
        <Link href="/settings">
          <a className={cn(
            "px-4 py-2 rounded-md text-sm",
            location === "/settings" 
              ? "bg-primary-600 text-white dark:bg-primary-700" 
              : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 shadow-sm"
          )}>
            Innstillinger
          </a>
        </Link>
        <button 
          onClick={() => logoutMutation.mutate()}
          className="ml-auto px-4 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Logger ut..." : "Logg ut"}
        </button>
      </div>
    </div>
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <ProfileMenu />
      <main className="flex-grow pb-20">
        <Switch>
          <ProtectedRoute path="/" component={HomePage} />
          <ProtectedRoute path="/upload" component={UploadPage} />
          <ProtectedRoute path="/gallery" component={GalleryPage} />
          <ProtectedRoute path="/gallery/:id" component={GalleryDetailPage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/settings" component={SettingsPage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
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
