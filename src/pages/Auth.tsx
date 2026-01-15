import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, signup, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Login form state
  const [loginPhone, setLoginPhone] = useState("");
  
  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/profile");
    }
  }, [user, isLoading, navigate]);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(loginPhone)) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return;
    }
    
    setSubmitting(true);
    const success = await login(loginPhone);
    setSubmitting(false);
    
    if (success) {
      navigate("/profile");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (signupName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    
    if (!validatePhone(signupPhone)) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return;
    }
    
    setSubmitting(true);
    const success = await signup(signupName.trim(), signupPhone);
    setSubmitting(false);
    
    if (success) {
      navigate("/profile");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8 md:py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home / முகப்புக்கு திரும்பு
        </Button>

        <div className="max-w-md mx-auto">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">
                Welcome
                <span className="block text-lg font-normal text-muted-foreground tamil-text mt-1">
                  வரவேற்கிறோம்
                </span>
              </CardTitle>
              <CardDescription>
                Login or create an account to save your details
                <span className="block tamil-text text-xs mt-1">
                  உங்கள் விவரங்களை சேமிக்க உள்நுழையவும்
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">
                    Login / உள்நுழைக
                  </TabsTrigger>
                  <TabsTrigger value="signup">
                    Sign Up / பதிவு
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number / தொலைபேசி எண்
                      </Label>
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="Enter your 10-digit phone number"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: 9876543210
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          Login / உள்நுழைக
                        </>
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("signup")}
                        className="text-primary hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name / முழு பெயர் *
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        maxLength={100}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number / தொலைபேசி எண் *
                      </Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter your 10-digit phone number"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: 9876543210
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account / கணக்கை உருவாக்கு
                        </>
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-primary hover:underline"
                      >
                        Login
                      </button>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
