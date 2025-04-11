import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.fullName || user?.username || "User"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              You are now signed in to your account
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            <Link href="/profile">
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>
            
            <Link href="/settings">
              <Button variant="outline" className="w-full">
                Settings
              </Button>
            </Link>
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
