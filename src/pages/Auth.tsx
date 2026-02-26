import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Phone, Mail, ArrowLeft, Loader2, Lock, Eye, EyeOff,
  ShieldCheck, Sparkles, Star, Leaf, Heart
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, googleLogin, signup, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user && !isLoading) navigate("/profile");
  }, [user, isLoading, navigate]);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const validatePhone = (phone: string): boolean => /^[6-9]\d{9}$/.test(phone);
  const validateEmail = (email: string): boolean => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password strength
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
    if (score <= 3) return { score, label: "Fair", color: "bg-amber-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };
  const pwStrength = getPasswordStrength(signupPassword);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(loginPhone)) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return;
    }
    if (!loginPassword) {
      toast.error("Please enter your password");
      return;
    }
    setSubmitting(true);
    const success = await login(loginPhone, loginPassword);
    setSubmitting(false);
    if (success) navigate("/profile");
  };

  const handleGoogleSignIn = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google Sign-In is not configured');
      return;
    }
    if (!window.google) {
      toast.error('Google Sign-In is still loading, please try again');
      return;
    }

    setGoogleLoading(true);

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        try {
          const success = await googleLogin(response.credential);
          if (success) navigate('/profile');
        } catch {
          toast.error('Google sign-in failed');
        } finally {
          setGoogleLoading(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleLoading(false);
      }
    });
  }, [googleLogin, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || signupName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (!validatePhone(signupPhone)) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return;
    }
    if (signupEmail && !validateEmail(signupEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    const success = await signup(signupName.trim(), signupPhone, signupPassword, signupEmail || undefined);
    setSubmitting(false);
    if (success) navigate("/profile");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Decorative Panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent flex-col items-center justify-center p-12 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 80 + 20}px`,
                height: `${Math.random() * 80 + 20}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30">
            <span className="text-5xl">🍯</span>
          </div>

          <h1 className="font-serif text-3xl font-bold mb-2">Maghizam</h1>
          <p className="text-lg font-medium text-white/90 mb-1">Homemade Delights</p>
          <p className="text-sm text-white/70 tamil-text mb-8">மகிழம் இல்லத்தில் செய்த உணவுகள்</p>

          <div className="space-y-4 text-left">
            {[
              { icon: <Leaf className="h-4 w-4" />, text: "100% Natural Ingredients", sub: "இயற்கை பொருட்கள்" },
              { icon: <Heart className="h-4 w-4" />, text: "Made with Love & Care", sub: "அன்புடன் தயாரிக்கப்பட்டது" },
              { icon: <Star className="h-4 w-4" />, text: "Authentic Tamil Recipes", sub: "தமிழ் பாரம்பரிய சமையல்" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.text}</p>
                  <p className="text-xs text-white/60 tamil-text">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Button>
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-xl">🍯</span>
            <span className="font-serif text-sm font-bold text-foreground">Maghizam</span>
          </div>
          <div className="w-20" />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {activeTab === "login" ? "Welcome Back!" : "Create Account"}
              </h2>
              <p className="text-sm text-muted-foreground tamil-text mt-1">
                {activeTab === "login" ? "மீண்டும் வருக!" : "புதிய கணக்கு உருவாக்கவும்"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {activeTab === "login"
                  ? "Sign in to continue shopping authentic homemade delights"
                  : "Join us to start ordering authentic homemade delights"}
              </p>
            </div>

            {/* Card */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-accent" />
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-11 rounded-xl bg-secondary/50">
                    <TabsTrigger value="login" className="text-sm font-medium rounded-xl data-[state=active]:shadow-md">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm font-medium rounded-xl data-[state=active]:shadow-md">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* LOGIN TAB */}
                  <TabsContent value="login" className="animate-fade-in">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-phone" className="text-xs font-medium flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">+91</span>
                          <Input
                            id="login-phone"
                            type="tel"
                            placeholder="Enter 10-digit number"
                            value={loginPhone}
                            onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            maxLength={10}
                            required
                            className="rounded-xl pl-11 h-11 input-glow"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-xs font-medium flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-primary" /> Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            className="rounded-xl h-11 input-glow pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full rounded-xl btn-lift h-11 text-sm font-semibold" disabled={submitting}>
                        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : "Login"}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground pt-1">
                        Don't have an account?{" "}
                        <button type="button" onClick={() => setActiveTab("signup")} className="text-primary hover:underline font-semibold">
                          Create one now
                        </button>
                      </p>
                    </form>

                    {/* Google Divider + Button */}
                    {GOOGLE_CLIENT_ID && (
                      <div className="mt-4">
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-card px-3 text-muted-foreground">or</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={googleLoading}
                          className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-border bg-background hover:bg-secondary/50 transition-all duration-200 text-sm font-medium text-foreground shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {googleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                          )}
                          Continue with Google
                        </button>
                      </div>
                    )}
                  </TabsContent>

                  {/* SIGNUP TAB */}
                  <TabsContent value="signup" className="animate-fade-in">
                    <form onSubmit={handleSignup} className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-xs font-medium flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-primary" /> Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          maxLength={100}
                          required
                          className="rounded-xl h-11 input-glow"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-xs font-medium flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">+91</span>
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="Enter 10-digit number"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            maxLength={10}
                            required
                            className="rounded-xl pl-11 h-11 input-glow"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-xs font-medium flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-primary" /> Email <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          maxLength={200}
                          className="rounded-xl h-11 input-glow"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-xs font-medium flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-primary" /> Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="Create a password (min 4 chars)"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            minLength={4}
                            required
                            className="rounded-xl h-11 input-glow pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {/* Password strength bar */}
                        {signupPassword && (
                          <div className="space-y-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <div
                                  key={s}
                                  className={cn(
                                    "h-1 flex-1 rounded-full transition-all duration-300",
                                    s <= pwStrength.score ? pwStrength.color : "bg-secondary"
                                  )}
                                />
                              ))}
                            </div>
                            <p className={cn("text-[10px] font-medium",
                              pwStrength.score <= 1 ? "text-destructive" :
                                pwStrength.score <= 3 ? "text-amber-500" : "text-emerald-500"
                            )}>{pwStrength.label}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm" className="text-xs font-medium flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Confirm Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="signup-confirm"
                          type="password"
                          placeholder="Re-enter your password"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          required
                          className={cn(
                            "rounded-xl h-11 input-glow",
                            signupConfirmPassword && signupPassword !== signupConfirmPassword && "border-destructive"
                          )}
                        />
                      </div>

                      <Button type="submit" className="w-full rounded-xl btn-lift h-11 text-sm font-semibold mt-1" disabled={submitting}>
                        {submitting ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                        ) : (
                          <><Sparkles className="mr-1.5 h-4 w-4" /> Create Account</>
                        )}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground pt-1">
                        Already have an account?{" "}
                        <button type="button" onClick={() => setActiveTab("login")} className="text-primary hover:underline font-semibold">
                          Login here
                        </button>
                      </p>
                    </form>

                    {/* Google Divider + Button */}
                    {GOOGLE_CLIENT_ID && (
                      <div className="mt-4">
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-card px-3 text-muted-foreground">or</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={googleLoading}
                          className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-border bg-background hover:bg-secondary/50 transition-all duration-200 text-sm font-medium text-foreground shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {googleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                          )}
                          Continue with Google
                        </button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Secure Login</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>Data Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default Auth;
