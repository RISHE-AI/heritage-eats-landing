import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, Mail, ArrowLeft, Loader2, Lock, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, signup, isLoading } = useAuth();
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

  useEffect(() => {
    if (user && !isLoading) navigate("/profile");
  }, [user, isLoading, navigate]);

  const validatePhone = (phone: string): boolean => /^[6-9]\d{9}$/.test(phone);
  const validateEmail = (email: string): boolean => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
    <div className="min-h-screen bg-background page-enter pb-safe-bottom">
      <Header />
      <div className="container px-4 py-8 md:py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 gap-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Button>

        <div className="max-w-md mx-auto">
          {/* Brand Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🍯</span>
            </div>
            <h1 className="font-serif text-2xl font-bold">
              {activeTab === "login" ? "Welcome Back!" : "Join Heritage Eats"}
            </h1>
            <p className="text-sm text-muted-foreground tamil-text mt-1">
              {activeTab === "login" ? "மீண்டும் வருக!" : "எங்களுடன் சேருங்கள்!"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {activeTab === "login"
                ? "Sign in to your account to continue shopping"
                : "Create an account to start ordering authentic homemade delights"}
            </p>
          </div>

          <Card className="rounded-2xl shadow-card border-0 bg-card overflow-hidden">
            {/* Gradient strip at top */}
            <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
            <CardContent className="p-5 md:p-6">
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
                      {submitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</>
                      ) : (
                        "Login"
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground pt-2">
                      Don't have an account?{" "}
                      <button type="button" onClick={() => setActiveTab("signup")} className="text-primary hover:underline font-semibold">
                        Create one now
                      </button>
                    </p>
                  </form>
                </TabsContent>

                {/* SIGNUP TAB */}
                <TabsContent value="signup" className="animate-fade-in">
                  <form onSubmit={handleSignup} className="space-y-4">
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
                        <Mail className="h-3.5 w-3.5 text-primary" /> Email Address <span className="text-muted-foreground">(optional)</span>
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
                        className="rounded-xl h-11 input-glow"
                      />
                    </div>

                    <Button type="submit" className="w-full rounded-xl btn-lift h-11 text-sm font-semibold" disabled={submitting}>
                      {submitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                      ) : (
                        <>
                          <Sparkles className="mr-1.5 h-4 w-4" /> Create Account
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground pt-2">
                      Already have an account?{" "}
                      <button type="button" onClick={() => setActiveTab("login")} className="text-primary hover:underline font-semibold">
                        Login here
                      </button>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6 text-[11px] text-muted-foreground">
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
      <MobileBottomNav />
    </div>
  );
};

export default Auth;
