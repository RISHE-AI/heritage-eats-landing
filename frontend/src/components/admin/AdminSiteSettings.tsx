import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    ChevronDown, ChevronUp, Plus, Trash2, Save, Loader2,
    Eye, EyeOff, BarChart3, Image, Megaphone, RefreshCw, Sparkles,
    Palette, Timer, Check, X, RotateCcw, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { fetchSiteSettings, updateSiteSettings, fetchComputedStats, fetchCountdown, setCountdown, disableCountdown, uploadOfferImage, BACKEND_URL } from "@/services/api";
import { getAllThemes } from "@/config/themes";

interface Offer {
    emoji: string;
    title: string;
    titleTa: string;
    description: string;
    discount: string;
    color: string;
    image: string;
    active: boolean;
}

interface StatItem {
    icon: string;
    value: number;
    suffix: string;
    labelEn: string;
    labelTa: string;
}

interface GalleryImage {
    src: string;
    alt: string;
    caption: string;
    captionTa: string;
    span: string;
}

interface SiteSettingsData {
    offersVisible: boolean;
    offers: Offer[];
    statsVisible: boolean;
    statsAutoCompute: boolean;
    stats: StatItem[];
    galleryVisible: boolean;
    gallery: GalleryImage[];
}

const COLOR_OPTIONS = [
    { value: "from-amber-500/20 to-orange-500/20", label: "🟠 Amber → Orange" },
    { value: "from-red-500/20 to-rose-500/20", label: "🔴 Red → Rose" },
    { value: "from-emerald-500/20 to-teal-500/20", label: "🟢 Emerald → Teal" },
    { value: "from-blue-500/20 to-indigo-500/20", label: "🔵 Blue → Indigo" },
    { value: "from-purple-500/20 to-violet-500/20", label: "🟣 Purple → Violet" },
    { value: "from-pink-500/20 to-rose-500/20", label: "🩷 Pink → Rose" },
];

const SPAN_OPTIONS = [
    { value: "", label: "Normal" },
    { value: "md:row-span-2", label: "Tall (2 rows)" },
    { value: "md:col-span-2", label: "Wide (2 cols)" },
];

interface AdminSiteSettingsProps {
    password: string;
    onLogout: () => void;
}

