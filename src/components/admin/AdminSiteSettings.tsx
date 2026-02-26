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
    Eye, EyeOff, BarChart3, Image, Megaphone, RefreshCw, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { fetchSiteSettings, updateSiteSettings, fetchComputedStats } from "@/services/api";

interface Offer {
    emoji: string;
    title: string;
    titleTa: string;
    description: string;
    discount: string;
    color: string;
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
            }
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
            offers: [...s.offers, { emoji: "🎁", title: "", titleTa: "", description: "", discount: "", color: COLOR_OPTIONS[0].value, active: true }],
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
        </div>
    );
};

export default AdminSiteSettings;
