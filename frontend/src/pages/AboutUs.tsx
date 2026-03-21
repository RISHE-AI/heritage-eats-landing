import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, User, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import GallerySection from '@/components/GallerySection';
import { getAboutInfoAPI } from '@/services/api';
import { motion } from 'framer-motion';

const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  // Helper to render bilingual text inline
  const BilingualInline = ({ en, ta, blockDelay = false }: { en: React.ReactNode, ta: React.ReactNode, blockDelay?: boolean }) => (
    <span className={blockDelay ? "block" : "inline"}>
        {en} <span className="text-[0.85em] opacity-80 inline-block align-baseline ml-1">/ {ta}</span>
    </span>
  );

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await getAboutInfoAPI();
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to load about info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-16 pb-12 md:pt-28 md:pb-24 border-b">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] pointer-events-none"></div>
        <div className="container relative mx-auto px-4 max-w-6xl z-10">
          <Button variant="outline" size="sm" className="mb-6 md:mb-8 border-primary/20 hover:bg-primary/10 transition-colors rounded-full backdrop-blur-md bg-background/50 text-foreground text-xs md:text-sm shadow-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /> <BilingualInline en="Back to Home" ta="முகப்புக்கு திரும்பு" />
          </Button>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="font-serif text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 text-foreground tracking-tight drop-shadow-sm leading-tight break-words">
              <span className="block md:inline">Our <span className="text-primary">Heritage</span></span>
              <span className="hidden md:inline mx-3 text-[0.6em] opacity-60 font-normal align-middle">/</span>
              <span className="block md:inline text-2xl md:text-4xl lg:text-5xl opacity-90 mt-1 md:mt-0 font-normal">எங்கள் <span className="text-primary font-bold">பாரம்பரியம்</span></span>
            </h1>
            <div className="text-base md:text-xl text-muted-foreground leading-relaxed space-y-3 md:space-y-4">
              <p>We are dedicated to bringing the authentic taste of tradition to your modern lifestyle, crafting traditional sweets, snacks, and pickles with generation-old recipes hailing from the heart of Tamil Nadu.</p>
              <p className="text-base md:text-lg opacity-80">உங்கள் நவீன வாழ்க்கை முறைக்கு பாரம்பரியத்தின் உண்மையான சுவையைக் கொண்டுவருவதற்கு நாங்கள் அர்ப்பணித்துள்ளோம்.</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading company information...</p>
          </div>
        ) : !data ? (
          <div className="py-20 text-center text-muted-foreground">Failed to load information. Please try again.</div>
        ) : (
          <div className="flex justify-center w-full">
            {/* Center - Admin / Company Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-4xl space-y-6 md:space-y-8"
            >
              {/* Company Info */}
              <Card className="rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 bg-card/90 backdrop-blur-md border-border/50 overflow-hidden relative group h-full">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-bl-[80px] -z-10 group-hover:bg-primary/20 transition-colors duration-500"></div>
                
                {/* Contact Details (Now Main Focus) */}
                <CardHeader className="px-5 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4 border-b border-border/50 bg-primary/5">
                  <CardTitle className="flex items-center gap-2 md:gap-3 font-serif text-2xl md:text-3xl break-words text-primary">
                    <div className="p-2 md:p-3 bg-background rounded-xl md:rounded-2xl shadow-sm shrink-0 border border-primary/20 hover:scale-105 transition-transform duration-300">
                        <Phone className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    </div>
                    <div>
                        <BilingualInline en="Get in Touch" ta="தொடர்புகொள்ள" />
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-5 md:px-8 pt-6 md:pt-8 pb-6 md:pb-8 space-y-6 md:space-y-8">
                  {/* Contact Info Rows */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-xl bg-background border border-border/60 shadow-sm text-foreground hover:shadow-md hover:border-primary/30 transition-all duration-300 group/item">
                      <div className="bg-primary/10 p-2.5 rounded-lg shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                          <Mail className="h-5 w-5 sm:h-6 sm:w-6 transition-colors border-0" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">Email</p>
                        <span className="font-semibold text-sm sm:text-base md:text-lg whitespace-pre-wrap break-all block leading-tight">{data.company.contact.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-xl bg-background border border-border/60 shadow-sm text-foreground hover:shadow-md hover:border-primary/30 transition-all duration-300 group/item">
                       <div className="bg-primary/10 p-2.5 rounded-lg shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                           <Phone className="h-5 w-5 sm:h-6 sm:w-6 transition-colors border-0" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">Phone</p>
                          <span className="font-semibold text-sm sm:text-base md:text-lg whitespace-pre-line leading-relaxed block">{data.company.contact.phone.replace(', ', '\n')}</span>
                       </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-xl bg-background border border-border/60 shadow-sm text-foreground hover:shadow-md hover:border-primary/30 transition-all duration-300 group/item">
                       <div className="bg-primary/10 p-2.5 rounded-lg shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                          <MapPin className="h-5 w-5 sm:h-6 sm:w-6 transition-colors border-0" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">Address</p>
                          <span className="font-medium text-sm md:text-base leading-relaxed block">{data.company.contact.address}</span>
                       </div>
                    </div>
                  </div>

                  {/* Our Roots (Secondary Focus) */}
                  <div className="pt-6 md:pt-8 border-t border-border/50">
                    <h3 className="flex items-center gap-2 font-bold mb-3 md:mb-4 text-base md:text-lg font-serif text-muted-foreground">
                      <div className="p-1.5 bg-secondary/80 rounded-lg">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <BilingualInline en="Our Roots" ta="எங்கள் வேர்கள்" />
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-xs md:text-sm bg-secondary/20 p-4 rounded-xl border border-border/40">
                      {data.company.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        )}
      </div>

      {/* Embedded Gallery Section directly below the grid */}
      <div className="w-full bg-secondary/10 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>
        <GallerySection />
      </div>

    </div>
  );
};

export default AboutUs;