const AdminSiteSettings: React.FC<AdminSiteSettingsProps> = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetchingStats, setFetchingStats] = useState(false);
    const [settings, setSettings] = useState<SiteSettingsData>({
        offersVisible: true,
        offers: [],
        statsVisible: true,
        statsAutoCompute: false,
        stats: [],
        galleryVisible: true,
        gallery: [],
    });

    const [offersOpen, setOffersOpen] = useState(true);
    const [statsOpen, setStatsOpen] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const [countdownOpen, setCountdownOpen] = useState(false);

    // Theme admin state
    const [defaultTheme, setDefaultTheme] = useState("classic-red");
    const [enabledThemes, setEnabledThemes] = useState<string[]>([]);
    const [themeSaving, setThemeSaving] = useState(false);

    // Countdown admin state
    const [countdownDays, setCountdownDays] = useState(7);
    const [countdownTitle, setCountdownTitle] = useState("");
    const [countdownTitleTa, setCountdownTitleTa] = useState("");
    const [countdownDesc, setCountdownDesc] = useState("");
    const [countdownActive, setCountdownActive] = useState(false);
    const [countdownEndDate, setCountdownEndDate] = useState<string | null>(null);
    const [countdownSaving, setCountdownSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const res = await fetchSiteSettings();
            if (res.success && res.data) {
                setSettings({
                    offersVisible: res.data.offersVisible ?? true,
                    offers: res.data.offers || [],
                    statsVisible: res.data.statsVisible ?? true,
                    statsAutoCompute: res.data.statsAutoCompute ?? false,
                    stats: res.data.stats || [],
                    galleryVisible: res.data.galleryVisible ?? true,
                    gallery: res.data.gallery || [],
                });
                // Load theme settings
                setDefaultTheme(res.data.defaultTheme || "classic-red");
                setEnabledThemes(res.data.enabledThemes || getAllThemes().map(t => t.id));
            }
            // Load countdown state
            try {
                const cRes = await fetchCountdown();
                if (cRes.success && cRes.data) {
                    setCountdownActive(cRes.data.enabled && !cRes.data.isExpired);
                    setCountdownEndDate(cRes.data.offerEndDate || null);
                    setCountdownTitle(cRes.data.title || "");
                    setCountdownTitleTa(cRes.data.titleTa || "");
                    setCountdownDesc(cRes.data.description || "");
                }
            } catch { /* no countdown */ }
        } catch (err) {
            toast.error("Failed to load site settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await updateSiteSettings(settings);
            if (res.success) {
                toast.success("Site settings saved successfully!");
            } else {
                toast.error(res.message || "Failed to save");
            }
        } catch (err) {
            toast.error("Failed to save site settings");
        } finally {
            setSaving(false);
        }
    };

    const handleFetchRealStats = async () => {
        try {
            setFetchingStats(true);
            const res = await fetchComputedStats();
            if (res.success && res.data) {
                const d = res.data;
                setSettings((prev) => ({
                    ...prev,
                    stats: [
                        { icon: "😊", value: d.customers || 0, suffix: "+", labelEn: "Happy Customers", labelTa: "மகிழ்ச்சியான வாடிக்கையாளர்கள்" },
                        { icon: "🍬", value: d.products || 0, suffix: "+", labelEn: "Products", labelTa: "தயாரிப்புகள்" },
                        { icon: "📦", value: d.orders || 0, suffix: "+", labelEn: "Orders Delivered", labelTa: "ஆர்டர்கள் வழங்கப்பட்டன" },
                        { icon: "🛒", value: d.totalSold || 0, suffix: "+", labelEn: "Items Sold", labelTa: "விற்கப்பட்ட பொருட்கள்" },
                    ],
                }));
                toast.success("Real stats fetched from database!");
            }
        } catch (err) {
            toast.error("Failed to fetch computed stats");
        } finally {
            setFetchingStats(false);
        }
    };

    // ─── Offer helpers ───
    const addOffer = () => {
        setSettings((s) => ({
            ...s,
            offers: [...s.offers, { emoji: "🎁", title: "", titleTa: "", description: "", discount: "", color: COLOR_OPTIONS[0].value, image: "", active: true }],
        }));
    };
    const removeOffer = (idx: number) => {
        setSettings((s) => ({ ...s, offers: s.offers.filter((_, i) => i !== idx) }));
    };
    const updateOffer = (idx: number, field: keyof Offer, value: any) => {
        setSettings((s) => ({
            ...s,
            offers: s.offers.map((o, i) => (i === idx ? { ...o, [field]: value } : o)),
        }));
    };

    // ─── Stat helpers ───
    const addStat = () => {
        setSettings((s) => ({
            ...s,
            stats: [...s.stats, { icon: "📊", value: 0, suffix: "+", labelEn: "", labelTa: "" }],
        }));
    };
    const removeStat = (idx: number) => {
        setSettings((s) => ({ ...s, stats: s.stats.filter((_, i) => i !== idx) }));
    };
    const updateStat = (idx: number, field: keyof StatItem, value: any) => {
        setSettings((s) => ({
            ...s,
            stats: s.stats.map((st, i) => (i === idx ? { ...st, [field]: field === "value" ? Number(value) : value } : st)),
        }));
    };

    // ─── Gallery helpers ───
    const addGalleryImage = () => {
        setSettings((s) => ({
            ...s,
            gallery: [...s.gallery, { src: "", alt: "", caption: "", captionTa: "", span: "" }],
        }));
    };
    const removeGalleryImage = (idx: number) => {
        setSettings((s) => ({ ...s, gallery: s.gallery.filter((_, i) => i !== idx) }));
    };
    const updateGalleryImage = (idx: number, field: keyof GalleryImage, value: string) => {
        setSettings((s) => ({
            ...s,
            gallery: s.gallery.map((g, i) => (i === idx ? { ...g, [field]: value } : g)),
        }));
    };

    // ─── Theme helpers ───
    const handleThemeSave = async () => {
        try {
            setThemeSaving(true);
            const res = await updateSiteSettings({ defaultTheme, enabledThemes });
            if (res.success) {
                toast.success("Theme settings saved!");
            } else {
                toast.error(res.message || "Failed to save theme settings");
            }
        } catch {
            toast.error("Failed to save theme settings");
        } finally {
            setThemeSaving(false);
        }
    };

    const toggleThemeEnabled = (themeId: string) => {
        setEnabledThemes((prev) => {
            if (prev.includes(themeId)) {
                // Don't allow disabling the default theme
                if (themeId === defaultTheme) {
                    toast.error("Cannot disable the default theme");
                    return prev;
                }
                // Must keep at least 1 enabled
                if (prev.length <= 1) {
                    toast.error("At least one theme must be enabled");
                    return prev;
                }
                return prev.filter((id) => id !== themeId);
            }
            return [...prev, themeId];
        });
    };

    const handleThemeReset = () => {
        const allIds = getAllThemes().map(t => t.id);
        setDefaultTheme("classic-red");
        setEnabledThemes(allIds);
        toast.info("Theme settings reset to defaults (save to apply)");
    };

    // ─── Countdown helpers ───
    const handleCountdownSave = async () => {
        if (countdownDays < 1 || countdownDays > 365) {
            toast.error("Days must be between 1 and 365");
            return;
        }
        try {
            setCountdownSaving(true);
            const res = await setCountdown({
                days: countdownDays,
                title: countdownTitle || undefined,
                titleTa: countdownTitleTa || undefined,
                description: countdownDesc || undefined,
            });
            if (res.success) {
                toast.success("Countdown activated!");
                setCountdownActive(true);
                setCountdownEndDate(res.data?.offerEndDate || null);
            } else {
                toast.error(res.message || "Failed to set countdown");
            }
        } catch {
            toast.error("Failed to set countdown");
        } finally {
            setCountdownSaving(false);
        }
    };

    const handleCountdownDisable = async () => {
        try {
            setCountdownSaving(true);
            const res = await disableCountdown();
            if (res.success) {
                toast.success("Countdown disabled");
                setCountdownActive(false);
                setCountdownEndDate(null);
            } else {
                toast.error(res.message || "Failed to disable countdown");
            }
        } catch {
            toast.error("Failed to disable countdown");
        } finally {
            setCountdownSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Loading site settings...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Homepage Settings
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Control what's displayed on your homepage
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save All Changes
                </Button>
            </div>

            {/* ─────── SPECIAL OFFERS ─────── */}
            <Collapsible open={offersOpen} onOpenChange={setOffersOpen}>
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                        <Megaphone className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Special Offers</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">{settings.offers.length} offers</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        {settings.offersVisible ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                        <Switch
                                            checked={settings.offersVisible}
                                            onCheckedChange={(v) => setSettings((s) => ({ ...s, offersVisible: v }))}
                                        />
                                    </div>
                                    {offersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                            {settings.offers.map((offer, idx) => (
                                <div key={idx} className="border rounded-xl p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <Badge variant={offer.active ? "default" : "secondary"} className="text-xs">
                                            Offer #{idx + 1} — {offer.active ? "Active" : "Inactive"}
                                        </Badge>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={offer.active} onCheckedChange={(v) => updateOffer(idx, "active", v)} />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeOffer(idx)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Offer Image Upload */}
                                    <div className="flex items-start gap-4 p-3 rounded-lg bg-background/50 border border-border/30">
                                        {offer.image ? (
                                            <div className="relative group">
                                                <img
                                                    src={offer.image.startsWith('http') ? offer.image : `${BACKEND_URL}/${offer.image}`}
                                                    alt={offer.title}
                                                    className="w-20 h-20 rounded-lg object-cover border shadow-sm"
                                                />
                                                <button
                                                    onClick={() => updateOffer(idx, "image", "")}
                                                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground">
                                                <Image className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs font-medium">Offer Image</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                    className="h-9 text-xs"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        try {
                                                            const result = await uploadOfferImage(file);
                                                            updateOffer(idx, "image", result.path);
                                                            toast.success("Image uploaded!");
                                                        } catch {
                                                            toast.error("Failed to upload image");
                                                        }
                                                        e.target.value = "";
                                                    }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">Or paste a URL:</p>
                                            <Input
                                                value={offer.image}
                                                onChange={(e) => updateOffer(idx, "image", e.target.value)}
                                                className="h-8 text-xs"
                                                placeholder="https://... or upload above"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                            <Label className="text-xs">Emoji</Label>
                                            <Input value={offer.emoji} onChange={(e) => updateOffer(idx, "emoji", e.target.value)} className="h-9" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Title (English)</Label>
                                            <Input value={offer.title} onChange={(e) => updateOffer(idx, "title", e.target.value)} className="h-9" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Title (Tamil)</Label>
                                            <Input value={offer.titleTa} onChange={(e) => updateOffer(idx, "titleTa", e.target.value)} className="h-9" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Discount Text</Label>
                                            <Input value={offer.discount} onChange={(e) => updateOffer(idx, "discount", e.target.value)} className="h-9" placeholder="e.g. 20% OFF" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Description</Label>
                                            <Input value={offer.description} onChange={(e) => updateOffer(idx, "description", e.target.value)} className="h-9" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Color Gradient</Label>
                                            <Select value={offer.color} onValueChange={(v) => updateOffer(idx, "color", v)}>
                                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {COLOR_OPTIONS.map((c) => (
                                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addOffer} className="w-full gap-2">
                                <Plus className="h-4 w-4" /> Add Offer
                            </Button>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* ─────── STATS COUNTER ─────── */}
            <Collapsible open={statsOpen} onOpenChange={setStatsOpen}>
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <BarChart3 className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Stats Counter</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">{settings.stats.length} stats</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        {settings.statsVisible ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                        <Switch
                                            checked={settings.statsVisible}
                                            onCheckedChange={(v) => setSettings((s) => ({ ...s, statsVisible: v }))}
                                        />
                                    </div>
                                    {statsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                            {/* Auto-compute toggle + fetch button */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={settings.statsAutoCompute}
                                        onCheckedChange={(v) => setSettings((s) => ({ ...s, statsAutoCompute: v }))}
                                    />
                                    <Label className="text-sm font-medium">Auto-compute from database</Label>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleFetchRealStats} disabled={fetchingStats} className="gap-2">
                                    {fetchingStats ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                    Fetch Real Stats
                                </Button>
                            </div>

                            {settings.stats.map((stat, idx) => (
                                <div key={idx} className="border rounded-xl p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs">Stat #{idx + 1}</Badge>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeStat(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <div>
                                            <Label className="text-xs">Icon</Label>
                                            <Input value={stat.icon} onChange={(e) => updateStat(idx, "icon", e.target.value)} className="h-9" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value</Label>
                                            <Input type="number" value={stat.value} onChange={(e) => updateStat(idx, "value", e.target.value)} className="h-9" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Suffix</Label>
                                            <Input value={stat.suffix} onChange={(e) => updateStat(idx, "suffix", e.target.value)} className="h-9" placeholder="e.g. +" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Label (English)</Label>
                                            <Input value={stat.labelEn} onChange={(e) => updateStat(idx, "labelEn", e.target.value)} className="h-9" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Label (Tamil)</Label>
                                            <Input value={stat.labelTa} onChange={(e) => updateStat(idx, "labelTa", e.target.value)} className="h-9" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addStat} className="w-full gap-2">
                                <Plus className="h-4 w-4" /> Add Stat
                            </Button>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* ─────── GALLERY ─────── */}
            <Collapsible open={galleryOpen} onOpenChange={setGalleryOpen}>
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <Image className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Gallery</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">{settings.gallery.length} images</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        {settings.galleryVisible ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                        <Switch
                                            checked={settings.galleryVisible}
                                            onCheckedChange={(v) => setSettings((s) => ({ ...s, galleryVisible: v }))}
                                        />
                                    </div>
                                    {galleryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                            {settings.gallery.map((img, idx) => (
                                <div key={idx} className="border rounded-xl p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">Image #{idx + 1}</Badge>
                                            {img.src && (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border">
                                                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeGalleryImage(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">Image URL</Label>
                                            <Input value={img.src} onChange={(e) => updateGalleryImage(idx, "src", e.target.value)} className="h-9" placeholder="https://..." />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Alt Text</Label>
                                            <Input value={img.alt} onChange={(e) => updateGalleryImage(idx, "alt", e.target.value)} className="h-9" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-xs">Caption (English)</Label>
                                            <Input value={img.caption} onChange={(e) => updateGalleryImage(idx, "caption", e.target.value)} className="h-9" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Caption (Tamil)</Label>
                                            <Input value={img.captionTa} onChange={(e) => updateGalleryImage(idx, "captionTa", e.target.value)} className="h-9" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Grid Span</Label>
                                            <Select value={img.span || "normal"} onValueChange={(v) => updateGalleryImage(idx, "span", v === "normal" ? "" : v)}>
                                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {SPAN_OPTIONS.map((s) => (
                                                        <SelectItem key={s.value || "normal"} value={s.value || "normal"}>{s.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addGalleryImage} className="w-full gap-2">
                                <Plus className="h-4 w-4" /> Add Image
                            </Button>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* ─────── THEME MANAGEMENT ─────── */}
            <Collapsible open={themeOpen} onOpenChange={setThemeOpen}>
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <Palette className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Theme Management</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">{enabledThemes.length} of {getAllThemes().length} themes enabled</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {themeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                            {/* Default theme selector */}
                            <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                                <Label className="text-sm font-semibold">Default Theme</Label>
                                <Select value={defaultTheme} onValueChange={setDefaultTheme}>
                                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {getAllThemes().filter(t => enabledThemes.includes(t.id)).map((t) => (
                                            <SelectItem key={t.id} value={t.id}> {t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">New visitors will see this theme. Only enabled themes can be default.</p>
                            </div>

                            {/* Theme toggles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {getAllThemes().map((theme) => {
                                    const isEnabled = enabledThemes.includes(theme.id);
                                    const isDefault = defaultTheme === theme.id;
                                    return (
                                        <div
                                            key={theme.id}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isEnabled ? "bg-card border-border" : "bg-muted/30 border-border/30 opacity-60"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg border shadow-sm flex items-center justify-center text-sm"
                                                    style={{ background: theme.preview || '#666' }}
                                                >

                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{theme.name}</p>
                                                    {isDefault && (
                                                        <Badge variant="default" className="text-[10px] h-4 px-1.5">Default</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isEnabled ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
                                                <Switch
                                                    checked={isEnabled}
                                                    onCheckedChange={() => toggleThemeEnabled(theme.id)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button onClick={handleThemeSave} disabled={themeSaving} className="gap-2 flex-1">
                                    {themeSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Theme Settings
                                </Button>
                                <Button variant="outline" onClick={handleThemeReset} className="gap-2">
                                    <RotateCcw className="h-4 w-4" /> Reset
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* ─────── COUNTDOWN MANAGEMENT ─────── */}
            <Collapsible open={countdownOpen} onOpenChange={setCountdownOpen}>
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                        <Timer className="h-5 w-5 text-rose-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Countdown Timer</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {countdownActive ? (
                                                <span className="text-emerald-500 font-medium">Active — expires {countdownEndDate ? new Date(countdownEndDate).toLocaleDateString() : "N/A"}</span>
                                            ) : (
                                                "No active countdown"
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {countdownActive && (
                                        <Badge variant="default" className="bg-emerald-500 text-xs">Live</Badge>
                                    )}
                                    {countdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                            {/* Current status */}
                            {countdownActive && countdownEndDate && (
                                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-emerald-500" />
                                        <div>
                                            <p className="text-sm font-medium">Countdown Active</p>
                                            <p className="text-xs text-muted-foreground">
                                                Ends: {new Date(countdownEndDate).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={handleCountdownDisable} disabled={countdownSaving} className="gap-1">
                                        {countdownSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                                        Disable
                                    </Button>
                                </div>
                            )}

                            {/* Set new countdown */}
                            <div className="space-y-3 p-4 rounded-xl border bg-muted/20">
                                <p className="text-sm font-semibold">{countdownActive ? "Replace" : "Create"} Countdown</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs">Duration (Days)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={365}
                                            value={countdownDays}
                                            onChange={(e) => setCountdownDays(Number(e.target.value))}
                                            className="h-9"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-0.5">1–365 days from now</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Offer Title (English)</Label>
                                        <Input
                                            value={countdownTitle}
                                            onChange={(e) => setCountdownTitle(e.target.value)}
                                            className="h-9"
                                            placeholder="e.g. Weekend Special Sale"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Offer Title (Tamil)</Label>
                                        <Input
                                            value={countdownTitleTa}
                                            onChange={(e) => setCountdownTitleTa(e.target.value)}
                                            className="h-9"
                                            placeholder="e.g. வார இறுதி சிறப்பு விற்பனை"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                            value={countdownDesc}
                                            onChange={(e) => setCountdownDesc(e.target.value)}
                                            className="h-9"
                                            placeholder="e.g. Up to 30% off on sweets!"
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleCountdownSave} disabled={countdownSaving} className="gap-2 w-full">
                                    {countdownSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Timer className="h-4 w-4" />}
                                    {countdownActive ? "Replace & Restart Countdown" : "Start Countdown"}
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        </div>
    );
};

export default AdminSiteSettings;
