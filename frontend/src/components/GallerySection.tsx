import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchSiteSettings } from "@/services/api";

interface GalleryImage {
    src: string;
    alt: string;
    caption: string;
    captionTa: string;
    span?: string;
}

const FALLBACK_GALLERY: GalleryImage[] = [
    {
        src: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80",
        alt: "Traditional Indian Sweets",
        caption: "Traditional Sweets",
        captionTa: "பாரம்பரிய இனிப்புகள்",
        span: "md:row-span-2"
    },
    {
        src: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80",
        alt: "Spicy Pickles",
        caption: "Homemade Pickles",
        captionTa: "வீட்டு ஊறுகாய்"
    },
    {
        src: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80",
        alt: "Indian Snacks",
        caption: "Crunchy Snacks",
        captionTa: "மொறுமொறு தின்பண்டங்கள்"
    },
    {
        src: "https://images.unsplash.com/photo-1606471191009-63994c53433b?w=600&q=80",
        alt: "Fresh Ingredients",
        caption: "Fresh Ingredients",
        captionTa: "புதிய பொருட்கள்"
    },
    {
        src: "https://images.unsplash.com/photo-1590080875852-ba44f302c8ba?w=600&q=80",
        alt: "Traditional Cooking",
        caption: "Traditional Cooking",
        captionTa: "பாரம்பரிய சமையல்",
        span: "md:col-span-2 md:row-span-2"
    },
    {
        src: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80",
        alt: "Festive Box",
        caption: "Gift Boxes",
        captionTa: "பரிசு பெட்டிகள்"
    },
    {
        src: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80",
        alt: "South Indian Snacks",
        caption: "Evening Snacks",
        captionTa: "மாலை நேர உணவு"
    },
    {
        src: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&q=80",
        alt: "Laddu Sweets",
        caption: "Sweet Specials",
        captionTa: "சிறப்பு இனிப்புகள்"
    },
    {
        src: "https://images.unsplash.com/photo-1589308078054-832f7b7b8c2c?w=600&q=80",
        alt: "Healthy Traditional Food",
        caption: "Healthy Choices",
        captionTa: "ஆரோக்கியமான தேர்வுகள்"
    }
];

const GallerySection: React.FC = () => {
    const [gallery, setGallery] = useState<GalleryImage[]>(FALLBACK_GALLERY);
    const [visible, setVisible] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    useEffect(() => {
        fetchSiteSettings()
            .then((res) => {
                if (res.success && res.data) {
                    if (res.data.galleryVisible === false) {
                        setVisible(false);
                        return;
                    }
                    if (res.data.gallery && res.data.gallery.length > 0) {
                        setGallery(res.data.gallery);
                    }
                }
            })
            .catch(() => { });
    }, []);

    const openLightbox = (i: number) => setLightboxIndex(i);
    const closeLightbox = () => setLightboxIndex(null);

    const prevImage = () =>
        setLightboxIndex((i) =>
            i !== null ? (i - 1 + gallery.length) % gallery.length : null
        );

    const nextImage = () =>
        setLightboxIndex((i) =>
            i !== null ? (i + 1) % gallery.length : null
        );

    if (!visible) return null;

    return (
        <section className="py-10 md:py-16">
            <div className="container px-4">
                {/* Heading */}
                <div className="text-center mb-8 md:mb-10">
                    <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                        From Our Kitchen
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground tamil-text">
                        எங்கள் சமையலறையிலிருந்து
                    </p>
                    <div className="mx-auto mt-3 h-0.5 w-16 md:w-20 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
                </div>

                {/* Grid */}
                <div
                    className="
                        grid 
                        grid-cols-2 md:grid-cols-3 
                        gap-3 md:gap-4 
                        max-w-6xl mx-auto 
                        auto-rows-[180px] md:auto-rows-[220px] 
                        grid-flow-dense 
                        place-items-stretch
                    "
                >
                    {gallery.map((img, i) => (
                        <div
                            key={i}
                            className={`relative rounded-2xl overflow-hidden cursor-pointer group ${img.span || ""} animate-fade-in-up`}
                            style={{
                                animationDelay: `${i * 100}ms`,
                                animationFillMode: "both"
                            }}
                            onClick={() => openLightbox(i)}
                        >
                            <img
                                src={img.src}
                                alt={img.alt}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4">
                                <p className="text-white text-sm md:text-base font-semibold">
                                    {img.caption}
                                </p>
                                <p className="text-white/70 text-[10px] md:text-xs tamil-text">
                                    {img.captionTa}
                                </p>
                            </div>

                            {/* Zoom Icon */}
                            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                                <span className="text-white text-xs">🔍</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeLightbox();
                        }}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                        }}
                        className="absolute left-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <div
                        className="relative max-w-4xl max-h-[80vh] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={gallery[lightboxIndex].src.replace("w=600", "w=1200")}
                            alt={gallery[lightboxIndex].alt}
                            className="w-full max-h-[75vh] object-contain rounded-xl"
                        />
                        <div className="text-center mt-3">
                            <p className="text-white text-base font-semibold">
                                {gallery[lightboxIndex].caption}
                            </p>
                            <p className="text-white/60 text-xs tamil-text">
                                {gallery[lightboxIndex].captionTa}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                        className="absolute right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {gallery.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex(i);
                                }}
                                className={`h-2 rounded-full transition-all duration-300 ${i === lightboxIndex
                                    ? "w-6 bg-white"
                                    : "w-2 bg-white/30"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default GallerySection;