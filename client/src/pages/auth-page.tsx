import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Extend schemas with additional validations
const loginSchema = loginUserSchema.extend({
  rememberMe: z.boolean().optional(),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot-password">("login");

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Login form submission
  function onLoginSubmit(data: LoginFormValues) {
    const { rememberMe, ...credentials } = data;
    loginMutation.mutate(credentials);
  }

  // Register form submission
  function onRegisterSubmit(data: RegisterFormValues) {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  }

  // Forgot password form submission
  function onForgotPasswordSubmit(data: ForgotPasswordFormValues) {
    // In a real app, this would send a password reset email
    console.log("Password reset requested for:", data.email);
    
    // Show success message
    setForgotPasswordSent(true);
  }

  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  return (
    <div className="flex-grow flex items-center justify-center p-4 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Login Form */}
      {authMode === "login" && (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Please sign in to continue</p>
            </div>

            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-14 border-b-2 border-t-0 border-x-0 rounded-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-0 shadow-none bg-transparent pt-4"
                          placeholder="Enter your username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="h-14 border-b-2 border-t-0 border-x-0 rounded-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-0 shadow-none bg-transparent pt-4 pr-10"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
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

                <div className="flex items-center justify-between">
                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="remember-me"
                          />
                        </FormControl>
                        <Label htmlFor="remember-me" className="text-gray-700 dark:text-gray-300 text-sm">
                          Remember me
                        </Label>
                      </FormItem>
                    )}
                  />

                  <div>
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot-password")}
                      className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={() => setAuthMode("register")}
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                >
                  Register now
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Register Form */}
      {authMode === "register" && (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create account</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Sign up to get started</p>
            </div>

            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                <FormField
                  control={registerForm.control}
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
                  control={registerForm.control}
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
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-14 border-b-2 border-t-0 border-x-0 rounded-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-0 shadow-none bg-transparent pt-4"
                          placeholder="Choose a username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="h-14 border-b-2 border-t-0 border-x-0 rounded-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-0 shadow-none bg-transparent pt-4 pr-10"
                            placeholder="Create a password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
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
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="absolute left-0 -top-3.5 text-gray-600 dark:text-gray-400 text-sm">
                        Confirm password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            className="h-14 border-b-2 border-t-0 border-x-0 rounded-none border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-0 shadow-none bg-transparent pt-4 pr-10"
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
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

                <Button
                  type="submit"
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Registering..." : "Register"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => setAuthMode("login")}
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forgot Password Form */}
      {authMode === "forgot-password" && (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset password</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                We'll send you a link to reset your password
              </p>
            </div>

            {forgotPasswordSent ? (
              <div className="text-center p-4">
                <div className="flex justify-center text-green-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Reset link sent!</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Check your email for instructions.</p>
                <Button
                  className="mt-6 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                  onClick={() => setAuthMode("login")}
                >
                  Back to login
                </Button>
              </div>
            ) : (
              <Form {...forgotPasswordForm}>
                <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={forgotPasswordForm.control}
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

                  <Button
                    type="submit"
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                  >
                    Send reset link
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <button
                  onClick={() => setAuthMode("login")}
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                >
                  Back to login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
