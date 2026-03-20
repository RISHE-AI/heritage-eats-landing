import React, { useEffect, useRef, useState } from "react";
import { fetchSiteSettings } from "@/services/api";

interface StatItem {
    icon: string;
    value: number;
    suffix: string;
    labelEn: string;
    labelTa: string;
}

const FALLBACK_STATS: StatItem[] = [
    { icon: "😊", value: 1000, suffix: "+", labelEn: "Happy Customers", labelTa: "மகிழ்ச்சியான வாடிக்கையாளர்கள்" },
    { icon: "🍬", value: 50, suffix: "+", labelEn: "Products", labelTa: "தயாரிப்புகள்" },
    { icon: "📦", value: 10000, suffix: "+", labelEn: "Orders Delivered", labelTa: "ஆர்டர்கள் வழங்கப்பட்டன" },
    { icon: "🕰️", value: 25, suffix: "+", labelEn: "Years of Tradition", labelTa: "ஆண்டுகள் பாரம்பரியம்" },
];

function useCountUp(target: number, isVisible: boolean, duration = 2000) {
    const [count, setCount] = useState(0);
    const [done, setDone] = useState(false);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!isVisible || hasAnimated.current) return;
        hasAnimated.current = true;

        const startTime = performance.now();
        const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setDone(true);
            }
        };
        requestAnimationFrame(step);
    }, [isVisible, target, duration]);

    return { count, done };
}

// Each gradient style per card index
const CARD_GRADIENTS = [
    "from-emerald-500/10 to-teal-500/10",
    "from-amber-500/10 to-orange-500/10",
    "from-blue-500/10 to-indigo-500/10",
    "from-rose-500/10 to-pink-500/10",
];

const ICON_BG = [
    "from-emerald-500/20 to-teal-500/30",
    "from-amber-500/20 to-orange-500/30",
    "from-blue-500/20 to-indigo-500/30",
    "from-rose-500/20 to-pink-500/30",
];

const StatCard: React.FC<{ stat: StatItem; isVisible: boolean; index: number }> = ({ stat, isVisible, index }) => {
    const { count, done } = useCountUp(stat.value, isVisible);

    return (
        <div
            className="relative flex flex-col items-center text-center p-6 md:p-8 rounded-3xl bg-card/60 backdrop-blur-md border border-border/20 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-2 group animate-fade-in-up overflow-hidden"
            style={{ animationDelay: `${index * 150}ms`, animationFillMode: "both" }}
        >
            {/* Card gradient background */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-600`} />

            {/* Sparkle particles on hover */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[...Array(4)].map((_, i) => (
                    <span
                        key={i}
                        className="absolute text-[8px] text-primary/40 animate-float"
                        style={{
                            left: `${15 + i * 20}%`,
                            top: `${10 + (i % 2) * 60}%`,
                            animationDuration: `${2 + i * 0.5}s`,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    >
                        ✦
                    </span>
                ))}
            </div>

            <div className="relative z-10">
                {/* Icon with gradient background */}
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${ICON_BG[index % ICON_BG.length]} flex items-center justify-center mb-4 mx-auto shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    <span className="text-2xl md:text-3xl">{stat.icon}</span>
                </div>

                {/* Count with scale bounce */}
                <div className={`text-2xl sm:text-3xl md:text-4xl font-bold text-primary font-serif tabular-nums transition-transform duration-300 ${done ? "animate-scale-in" : ""}`}>
                    {count.toLocaleString()}{stat.suffix}
                </div>

                {/* Label */}
                <p className="mt-2 text-sm md:text-base font-semibold text-foreground">{stat.labelEn}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground tamil-text mt-0.5">{stat.labelTa}</p>

                {/* Subtle underline accent */}
                <div className={`mx-auto mt-3 h-0.5 w-0 group-hover:w-10 rounded-full bg-gradient-to-r ${CARD_GRADIENTS[index % CARD_GRADIENTS.length].replace('/10', '/40')} transition-all duration-500`} />
            </div>
        </div>
    );
};

const StatsCounter: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [stats, setStats] = useState<StatItem[]>(FALLBACK_STATS);
    const [visible, setVisible] = useState(true);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchSiteSettings()
            .then((res) => {
                if (res.success && res.data) {
                    if (res.data.statsVisible === false) { setVisible(false); return; }
                    if (res.data.stats && res.data.stats.length > 0) setStats(res.data.stats);
                }
            })
            .catch(() => { /* use fallback */ });
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    if (!visible) return null;

    return (
        <section ref={sectionRef} className="py-12 md:py-20 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <div className="absolute -left-32 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -right-32 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />

            {/* Animated grid lines (decorative) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }}
            />

            <div className="container px-4 relative z-10">
                <div className="text-center mb-10 md:mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 animate-fade-in-up">
                        📊 Our Impact
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                        Our Journey in Numbers
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground tamil-text animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                        எண்களில் எங்கள் பயணம்
                    </p>
                    <div className="mx-auto mt-4 h-1 w-16 md:w-20 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
                    {stats.map((stat, i) => (
                        <StatCard key={i} stat={stat} isVisible={isVisible} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsCounter;
