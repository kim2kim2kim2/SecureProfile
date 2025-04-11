import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useParams, useLocation } from "wouter";
import { Gallery } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Loader2, 
  Camera, 
  Calendar, 
  User,
  Sparkles,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Helper function to get level text based on slider value
function getLevelText(value: number): string {
  if (value <= 25) return "Lav";
  if (value <= 50) return "Middels";
  if (value <= 75) return "Høy";
  return "Ekstrem";
}

export default function GalleryDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch gallery item details
  const { data: galleryItem, isLoading, error } = useQuery<Gallery>({
    queryKey: [`/api/gallery/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    onError: (error) => {
      toast({
        title: "Feil ved lasting av bilde",
        description: (error as Error).message,
        variant: "destructive",
      });
      setLocation("/gallery");
    },
  });
  
  // Format date 
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("nb-NO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto p-4 py-8">
      <div className="mb-6">
        <Link href="/gallery">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til galleriet
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 text-primary-600 dark:text-primary-400 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Laster inn bilde...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400 py-8">
          <p>Kunne ikke laste inn bildet</p>
          <p className="text-sm mt-2">{(error as Error).message}</p>
        </div>
      ) : galleryItem ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <img 
                src={galleryItem.image} 
                alt="Galleribilde" 
                className="w-full h-auto"
              />
            </Card>
          </div>
          
          {/* Info & Description */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Bilde analyse
                </h1>
                
                <div className="flex flex-col space-y-4 mb-6">
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300 mr-2">Kreativitet:</span>
                    <Badge variant="outline" className="ml-auto">
                      {getLevelText(galleryItem.creativityValue)} ({galleryItem.creativityValue}%)
                    </Badge>
                  </div>
                  
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300 mr-2">Spenning:</span>
                    <Badge variant="outline" className="ml-auto">
                      {getLevelText(galleryItem.excitementValue)} ({galleryItem.excitementValue}%)
                    </Badge>
                  </div>
                  
                  <div className="flex items-center">
                    <Camera className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300 mr-2">Jinnifikasjon:</span>
                    <Badge 
                      variant={galleryItem.jinnification ? "default" : "outline"}
                      className="ml-auto"
                    >
                      {galleryItem.jinnification ? "På" : "Av"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300 mr-2">Dato:</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-auto">
                      {formatDate(galleryItem.createdAt)}
                    </span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Beskrivelse
                  </h2>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {galleryItem.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}