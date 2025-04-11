import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateUserSchema, updatePasswordSchema } from "@shared/schema";
import { Eye, EyeOff, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

type ProfileFormValues = z.infer<typeof updateUserSchema>;
type PasswordFormValues = z.infer<typeof updatePasswordSchema>;

export default function ProfilePage() {
  const { user, updateProfileMutation, updatePasswordMutation, uploadProfileImageMutation } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      bio: user?.bio || "",
    },
  });

  // Update profile form values when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
  }, [user, profileForm.reset]);

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  // Profile form submission
  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }

  // Password form submission
  function onPasswordSubmit(data: PasswordFormValues) {
    updatePasswordMutation.mutate(data, {
      onSuccess: () => {
        passwordForm.reset();
      },
    });
  }

  // Handle profile image upload
  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("profileImage", file);
      uploadProfileImageMutation.mutate(formData);
    }
  }

  // Trigger file input click
  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account information</p>
          </div>

          <div className="md:flex md:space-x-6">
            {/* Profile Image Section */}
            <div className="md:w-1/3 mb-8 md:mb-0">
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-4">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-full h-full text-gray-400 dark:text-gray-600" />
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                
                <Button
                  type="button"
                  variant="link"
                  onClick={triggerFileInput}
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                >
                  Change picture
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG or GIF. 1MB max.
                </p>
              </div>
            </div>

            {/* Profile Form Section */}
            <div className="md:w-2/3">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm">
                          Full name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-14 border-b-2 border-t-0 border-x-0 rounded-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-0 shadow-none bg-transparent pt-4"
                            placeholder="Enter your full name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm">
                          Email address
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="h-14 border-b-2 border-t-0 border-x-0 rounded-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-0 shadow-none bg-transparent pt-4"
                            placeholder="Enter your email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm">
                          Bio
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="w-full border-b-2 border-t-0 border-x-0 rounded-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-0 shadow-none bg-transparent pt-4 resize-none"
                            placeholder="Tell us about yourself"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Change Password Section */}
              <div className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Change password</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Update your password to keep your account secure
                </p>

                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-6 space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <FormLabel className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm">
                            Current password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showCurrentPassword ? "text" : "password"}
                                className="h-14 border-b-2 border-t-0 border-x-0 rounded-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-0 shadow-none bg-transparent pt-4 pr-10"
                                placeholder="Enter your current password"
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <FormLabel className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm">
                            New password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showNewPassword ? "text" : "password"}
                                className="h-14 border-b-2 border-t-0 border-x-0 rounded-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-0 shadow-none bg-transparent pt-4 pr-10"
                                placeholder="Enter your new password"
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? "Updating..." : "Update password"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
