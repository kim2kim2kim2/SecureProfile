import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/lib/theme-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";

const settingsFormSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  profileVisibility: z.enum(["public", "private", "friends"]),
  activityLog: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { user, updateThemeMutation } = useAuth();
  const { theme, setTheme } = useTheme();

  // Settings form
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      theme: theme as "light" | "dark" | "auto",
      emailNotifications: true,
      pushNotifications: false,
      profileVisibility: "private",
      activityLog: true,
    },
  });

  // Update form when theme changes
  useEffect(() => {
    form.setValue("theme", theme as "light" | "dark" | "auto");
  }, [theme, form]);

  // Save settings
  function onSubmit(data: SettingsFormValues) {
    // Update theme in both contexts
    setTheme(data.theme);
    updateThemeMutation.mutate({ mode: data.theme });
    
    // Other settings would be handled by their respective API endpoints
    // For now, just log them
    console.log("Other settings saved:", {
      emailNotifications: data.emailNotifications,
      pushNotifications: data.pushNotifications,
      profileVisibility: data.profileVisibility,
      activityLog: data.activityLog,
    });
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Customize your app experience</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Appearance Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>

                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Dark mode</FormLabel>
                        <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                          Choose between light, dark, or system preference for color theme
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value: "light" | "dark" | "auto") => {
                            field.onChange(value);
                            setTheme(value);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto (system)</SelectItem>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Notification Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email notifications
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pushNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Push notifications
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy</h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="profileVisibility"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Profile visibility
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="friends">Friends only</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="activityLog"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Save login activity
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                  disabled={updateThemeMutation.isPending}
                >
                  {updateThemeMutation.isPending ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
