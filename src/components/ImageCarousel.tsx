import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
    images: string[];
    productName: string;
    className?: string;
    aspectRatio?: string; // e.g. "aspect-square" or "aspect-[4/3]"
}

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

function resolveImageSrc(img: string): string {
    if (!img || img === "/placeholder.svg") return "/placeholder.svg";
    if (img.startsWith("http") || img.startsWith("/images/") || img.startsWith("/placeholder")) return img;
    return `${BACKEND}/${img.replace(/^\//, "")}`;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
    images,
    productName,
    className,
    aspectRatio = "aspect-square",
}) => {
    // Filter out empty/placeholder entries; fall back to placeholder if none
    const realImages = images.filter((img) => img && img !== "/placeholder.svg");
    const hasImages = realImages.length > 0;
    const displayImages = hasImages ? realImages : ["/placeholder.svg"];

    // For circular queue: clone the first image at the end
    // Indices: 0 = clone of last (not used here), 1..n = real, n+1 = clone of first
    // Simpler approach: [last_clone, ...displayImages, first_clone]
    const slides = displayImages.length > 1
        ? [...displayImages, displayImages[0]]
        : displayImages;

    // currentSlide is the index into `slides`
    const [currentSlide, setCurrentSlide] = useState(0);
    const [transitioning, setTransitioning] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [activeThumb, setActiveThumb] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalSlides = slides.length;
    const isMultiple = displayImages.length > 1;

    // Sync activeThumb with currentSlide (accounting for clone)
    useEffect(() => {
        if (currentSlide >= displayImages.length) {
            setActiveThumb(0);
        } else {
            setActiveThumb(currentSlide);
        }
    }, [currentSlide, displayImages.length]);

    // After transitioning to the clone (last slide), instantly reset to real index 0
    const handleTransitionEnd = useCallback(() => {
        if (!isMultiple) return;
        if (currentSlide === displayImages.length) {
            // We're on the clone of the first image — jump instantly to real index 0
            setTransitioning(false);
            setCurrentSlide(0);
        }
    }, [currentSlide, displayImages.length, isMultiple]);

    // Re-enable transition after instant reset
    useEffect(() => {
        if (!transitioning) {
            const raf = requestAnimationFrame(() => {
                requestAnimationFrame(() => setTransitioning(true));
            });
            return () => cancelAnimationFrame(raf);
        }
    }, [transitioning]);

    const goNext = useCallback(() => {
        setTransitioning(true);
        setCurrentSlide((prev) => prev + 1);
    }, []);

    const goPrev = useCallback(() => {
        setTransitioning(true);
        setCurrentSlide((prev) => {
            if (prev === 0) return displayImages.length - 1;
            return prev - 1;
        });
    }, [displayImages.length]);

    const goTo = useCallback((index: number) => {
        setTransitioning(true);
        setCurrentSlide(index);
        setActiveThumb(index);
    }, []);

    // Auto-slide
    useEffect(() => {
        if (!isMultiple || isHovered) return;
        autoSlideRef.current = setInterval(goNext, 4000);
        return () => {
            if (autoSlideRef.current) clearInterval(autoSlideRef.current);
        };
    }, [isMultiple, isHovered, goNext]);

    // Touch swipe
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
    const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 40) {
            if (diff > 0) goNext();
            else goPrev();
        }
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {/* Main Carousel */}
            <div
                className={cn(
                    "relative overflow-hidden rounded-2xl bg-secondary/20",
                    aspectRatio
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                ref={containerRef}
            >
                {/* Slide Strip */}
                <div
                    className="flex h-full"
                    style={{
                        width: `${totalSlides * 100}%`,
                        transform: `translateX(-${(currentSlide / totalSlides) * 100}%)`,
                        transition: transitioning ? "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                    }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {slides.map((img, idx) => (
                        <div
                            key={idx}
                            className="relative h-full flex-shrink-0"
                            style={{ width: `${100 / totalSlides}%` }}
                        >
                            <img
                                src={resolveImageSrc(img)}
                                alt={`${productName} — ${idx + 1}`}
                                className="h-full w-full object-cover rounded-2xl"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>

                {/* Arrows — only when multiple images */}
                {isMultiple && (
                    <>
                        <button
                            onClick={goPrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background transition-all hover:scale-110 active:scale-95 z-10"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={goNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background transition-all hover:scale-110 active:scale-95 z-10"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                )}

                {/* Dot indicators */}
                {isMultiple && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {displayImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goTo(idx)}
                                aria-label={`Go to image ${idx + 1}`}
                                className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    idx === activeThumb
                                        ? "bg-white w-5 shadow-md"
                                        : "bg-white/50 w-2 hover:bg-white/70"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Image counter badge */}
                {isMultiple && (
                    <span className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm z-10">
                        {activeThumb + 1}/{displayImages.length}
                    </span>
                )}
            </div>

            {/* Thumbnail Strip — only when 2+ images */}
            {isMultiple && (
                <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                    {displayImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => goTo(idx)}
                            aria-label={`Thumbnail ${idx + 1}`}
                            className={cn(
                                "relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200",
                                idx === activeThumb
                                    ? "border-primary shadow-md scale-105"
                                    : "border-border/40 hover:border-primary/50 hover:scale-105 opacity-70 hover:opacity-100"
                            )}
                        >
                            <img
                                src={resolveImageSrc(img)}
                                alt={`${productName} thumbnail ${idx + 1}`}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                                draggable={false}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;
