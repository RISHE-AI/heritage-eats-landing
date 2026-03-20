import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Truck, MapPin, CheckCircle, ArrowLeft, Loader2, Info, User, Phone, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '@/components/Header';
import { trackOrderAPI } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

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

// Custom Icon for Latest Checkpoint
const LatestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.2/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon for Source
const StartIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.2/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon for Destination
const EndIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.2/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle auto-zooming to bounds
const MapBounds = ({ coordinates }: { coordinates: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  return null;
};

// --- Translations Dictionary ---
type Language = 'en' | 'ta';

const translations = {
  en: {
    backToHome: "Back to Home",
    title: "Track Your Order",
    subtitle: "Enter your tracking ID to see the detailed journey of your package.",
    placeholder: "Enter Tracking ID (e.g. TEST1234)",
    trackButton: "Track",
    loading: "Retrieving package journey and geolocating data...",
    journeyDetails: "Journey Details",
    liveTrackingMap: "Live Tracking Map",
    activeMode: "Active Mode",
    mapFeedUnavailable: "Map Feed Unavailable",
    mapFeedError: "We couldn't accurately parse the geographic data for this tracking journey.",
    orderDetails: "Order Details",
    orderIdBtn: "Order ID",
    fromLabel: "From",
    toLabel: "To",
    contactNav: "Contact",
    errEnterId: "Please enter a tracking ID",
    errNotFound: "Tracking details not found or provider required Captcha",
    successFound: "Tracking details found for",
  },
  ta: {
    backToHome: "முகப்புக்குத் திரும்பு",
    title: "உங்கள் ஆர்டரை கண்காணிக்கவும்",
    subtitle: "உங்கள் பார்சலின் விரிவான பயணத்தைக் காண உங்கள் கண்காணிப்பு ஐடியை உள்ளிடவும்.",
    placeholder: "கண்காணிப்பு ஐடியை உள்ளிடவும்",
    trackButton: "கண்காணிக்க",
    loading: "பார்சல் பயணம் மற்றும் இருப்பிடத் தரவைப் பெறுகிறது...",
    journeyDetails: "பயண விவரங்கள்",
    liveTrackingMap: "நேரடி கண்காணிப்பு வரைபடம்",
    activeMode: "செயலில் உள்ளது",
    mapFeedUnavailable: "வரைபடம் கிடைக்கவில்லை",
    mapFeedError: "இந்த கண்காணிப்பு பயணத்தின் புவியியல் தரவை எங்களால் துல்லியமாகப் பாகுபடுத்த முடியவில்லை.",
    orderDetails: "ஆர்டர் விவரங்கள்",
    orderIdBtn: "ஆர்டர் ஐடி",
    fromLabel: "இருந்து",
    toLabel: "பெறுநர்",
    contactNav: "தொடர்புக்கு",
    errEnterId: "கண்காணிப்பு ஐடியை உள்ளிடவும்",
    errNotFound: "கண்காணிப்பு விவரங்கள் காணவில்லை அல்லது கேப்ட்சா தேவை",
    successFound: "கண்காணிப்பு விவரங்கள் கிடைத்தன",
  }
};

interface Checkpoint {
  location: string;
  message: string;
  date: string;
  lat?: number;
  lng?: number;
}

interface TrackingData {
  status: string;
  checkpoints: Checkpoint[];
  orderId?: string;
  fromAddress?: string;
  toAddress?: string;
  contactNumber?: string;
}

const TrackOrder = () => {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackingData | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [fromCoord, setFromCoord] = useState<[number, number] | null>(null);
  const [toCoord, setToCoord] = useState<[number, number] | null>(null);
  const navigate = useNavigate();

  // Helper to render bilingual text nicely
  const BilingualText = ({ en, ta, className = '' }: { en: string, ta: string, className?: string }) => (
    <span className={`block ${className}`}>
      <span>{en}</span>
      <span className="block text-[0.85em] opacity-80 font-normal mt-0.5">{ta}</span>
    </span>
  );

  // Helper to render bilingual text inline
  const BilingualInline = ({ en, ta }: { en: string, ta: string }) => (
    <span>{en} / <span className="text-[0.9em] opacity-80">{ta}</span></span>
  );

  // Function to geocode location manually
  const geocodeLocation = async (locationStr: string): Promise<[number, number] | null> => {
    try {
      const encoded = encodeURIComponent(locationStr);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`);
      const results = await res.json();
      if (results && results.length > 0) {
        return [parseFloat(results[0].lat), parseFloat(results[0].lon)];
      }
      return null;
    } catch (e) {
      console.error('Geocoding error:', e);
      return null;
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return toast.error(translations.en.errEnterId);

    setLoading(true);
    setData(null);
    setCoordinates([]);
    setFromCoord(null);
    setToCoord(null);
    
    try {
      const response = await trackOrderAPI(trackingId);
      if (response.success && response.data) {
        let trackingData = response.data;
        
        const mappedCheckpoints = [...trackingData.checkpoints];
        const validCoords: [number, number][] = [];

        // Geocode Source
        let sourceCoord = null;
        if (trackingData.fromAddress) {
          sourceCoord = await geocodeLocation(trackingData.fromAddress);
          if (sourceCoord) {
            setFromCoord(sourceCoord);
            validCoords.push(sourceCoord);
          }
        }

        // Reverse to show newest first in timeline but map oldest -> newest
        for (let idx = mappedCheckpoints.length - 1; idx >= 0; idx--) {
          const cp = mappedCheckpoints[idx];
          const coords = await geocodeLocation(cp.location);
          if (coords) {
            mappedCheckpoints[idx].lat = coords[0];
            mappedCheckpoints[idx].lng = coords[1];
            validCoords.push(coords); 
          }
        }

        // Geocode Destination
        let destCoord = null;
        if (trackingData.toAddress) {
          destCoord = await geocodeLocation(trackingData.toAddress);
          if (destCoord) {
            setToCoord(destCoord);
            validCoords.push(destCoord);
          }
        }

        setData({ ...trackingData, checkpoints: mappedCheckpoints }); // Timeline should show oldest to newest? No, timeline usually newest first
        setCoordinates(validCoords);
        toast.success(`${translations.en.successFound} ${trackingId}`);
      }
    } catch (error: any) {
      toast.error(error.message || translations.en.errNotFound);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (message: string, isLatest: boolean) => {
    if (isLatest && (message.toLowerCase().includes('deliver') || data?.status === 'Delivered')) {
       return <CheckCircle className="h-5 w-5 text-green-500 bg-background" />;
    }
    if (message.toLowerCase().includes('transit') || message.toLowerCase().includes('out')) {
      return <Truck className="h-5 w-5 text-primary bg-background" />;
    }
    return <Package className="h-5 w-5 text-primary bg-background" />;
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] pointer-events-none z-0"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-6 md:py-16 max-w-6xl flex-1">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <Button variant="ghost" className="-ml-4 hover:bg-primary/5 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            <BilingualInline en={translations.en.backToHome} ta={translations.ta.backToHome} />
          </Button>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start justify-between mb-10 gap-4"
        >
          <div>
            <h1 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight break-words">
              <BilingualText en={translations.en.title} ta={translations.ta.title} />
            </h1>
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mt-4 leading-relaxed">
              <BilingualText en={translations.en.subtitle} ta={translations.ta.subtitle} />
            </p>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="p-3 mb-8 md:mb-10 rounded-2xl md:rounded-3xl shadow-lg border-primary/10 bg-card/80 backdrop-blur-md">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto w-full">
              <div className="relative flex-1 w-full bg-secondary/40 rounded-xl md:rounded-2xl border border-transparent focus-within:border-primary/30 transition-colors">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-muted-foreground/70" />
                <Input
                  type="text"
                  placeholder={`${translations.en.placeholder} / ${translations.ta.placeholder}`}
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  className="pl-12 h-14 md:h-16 text-base md:text-xl rounded-xl md:rounded-2xl bg-transparent border-0 focus-visible:ring-0 shadow-none font-medium text-foreground placeholder:text-muted-foreground/50 text-ellipsis"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 md:h-16 px-6 md:px-10 rounded-xl md:rounded-2xl w-full sm:w-auto min-w-[140px] md:min-w-[160px] font-bold text-base md:text-lg shadow-md hover:shadow-lg transition-all" disabled={loading}>
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                 <div className="flex items-center gap-2">
                   <Search className="h-5 w-5" />
                   <BilingualText en={translations.en.trackButton} ta={translations.ta.trackButton} className="text-left" />
                 </div>
                }
              </Button>
            </form>
          </Card>
        </motion.div>

        {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <BilingualText en={translations.en.loading} ta={translations.ta.loading} className="text-center" />
            </div>
        )}

        {!loading && data && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-6 lg:gap-10"
          >
            {/* Left Column: Timeline & Order Details */}
            <div className="space-y-6">
              
              {/* Order Details Pane */}
              {(data.orderId || data.fromAddress) && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card w-full p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-border/50"
                >
                  <div className="flex md:items-center flex-col md:flex-row justify-between border-b pb-5 mb-5 gap-3">
                    <h2 className="text-xl font-bold font-serif">
                      <BilingualInline en={translations.en.orderDetails} ta={translations.ta.orderDetails} />
                    </h2>
                    <span className="flex items-center text-xs font-bold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border w-fit">
                      <FileText className="h-3 w-3 mr-1" /> {data.orderId || trackingId}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {data.fromAddress && (
                      <div className="flex gap-3">
                        <div className="mt-0.5 bg-primary/10 p-2 rounded-lg h-fit">
                           <Truck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1"><BilingualInline en={translations.en.fromLabel} ta={translations.ta.fromLabel} /></p>
                          <p className="font-medium text-sm text-foreground leading-relaxed">{data.fromAddress}</p>
                        </div>
                      </div>
                    )}
                    
                    {data.toAddress && (
                      <div className="flex gap-3">
                        <div className="mt-0.5 bg-green-500/10 p-2 rounded-lg h-fit">
                           <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1"><BilingualInline en={translations.en.toLabel} ta={translations.ta.toLabel} /></p>
                          <p className="font-medium text-sm text-foreground leading-relaxed">{data.toAddress}</p>
                        </div>
                      </div>
                    )}

                    {data.contactNumber && (
                      <div className="flex gap-3">
                        <div className="mt-0.5 bg-blue-500/10 p-2 rounded-lg h-fit">
                           <Phone className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1"><BilingualInline en={translations.en.contactNav} ta={translations.ta.contactNav} /></p>
                          <p className="font-medium text-sm text-foreground leading-relaxed">{data.contactNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Timeline Pane */}
              <div className="bg-card p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-border/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-5 gap-3">
                  <h2 className="text-lg md:text-2xl font-bold font-serif break-words">
                    <BilingualInline en={translations.en.journeyDetails} ta={translations.ta.journeyDetails} />
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs md:text-sm border border-primary/20 shadow-sm w-fit self-start md:self-auto">
                    {data.status}
                  </span>
                </div>
                
                <div className="relative border-l-2 border-primary/30 ml-2 md:ml-4 pl-6 md:pl-8 space-y-8 py-2">
                  <AnimatePresence>
                    {data.checkpoints.map((cp, idx) => {
                      const isLatest = idx === 0;
                      return (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx} 
                            className="relative group"
                        >
                          <div className="absolute -left-[35px] md:-left-[43px] top-0 p-1 md:p-1.5 bg-background rounded-full border-2 border-background shadow-md ring-1 ring-border/50 z-10 group-hover:scale-110 transition-transform">
                            {getStatusIcon(cp.message, isLatest)}
                          </div>
                          <div className={`p-4 md:p-5 rounded-xl md:rounded-2xl border ${isLatest ? 'bg-primary/5 border-primary/30 shadow-md ring-1 ring-primary/10' : 'bg-secondary/10 border-border/30'} hover:border-primary/50 transition-all duration-300`}>
                            <h4 className={`text-base md:text-lg font-bold break-words ${isLatest ? 'text-primary' : 'text-foreground'}`}>{cp.message}</h4>
                            <div className="flex items-center text-muted-foreground text-xs md:text-sm mt-3 gap-2 bg-background/50 w-fit px-2 md:px-3 py-1.5 rounded-lg border shadow-sm max-w-full">
                              <MapPin className="h-3 w-3 md:h-4 md:w-4 shrink-0 text-primary" />
                              <span className="font-medium text-foreground truncate">{cp.location}</span>
                            </div>
                            <div className="text-xs text-muted-foreground/70 mt-3 font-medium tracking-wide uppercase">
                              {new Date(cp.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Map Pane */}
            <div className="bg-card rounded-2xl md:rounded-3xl overflow-hidden shadow-xl ring-1 ring-border/50 flex flex-col h-[400px] sm:h-[500px] lg:h-auto min-h-[350px] lg:min-h-[550px]">
                <div className="p-3 md:p-5 border-b bg-secondary/30 flex flex-col md:flex-row items-start md:items-center justify-between z-10 relative shadow-sm gap-2">
                    <h3 className="font-bold flex items-center gap-2 md:gap-3 text-base md:text-xl font-serif break-words">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <MapPin className="h-5 w-5 text-primary"/>
                        </div>
                        <BilingualInline en={translations.en.liveTrackingMap} ta={translations.ta.liveTrackingMap} />
                    </h3>
                    <span className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1 w-fit">
                      <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                      <BilingualInline en={translations.en.activeMode} ta={translations.ta.activeMode} />
                  </span>
                </div>
                <div className="flex-1 relative z-0">
                    {coordinates.length > 0 ? (
                        <MapContainer 
                            center={[11.2189, 78.1674]} 
                            zoom={7} 
                            minZoom={6}
                            maxZoom={12}
                            maxBounds={TN_BOUNDS}
                            maxBoundsViscosity={1.0}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                            className="bg-transparent"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            <MapBounds coordinates={coordinates} />
                            <Polyline 
                                positions={coordinates} 
                                color="hsl(var(--primary))" 
                                weight={3} 
                                opacity={0.7} 
                                dashArray="10, 10" 
                            />
                            {fromCoord && (
                                <Marker position={fromCoord} icon={StartIcon}>
                                    <Popup>
                                        <div className="font-sans">
                                            <p className="font-bold text-green-600">Source: {data.fromAddress}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                            
                            {toCoord && (
                                <Marker position={toCoord} icon={EndIcon}>
                                    <Popup>
                                        <div className="font-sans">
                                            <p className="font-bold text-blue-600">Destination: {data.toAddress}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {data.checkpoints
                                .map((cp, idx) => ({ ...cp, originalIdx: idx }))
                                .filter(cp => cp.lat && cp.lng)
                                .map((cp) => (
                                    <Marker 
                                        key={`marker-${cp.originalIdx}`} 
                                        position={[cp.lat!, cp.lng!]}
                                        icon={cp.originalIdx === 0 ? LatestIcon : L.Icon.Default.prototype as any}
                                    >
                                        <Popup>
                                            <div className="font-sans">
                                                <p className="font-bold whitespace-nowrap">{cp.message}</p>
                                                <p className="text-xs text-muted-foreground">{cp.location}</p>
                                                <p className="text-xs text-muted-foreground/80 mt-1">{new Date(cp.date).toLocaleDateString()}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))
                            }
                        </MapContainer>
                    ) : (
                        <div className="h-full w-full bg-secondary/10 flex flex-col items-center justify-center text-muted-foreground p-8 text-center border-l border-primary/10">
                            <div className="bg-white p-6 rounded-full shadow-sm mb-6 border">
                                <MapPin className="h-16 w-16 text-primary/40 animate-pulse" />
                            </div>
                            <p className="text-xl font-serif text-foreground mb-2 flex flex-col gap-1">
                                <BilingualText en={translations.en.mapFeedUnavailable} ta={translations.ta.mapFeedUnavailable} />
                            </p>
                            <p className="max-w-xs text-sm mt-3">
                                <BilingualText en={translations.en.mapFeedError} ta={translations.ta.mapFeedError} />
                            </p>
                        </div>
                    )}
                </div>
            </div>
          </motion.div>
        )}
      </div>
      </div>
    </div>
  );
};

export default TrackOrder;
