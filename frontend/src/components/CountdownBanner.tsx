import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Flame, AlertTriangle } from "lucide-react";
import { fetchCountdown } from "@/services/api";

interface CountdownData {
  enabled: boolean;
  offerEndDate: string | null;
  offerTitle: string;
  offerTitleTa: string;
  offerDescription: string;
  isExpired: boolean;
  createdAt: string | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

const DIGIT_ANIMATION_CLASS = "countdown-digit-animate";

/**
 * AnimatedDigit — flips when value changes
 */
const AnimatedDigit: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const [animate, setAnimate] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setAnimate(true);
      prevValue.current = value;
      const timeout = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-card/80 backdrop-blur border border-border/40 
                    flex items-center justify-center shadow-soft transition-transform duration-300
                    ${animate ? "scale-110" : "scale-100"}`}
      >
        <span
          className={`text-xl md:text-2xl font-bold text-foreground tabular-nums transition-all duration-300
                      ${animate ? "text-primary" : ""}`}
        >
          {value}
        </span>
      </div>
      <span className="text-[10px] md:text-xs text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

/**
 * ProgressBar — shows time remaining as a depleting bar
 */
const ProgressBar: React.FC<{
  createdAt: string | null;
  endDate: string | null;
  totalMs: number;
}> = ({ createdAt, endDate, totalMs }) => {
  if (!createdAt || !endDate) return null;

  const totalDuration = new Date(endDate).getTime() - new Date(createdAt).getTime();
  const percentage = totalDuration > 0 ? Math.max(0, Math.min(100, (totalMs / totalDuration) * 100)) : 0;

  return (
    <div className="w-full max-w-xs mx-auto mt-3">
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            percentage < 10 ? "bg-destructive animate-pulse" : "bg-primary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const CountdownBanner: React.FC = () => {
  const [data, setData] = useState<CountdownData | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch countdown data from server
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetchCountdown();
        if (!cancelled && res.success && res.data) {
          setData(res.data);
        }
      } catch {
        // Silently fail — banner just won't show
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Calculate remaining time
  const calcTimeLeft = useCallback((): TimeLeft | null => {
    if (!data?.offerEndDate) return null;
    const diff = Math.max(0, new Date(data.offerEndDate).getTime() - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      totalMs: diff,
    };
  }, [data]);

  // Start countdown interval
  useEffect(() => {
    if (!data?.enabled || data.isExpired || !data.offerEndDate) return;

    // Initial calculation
    setTimeLeft(calcTimeLeft());

    // Update every second
    intervalRef.current = setInterval(() => {
      const tl = calcTimeLeft();
      setTimeLeft(tl);

      // Auto-expire: hide when timer hits 0
      if (tl && tl.totalMs <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data, calcTimeLeft]);

  // Don't render if loading, disabled, expired, or no data
  if (loading || !data?.enabled || data.isExpired) return null;
  if (!timeLeft || timeLeft.totalMs <= 0) return null;

  const isEndingSoon = timeLeft.totalMs < 24 * 60 * 60 * 1000; // < 24 hours
  const isUrgent = timeLeft.totalMs < 60 * 60 * 1000; // < 1 hour

  return (
    <div
      className={`py-3 px-4 text-center transition-all duration-500 border-b border-border/30 ${
        isUrgent
          ? "bg-destructive/10 animate-pulse"
          : isEndingSoon
          ? "bg-amber-500/10"
          : "bg-primary/5"
      }`}
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        {/* Offer Info */}
        <div className="flex items-center gap-2">
          {isEndingSoon ? (
            <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
          ) : (
            <Flame className="h-4 w-4 text-primary" />
          )}
          <div className="text-sm font-semibold text-foreground">
            {isEndingSoon ? "⏰ Offer Ending Soon!" : data.offerTitle}
          </div>
          {data.offerDescription && (
            <span className="text-xs text-muted-foreground hidden md:inline">
              — {data.offerDescription}
            </span>
          )}
        </div>

        {/* Countdown Digits */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1" />
          {[
            { v: timeLeft.days, l: "D" },
            { v: timeLeft.hours, l: "H" },
            { v: timeLeft.minutes, l: "M" },
            { v: timeLeft.seconds, l: "S" },
          ].map((t, i) => (
            <React.Fragment key={t.l}>
              {i > 0 && <span className="text-muted-foreground font-bold mx-0.5">:</span>}
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold tabular-nums
                  ${
                    isUrgent
                      ? "bg-destructive/20 text-destructive"
                      : isEndingSoon
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-primary/10 text-primary"
                  }`}
              >
                {String(t.v).padStart(2, "0")}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar createdAt={data.createdAt} endDate={data.offerEndDate} totalMs={timeLeft.totalMs} />
    </div>
  );
};

export default CountdownBanner;
