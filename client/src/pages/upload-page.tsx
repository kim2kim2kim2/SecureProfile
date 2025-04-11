import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImagePlus, Upload, Loader2 } from "lucide-react";

// Define form schema
const formSchema = z.object({
  creativityValue: z.number().min(0).max(100),
  excitementValue: z.number().min(0).max(100),
  jinnification: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

// Helper function to get level text based on slider value
function getLevelText(value: number): string {
  if (value <= 25) return "Lav";
  if (value <= 50) return "Middels";
  if (value <= 75) return "Høy";
  return "Ekstrem";
}

export default function UploadPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creativityValue: 50,
      excitementValue: 50,
      jinnification: false,
    },
  });
  
  // File selection handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Ugyldig filtype",
          description: "Vennligst velg et JPG, PNG eller GIF bilde.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Filen er for stor",
          description: "Maksimal filstørrelse er 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle clicking the image upload area
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Kunne ikke laste opp bildet");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({
        title: "Bilde lastet opp!",
        description: "Bildet ditt har blitt analysert og lagt til i galleriet.",
      });
      setLocation(`/gallery/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Opplasting mislyktes",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission
  function onSubmit(values: FormValues) {
    if (!selectedImage) {
      toast({
        title: "Ingen fil valgt",
        description: "Vennligst velg et bilde å laste opp.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("creativityValue", values.creativityValue.toString());
    formData.append("excitementValue", values.excitementValue.toString());
    formData.append("jinnification", values.jinnification.toString());
    
    uploadMutation.mutate(formData);
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Last opp bilde</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Velg et bilde og juster innstillingene for AI-analyse
            </p>
          </div>
          
          {/* Image Upload Area */}
          <div 
            className="border-2 border-dashed rounded-lg p-8 mb-8 cursor-pointer hover:border-primary-400 transition-colors flex flex-col items-center"
            onClick={handleUploadClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="mb-4 max-w-full overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Forhåndsvisning" 
                  className="max-h-[300px] object-contain mx-auto rounded-lg"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <ImagePlus className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            
            <p className="text-center text-gray-600 dark:text-gray-400">
              {previewUrl ? "Klikk for å velge et annet bilde" : "Klikk for å velge et bilde"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              JPG, PNG eller GIF. Maks 5MB.
            </p>
          </div>
          
          {/* Settings Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Creativity Slider */}
              <FormField
                control={form.control}
                name="creativityValue"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base">Kreativitet</FormLabel>
                      <span className="bg-primary-50 dark:bg-primary-900 px-3 py-1 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium">
                        {getLevelText(field.value)} ({field.value}%)
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription className="text-xs flex justify-between">
                      <span>Lav</span>
                      <span>Middels</span>
                      <span>Høy</span>
                      <span>Ekstrem</span>
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              {/* Excitement Slider */}
              <FormField
                control={form.control}
                name="excitementValue"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base">Spenning</FormLabel>
                      <span className="bg-primary-50 dark:bg-primary-900 px-3 py-1 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium">
                        {getLevelText(field.value)} ({field.value}%)
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription className="text-xs flex justify-between">
                      <span>Lav</span>
                      <span>Middels</span>
                      <span>Høy</span>
                      <span>Ekstrem</span>
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              {/* Jinnification Switch */}
              <FormField
                control={form.control}
                name="jinnification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Jinnifikasjon</FormLabel>
                      <FormDescription>
                        Avslutt historien med Jenni som fikser bildet
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-6 text-lg"
                disabled={!selectedImage || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyserer...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Last opp og analyser
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}