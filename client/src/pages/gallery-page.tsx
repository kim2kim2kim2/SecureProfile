import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Gallery } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

import { Card, CardContent } from "@/components/ui/card";
import { Filter, Grid, Loader2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Helper function to get level text based on slider value
function getLevelText(value: number): string {
  if (value <= 25) return "Lav";
  if (value <= 50) return "Middels";
  if (value <= 75) return "Høy";
  return "Ekstrem";
}

export default function GalleryPage() {
  const { user } = useAuth();
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  
  // Fetch gallery items
  const { data: galleryItems, isLoading, error } = useQuery<Gallery[]>({
    queryKey: [showOnlyMine ? `/api/gallery?userId=${user?.id}` : '/api/gallery'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Toggle filter for viewing only user's images
  const toggleShowOnlyMine = () => {
    setShowOnlyMine(!showOnlyMine);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bildegalleri</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Utforsk AI-analyserte bilder og deres beskrivelser
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-only-mine"
                  checked={showOnlyMine} 
                  onCheckedChange={toggleShowOnlyMine}
                />
                <Label htmlFor="show-only-mine">Vis kun mine bilder</Label>
              </div>
              
              <Link href="/upload">
                <Button variant="default">
                  Last opp nytt bilde
                </Button>
              </Link>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 text-primary-600 dark:text-primary-400 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Laster inn galleri...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400 py-8">
              <p>Kunne ikke laste inn galleribilder</p>
              <p className="text-sm mt-2">{(error as Error).message}</p>
            </div>
          ) : galleryItems?.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-14 w-14 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Ingen bilder ennå
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {showOnlyMine 
                  ? "Du har ikke lastet opp noen bilder ennå."
                  : "Det er ingen bilder i galleriet ennå."}
              </p>
              <Link href="/upload">
                <Button>Last opp ditt første bilde</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {galleryItems?.map((item) => (
                <Link key={item.id} href={`/gallery/${item.id}`}>
                  <a className="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                      <img 
                        src={item.thumbnail || item.image} 
                        alt="Galleribilde"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                        <div className="flex justify-between text-xs">
                          <span>Kreativitet: {getLevelText(item.creativityValue)}</span>
                          <span>Spenning: {getLevelText(item.excitementValue)}</span>
                        </div>
                        {item.jinnification && (
                          <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                            Jennifikasjon
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                        {item.description?.substring(0, 120)}...
                      </p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}