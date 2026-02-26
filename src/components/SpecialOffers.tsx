import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Flame, Clock, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { fetchSiteSettings, fetchCountdown } from "@/services/api";

interface Offer {
    emoji: string;
    title: string;
    titleTa: string;
    description: string;
    discount: string;
    color: string;
    active?: boolean;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
}

const FALLBACK_OFFERS: Offer[] = [
    { emoji: "🍬", title: "Festive Sweet Box", titleTa: "பண்டிகை இனிப்பு பெட்டி", description: "Assorted premium sweets combo pack — perfect for celebrations!", discount: "20% OFF", color: "from-amber-500/20 to-orange-500/20" },
    { emoji: "🌶️", title: "Pickle Combo Deal", titleTa: "ஊறுகாய் சிறப்பு ஆஃபர்", description: "Buy any 3 pickle varieties and get special bundle pricing!", discount: "Buy 3 Save ₹150", color: "from-red-500/20 to-rose-500/20" },
    { emoji: "🎉", title: "New Customer Offer", titleTa: "புதிய வாடிக்கையாளர் ஆஃபர்", description: "First order? Get a special welcome discount on your entire order!", discount: "15% OFF", color: "from-emerald-500/20 to-teal-500/20" },
];

/**
 * Persistent countdown hook that fetches expiry from backend
 */
function usePersistentCountdown() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [enabled, setEnabled] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const calcTimeLeft = useCallback((end: string): TimeLeft => {
        const diff = Math.max(0, new Date(end).getTime() - Date.now());
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            totalMs: diff,
        };
    }, []);

    useEffect(() => {
        fetchCountdown()
            .then((res) => {
                if (res.success && res.data && res.data.enabled && !res.data.isExpired) {
                    setEndDate(res.data.offerEndDate);
                    setCreatedAt(res.data.createdAt);
                    setEnabled(true);
                }
            })
            .catch(() => { /* fallback: no countdown */ });
    }, []);

    useEffect(() => {
        if (!enabled || !endDate) return;

        setTimeLeft(calcTimeLeft(endDate));
        intervalRef.current = setInterval(() => {
            const tl = calcTimeLeft(endDate);
            setTimeLeft(tl);
            if (tl.totalMs <= 0 && intervalRef.current) {
                clearInterval(intervalRef.current);
                setEnabled(false);
            }
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [enabled, endDate, calcTimeLeft]);

    return { timeLeft, enabled, endDate, createdAt };
}

const SpecialOffers: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>(FALLBACK_OFFERS);
    const [visible, setVisible] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [slideDir, setSlideDir] = useState<"left" | "right">("right");

    useEffect(() => {
        fetchSiteSettings()
            .then((res) => {
                if (res.success && res.data) {
                    if (res.data.offersVisible === false) { setVisible(false); return; }
                    const active = (res.data.offers || []).filter((o: Offer) => o.active !== false);
                    if (active.length > 0) setOffers(active);
                }
            })
            .catch(() => { /* use fallback */ });
    }, []);

    // Persistent countdown from backend
    const { timeLeft: countdown, enabled: countdownEnabled } = usePersistentCountdown();

    // Auto-cycle
    useEffect(() => {
        if (offers.length <= 1) return;
        const id = setInterval(() => {
            setSlideDir("right");
            setActiveIndex((prev) => (prev + 1) % offers.length);
        }, 5000);
        return () => clearInterval(id);
    }, [offers.length]);

    const prev = () => {
        setSlideDir("left");
        setActiveIndex((i) => (i - 1 + offers.length) % offers.length);
    };
    const next = () => {
        setSlideDir("right");
        setActiveIndex((i) => (i + 1) % offers.length);
    };

    if (!visible || offers.length === 0) return null;

    const offer = offers[activeIndex];

    const scrollToProducts = () => {
        const el = document.querySelector("#best-sellers") || document.querySelector("#sweets");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="py-8 md:py-12 relative overflow-hidden">
            <div className="container px-4">
                <div
                    key={activeIndex}
                    className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${offer.color} border border-border/30 shadow-card transition-all duration-700 animate-${slideDir === "right" ? "slide-in-right" : "slide-in-left"}`}
                >
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 shine-effect pointer-events-none" />

                    {/* Floating emojis */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {["🍬", "🌶️", "🍪", "🍯"].map((e, i) => (
                            <span
                                key={i}
                                className="absolute text-2xl md:text-3xl opacity-10 animate-float"
                                style={{
                                    left: `${10 + i * 22}%`,
                                    top: `${20 + (i % 2) * 40}%`,
                                    animationDuration: `${3 + i * 0.8}s`,
                                    animationDelay: `${i * 0.5}s`,
                                }}
                            >
                                {e}
                            </span>
                        ))}
                    </div>

                    <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        {/* Left: Offer info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold mb-3">
                                <Flame className="h-3.5 w-3.5" />
                                Limited Time Offer
                            </div>

                            <div className="text-4xl md:text-5xl mb-3 animate-scale-in">{offer.emoji}</div>

                            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                                {offer.title}
                            </h3>
                            <p className="text-xs text-muted-foreground tamil-text mt-0.5">{offer.titleTa}</p>
                            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-md">
                                {offer.description}
                            </p>

                            <div className="mt-4 inline-block px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                                <span className="text-lg md:text-xl font-bold text-primary">{offer.discount}</span>
                            </div>

                            <div className="mt-5">
                                <Button
                                    onClick={scrollToProducts}
                                    className="gap-2 text-sm shadow-lg btn-lift ripple rounded-xl h-11"
                                >
                                    Shop Now
                                    <span className="tamil-text text-[10px] opacity-80">இப்போது வாங்கு</span>
                                </Button>
                            </div>
                        </div>

                        {/* Right: Countdown + nav */}
                        <div className="flex flex-col items-center gap-5">
                            {/* Countdown — only shows when backend countdown is active */}
                            {countdownEnabled && countdown && countdown.totalMs > 0 && (
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    Offer Ends In
                                    {countdown.totalMs < 24 * 60 * 60 * 1000 && (
                                        <span className="ml-1 flex items-center gap-0.5 text-amber-500">
                                            <AlertTriangle className="h-3 w-3" /> Ending Soon!
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {[
                                        { v: countdown.days, l: "Days" },
                                        { v: countdown.hours, l: "Hrs" },
                                        { v: countdown.minutes, l: "Min" },
                                        { v: countdown.seconds, l: "Sec" },
                                    ].map((t) => (
                                        <div key={t.l} className="flex flex-col items-center">
                                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-card/80 backdrop-blur border border-border/40 flex items-center justify-center shadow-soft">
                                                <span className="text-lg md:text-xl font-bold text-foreground tabular-nums">
                                                    {String(t.v).padStart(2, "0")}
                                                </span>
                                            </div>
                                            <span className="text-[9px] md:text-[10px] text-muted-foreground mt-1 font-medium">{t.l}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            )}

                            {/* Dots + arrows */}
                            {offers.length > 1 && (
                                <div className="flex items-center gap-3">
                                    <button onClick={prev} className="p-1.5 rounded-full hover:bg-card/60 transition-colors text-muted-foreground hover:text-foreground">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <div className="flex gap-1.5">
                                        {offers.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setSlideDir(i > activeIndex ? "right" : "left"); setActiveIndex(i); }}
                                                className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                                            />
                                        ))}
                                    </div>
                                    <button onClick={next} className="p-1.5 rounded-full hover:bg-card/60 transition-colors text-muted-foreground hover:text-foreground">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SpecialOffers;
