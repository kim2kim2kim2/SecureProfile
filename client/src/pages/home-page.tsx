import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Grid, User } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 py-8">
      <Card>
        <CardContent className="pt-6 pb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hallo Alle Sammen!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Velkommen til Bilde Analyzer, {user?.fullName || user?.username}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Link href="/upload">
              <a className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Last opp bilde</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Last opp et bilde og få en kreativ beskrivelse generert av AI
                  </p>
                </div>
              </a>
            </Link>

            <Link href="/gallery">
              <a className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                    <Grid className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Utforsk galleriet</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Se på tidligere opplastede bilder og deres beskrivelser
                  </p>
                </div>
              </a>
            </Link>

            <Link href="/profile">
              <a className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rediger profil</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Oppdater profilbildet ditt og personlige informasjon
                  </p>
                </div>
              </a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
