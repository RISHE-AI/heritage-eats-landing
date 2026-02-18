import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Settings, LogOut, ArrowLeft, Loader2, MapPin,
  Phone as PhoneIcon, Edit2, Check, X, ShoppingBag, Mail, Calendar, Star
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useThemeColor, type ThemeColor } from "@/components/ThemeProvider";

const THEME_COLORS: { value: ThemeColor; label: string; colorClass: string }[] = [
  { value: "warm-red", label: "Warm Red", colorClass: "bg-red-700" },
  { value: "royal-purple", label: "Royal Purple", colorClass: "bg-purple-700" },
  { value: "forest-green", label: "Forest Green", colorClass: "bg-emerald-700" },
  { value: "saffron-orange", label: "Saffron Orange", colorClass: "bg-orange-500" },
  { value: "deep-blue", label: "Deep Blue", colorClass: "bg-blue-700" },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading, updateProfile } = useAuth();
  const { themeColor, setThemeColor } = useThemeColor();
  const [activeTab, setActiveTab] = useState("profile");

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate("/auth");
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditAddress(user.address || "");
      setEditEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!editName.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({ name: editName.trim(), address: editAddress.trim(), email: editEmail.trim() });
      }
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen bg-background page-enter pb-safe-bottom">
      <Header />
      <div className="container px-4 py-6 md:py-10 max-w-2xl mx-auto">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 gap-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Button>

        {/* ── Gradient Banner Header ── */}
        <div className="relative rounded-2xl overflow-hidden mb-6 animate-fade-in">
          {/* Banner background */}
          <div className="h-28 bg-gradient-to-br from-primary via-primary/80 to-accent" />

          {/* Avatar + info overlay */}
          <div className="px-5 pb-4 bg-card border border-border rounded-b-2xl">
            <div className="flex items-end gap-4 -mt-10">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-2xl font-bold shadow-lg border-4 border-card shrink-0">
                {initials}
              </div>
              {/* Name + phone */}
              <div className="pb-2 flex-1 min-w-0">
                <h1 className="font-serif text-lg font-bold text-foreground truncate">{user.name || "User"}</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <PhoneIcon className="h-3 w-3" /> {user.phone}
                </p>
                {user.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" /> {user.email}
                  </p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
              <div className="text-center">
                <p className="text-base font-bold text-foreground">{user.totalOrders ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Orders</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-base font-bold text-foreground">₹{user.totalSpent ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Spent</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-foreground">{memberSince}</p>
                <p className="text-[10px] text-muted-foreground">Member Since</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-10 rounded-xl mb-4">
            <TabsTrigger value="profile" className="text-xs rounded-xl gap-1">
              <User className="h-3.5 w-3.5" /> Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs rounded-xl gap-1">
              <ShoppingBag className="h-3.5 w-3.5" /> Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs rounded-xl gap-1">
              <Settings className="h-3.5 w-3.5" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="animate-fade-in">
            <Card className="rounded-2xl shadow-card border border-border">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Personal Information</h3>
                  {!editing ? (
                    <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1 text-xs">
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1 text-xs h-8 rounded-lg">
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditing(false);
                        setEditName(user.name || "");
                        setEditAddress(user.address || "");
                        setEditEmail(user.email || "");
                      }} className="text-xs h-8">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" /> Name
                    </Label>
                    {editing ? (
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl input-glow" />
                    ) : (
                      <p className="text-sm font-medium">{user.name || "Not set"}</p>
                    )}
                  </div>

                  {/* Phone (read-only) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <PhoneIcon className="h-3 w-3" /> Phone
                    </Label>
                    <p className="text-sm font-medium">{user.phone}</p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </Label>
                    {editing ? (
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="rounded-xl input-glow"
                      />
                    ) : (
                      <p className="text-sm font-medium">{user.email || <span className="text-muted-foreground italic">Not set</span>}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </Label>
                    {editing ? (
                      <Input
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        className="rounded-xl input-glow"
                      />
                    ) : (
                      <p className="text-sm">{user.address || <span className="text-muted-foreground italic">Not set</span>}</p>
                    )}
                  </div>

                  {/* Member since */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Member Since
                    </Label>
                    <p className="text-sm font-medium">{memberSince}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="animate-fade-in">
            <Card className="rounded-2xl shadow-card border border-border">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-3">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">Order history will appear here after your first purchase.</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/")} className="rounded-xl gap-1.5 text-xs">
                  <ShoppingBag className="h-3.5 w-3.5" /> Browse Products
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="animate-fade-in space-y-4">
            <Card className="rounded-2xl shadow-card border border-border">
              <CardContent className="p-4 md:p-5">
                <h3 className="font-semibold text-sm mb-3">Theme Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dark / Light Mode</span>
                    <ThemeToggle />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Accent Color</span>
                    <div className="flex items-center gap-2">
                      {THEME_COLORS.map((tc) => (
                        <button
                          key={tc.value}
                          onClick={() => setThemeColor(tc.value)}
                          className={`h-8 w-8 rounded-full transition-all duration-200 hover:scale-110 ${tc.colorClass} ${themeColor === tc.value
                            ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                            : "opacity-60 hover:opacity-100"
                            }`}
                          title={tc.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </TabsContent>
        </Tabs>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Profile;
