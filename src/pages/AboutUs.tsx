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
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-20 pb-16 md:pt-28 md:pb-24 border-b">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] pointer-events-none"></div>
        <div className="container relative mx-auto px-4 max-w-6xl z-10">
          <Button variant="outline" className="mb-8 border-primary/20 hover:bg-primary/10 transition-colors rounded-full backdrop-blur-md bg-background/50 text-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home / முகப்புக்கு திரும்பு
          </Button>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-foreground tracking-tight drop-shadow-sm">
              Our <span className="text-primary">Heritage</span> / எங்கள் <span className="text-primary">பாரம்பரியம்</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are dedicated to bringing the authentic taste of tradition to your modern lifestyle, crafting traditional sweets, snacks, and pickles with generation-old recipes hailing from the heart of Tamil Nadu. / உங்கள் நவீன வாழ்க்கை முறைக்கு பாரம்பரியத்தின் உண்மையான சுவையைக் கொண்டுவருவதற்கு நாங்கள் அர்ப்பணித்துள்ளோம்.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading company information...</p>
          </div>
        ) : !data ? (
          <div className="py-20 text-center text-muted-foreground">Failed to load information. Please try again.</div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10">
            
            {/* Left Column - Info Cards */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 xl:col-span-4 space-y-8"
            >
              {/* Company Info */}
              <Card className="rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 bg-card/90 backdrop-blur-md border-border/50 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-full -z-10 group-hover:bg-primary/20 transition-colors duration-500"></div>
                <CardHeader className="px-8 pt-8 pb-4">
                  <CardTitle className="flex items-center gap-3 font-serif text-3xl">
                    <div className="p-3 bg-primary/10 rounded-2xl shadow-inner">
                        <Building2 className="h-7 w-7 text-primary" />
                    </div>
                    Our Roots / எங்கள் வேர்கள்
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  <p className="text-muted-foreground leading-relaxed text-[1.05rem]">
                    {data.company.description}
                  </p>
                  
                  <div className="space-y-4 pt-6 border-t border-border/50">
                    <h3 className="font-bold text-foreground tracking-tight text-xl mb-3">Get in Touch / தொடர்புகொள்ள</h3>
                    <div className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors p-3 -mx-3 rounded-xl hover:bg-primary/5 cursor-default">
                      <div className="bg-background border shadow-sm p-2 rounded-lg shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium whitespace-pre-wrap">{data.company.contact.email}</span>
                    </div>
                    <div className="flex items-start gap-4 text-muted-foreground hover:text-primary transition-colors p-3 -mx-3 rounded-xl hover:bg-primary/5 cursor-default">
                       <div className="bg-background border shadow-sm p-2 rounded-lg shrink-0">
                           <Phone className="h-5 w-5 text-primary" />
                       </div>
                      <span className="font-medium whitespace-pre-line leading-relaxed">{data.company.contact.phone.replace(', ', '\n')}</span>
                    </div>
                    <div className="flex items-start gap-4 text-muted-foreground hover:text-primary transition-colors p-3 -mx-3 rounded-xl hover:bg-primary/5 cursor-default">
                       <div className="bg-background border shadow-sm p-2 rounded-lg shrink-0 mt-0.5">
                          <MapPin className="h-5 w-5 text-primary" />
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
                className="lg:col-span-7 xl:col-span-8 h-[650px] lg:h-auto min-h-[550px]"
            >
              <Card className="h-full rounded-3xl shadow-xl border-border/50 overflow-hidden flex flex-col ring-1 ring-border/50">
                <div className="p-5 border-b bg-card flex items-center justify-between z-10 relative shadow-sm">
                  <h3 className="font-bold flex items-center gap-3 text-xl font-serif">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary"/>
                    </div>
                    Our Locations in Tamil Nadu / தமிழ்நாட்டில் எங்கள் இருப்பிடங்கள்
                  </h3>
                  <span className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                      Interactive Map / ஊடாடும் வரைபடம்
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
