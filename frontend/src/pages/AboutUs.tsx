import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, User, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '@/components/Header';
import { getAboutInfoAPI } from '@/services/api';
import { motion } from 'framer-motion';

// Tamil Nadu Map Bounds
const TN_BOUNDS = L.latLngBounds(
  [8.08, 76.23], // South West
  [13.49, 80.34] // North East
);

// Fix Leaflet default icon issues path
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for User's Home
const UserIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.2/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon for Company
const CompanyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.2/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle auto-zooming to bounds of all markers
const MapAutoZom = ({ coordinates }: { coordinates: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [coordinates, map]);
  return null;
};

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

  // Collect all coordinates for auto-zoom bounds
  const getMapCoordinates = (): [number, number][] => {
    if (!data) return [];
    const coords: [number, number][] = [];
    if (data.company?.locations) {
      data.company.locations.forEach((loc: any) => {
        coords.push([loc.lat, loc.lng]);
      });
    }
    return coords;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-16 pb-12 md:pt-28 md:pb-24 border-b">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] pointer-events-none"></div>
        <div className="container relative mx-auto px-4 max-w-6xl z-10">
          <Button variant="outline" size="sm" className="mb-6 md:mb-8 border-primary/20 hover:bg-primary/10 transition-colors rounded-full backdrop-blur-md bg-background/50 text-foreground text-xs md:text-sm" onClick={() => navigate(-1)}>
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
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
            
            {/* Left Column - Info Cards */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 xl:col-span-4 space-y-6 md:space-y-8"
            >
              {/* Company Info */}
              <Card className="rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 bg-card/90 backdrop-blur-md border-border/50 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-40 md:h-40 bg-primary/10 rounded-bl-full -z-10 group-hover:bg-primary/20 transition-colors duration-500"></div>
                <CardHeader className="px-5 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4">
                  <CardTitle className="flex items-center gap-2 md:gap-3 font-serif text-xl md:text-3xl break-words">
                    <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl shadow-inner shrink-0">
                        <Building2 className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                    </div>
                    <BilingualInline en="Our Roots" ta="எங்கள் வேர்கள்" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 md:px-8 pb-6 md:pb-8 space-y-5 md:space-y-6">
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-[1.05rem]">
                    {data.company.description}
                  </p>
                  
                  <div className="space-y-4 pt-5 md:pt-6 border-t border-border/50">
                    <h3 className="font-bold text-foreground tracking-tight text-lg md:text-xl mb-2 md:mb-3"><BilingualInline en="Get in Touch" ta="தொடர்புகொள்ள" /></h3>
                    <div className="flex items-center gap-3 md:gap-4 text-muted-foreground hover:text-primary transition-colors p-2 md:p-3 -mx-2 md:-mx-3 rounded-xl hover:bg-primary/5 cursor-default text-sm md:text-base">
                      <div className="bg-background border shadow-sm p-1.5 md:p-2 rounded-lg shrink-0">
                          <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      </div>
                      <span className="font-medium whitespace-pre-wrap break-all">{data.company.contact.email}</span>
                    </div>
                    <div className="flex items-start gap-3 md:gap-4 text-muted-foreground hover:text-primary transition-colors p-2 md:p-3 -mx-2 md:-mx-3 rounded-xl hover:bg-primary/5 cursor-default text-sm md:text-base">
                       <div className="bg-background border shadow-sm p-1.5 md:p-2 rounded-lg shrink-0">
                           <Phone className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                       </div>
                      <span className="font-medium whitespace-pre-line leading-relaxed">{data.company.contact.phone.replace(', ', '\n')}</span>
                    </div>
                    <div className="flex items-start gap-3 md:gap-4 text-muted-foreground hover:text-primary transition-colors p-2 md:p-3 -mx-2 md:-mx-3 rounded-xl hover:bg-primary/5 cursor-default text-sm md:text-base">
                       <div className="bg-background border shadow-sm p-1.5 md:p-2 rounded-lg shrink-0 mt-0.5">
                          <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                       </div>
                      <span className="font-medium leading-relaxed">{data.company.contact.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Map */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="lg:col-span-7 xl:col-span-8 h-[400px] sm:h-[500px] lg:h-auto min-h-[350px] lg:min-h-[550px]"
            >
              <Card className="h-full rounded-2xl md:rounded-3xl shadow-xl border-border/50 overflow-hidden flex flex-col ring-1 ring-border/50">
                <div className="p-3 md:p-5 border-b bg-card flex flex-col lg:flex-row items-start lg:items-center justify-between z-10 relative shadow-sm gap-2">
                  <h3 className="font-bold flex items-center gap-2 md:gap-3 text-base md:text-xl font-serif break-words">
                    <div className="bg-primary/10 p-1.5 md:p-2 rounded-lg shrink-0">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary"/>
                    </div>
                    <BilingualInline en="Our Locations in Tamil Nadu" ta="தமிழ்நாட்டில் எங்கள் இருப்பிடங்கள்" blockDelay={false} />
                  </h3>
                  <span className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1 w-fit">
                      <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                      <BilingualInline en="Interactive Map" ta="ஊடாடும் வரைபடம்" />
                  </span>
                </div>
                
                <div className="flex-1 relative z-0">
                  <MapContainer 
                      center={[11.2189, 78.1674]}
                      zoom={8} 
                      minZoom={7}
                      maxZoom={12}
                      maxBounds={TN_BOUNDS}
                      maxBoundsViscosity={1.0}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                      className="z-0 bg-transparent"
                  >
                      <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      />
                      <MapAutoZom coordinates={getMapCoordinates()} />
                      {data.company.locations.map((loc: any) => (
                          <Marker 
                              key={loc.id} 
                              position={[loc.lat, loc.lng]}
                              icon={CompanyIcon}
                          >
                              <Popup>
                                  <div className="font-sans min-w-[150px]">
                                      <p className="font-bold text-primary mb-1">{loc.name}</p>
                                      <p className="text-xs text-muted-foreground font-medium">{loc.role}</p>
                                  </div>
                              </Popup>
                          </Marker>
                      ))}
                  </MapContainer>
                </div>
              </Card>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUs;
