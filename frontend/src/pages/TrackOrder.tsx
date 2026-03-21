import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Truck, MapPin, CheckCircle, ArrowLeft, Loader2, User, Phone, FileText, ChevronRight, Navigation, Globe, Compass } from 'lucide-react';
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

// Custom Icons
const LatestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.2/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const StartIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.2/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const EndIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.2/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map Auto Zoom Component
const MapBounds = ({ coordinates }: { coordinates: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [coordinates, map]);
  return null;
};

// Translations Dictionary
type Language = 'en' | 'ta';

const translations = {
  en: {
    backToHome: "Back to Home",
    title: "Track Your Order",
    subtitle: "Enter your tracking ID to see the detailed journey of your package.",
    placeholder: "Enter Tracking ID (e.g. TEST1234)",
    trackButton: "Track Details",
    loading: "Retrieving package journey...",
    journeyDetails: "Journey Details",
    liveTrackingMap: "Live Navigation",
    activeMode: "Live",
    mapFeedUnavailable: "Map Feed Unavailable",
    mapFeedError: "Geospatial data for this journey could not be pinpointed accurately.",
    orderDetails: "Shipment Info",
    orderIdBtn: "Order ID",
    fromLabel: "Sender",
    toLabel: "Recipient",
    contactNav: "Contact Details",
    errEnterId: "Please enter a tracking ID",
    errNotFound: "Tracking details not found or provider required Captcha",
    successFound: "Tracking details secured for",
  },
  ta: {
    backToHome: "முகப்புக்குத் திரும்பு",
    title: "உங்கள் ஆர்டரை கண்காணிக்கவும்",
    subtitle: "உங்கள் பார்சலின் விரிவான பயணத்தைக் காண உங்கள் கண்காணிப்பு ஐடியை உள்ளிடவும்.",
    placeholder: "கண்காணிப்பு ஐடியை உள்ளிடவும்",
    trackButton: "கண்காணிக்க",
    loading: "பார்சல் பயணத்தை பெறுகிறது...",
    journeyDetails: "பயண விவரங்கள்",
    liveTrackingMap: "நேரடி வரைபடம்",
    activeMode: "நேரலை",
    mapFeedUnavailable: "வரைபடம் இல்லை",
    mapFeedError: "இருப்பிடத் தரவை காண்டறிய முடியவில்லை.",
    orderDetails: "கப்பல் தகவல்",
    orderIdBtn: "ஆர்டர் ஐடி",
    fromLabel: "அனுப்புனர்",
    toLabel: "பெறுநர்",
    contactNav: "தொடர்புக்கு",
    errEnterId: "கண்காணிப்பு ஐடியை உள்ளிடவும்",
    errNotFound: "கண்காணிப்பு விவரங்கள் காணவில்லை",
    successFound: "விவரங்கள் கிடைத்தன",
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

  // Helper bindings
  const BilingualText = ({ en, ta, className = '' }: { en: string, ta: string, className?: string }) => (
    <span className={`block ${className}`}>
      <span>{en}</span>
      <span className="block text-[0.85em] opacity-80 font-normal mt-0.5 tracking-wide">{ta}</span>
    </span>
  );

  const BilingualInline = ({ en, ta }: { en: string, ta: string }) => (
    <span>{en} <span className="text-[0.8em] opacity-70 ml-1">/ {ta}</span></span>
  );

  // Geocoding logic
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
        if (trackingData.fromAddress) {
          const sourceCoord = await geocodeLocation(trackingData.fromAddress);
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
        if (trackingData.toAddress) {
          const destCoord = await geocodeLocation(trackingData.toAddress);
          if (destCoord) {
            setToCoord(destCoord);
            validCoords.push(destCoord);
          }
        }

        setData({ ...trackingData, checkpoints: mappedCheckpoints });
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
    const isSuccess = isLatest && (message.toLowerCase().includes('deliver') || data?.status === 'Delivered');
    if (isSuccess) return <CheckCircle className="h-5 w-5 text-white" />;
    
    if (message.toLowerCase().includes('transit') || message.toLowerCase().includes('out')) {
      return <Truck className="h-5 w-5 text-white" />;
    }
    return <Package className="h-5 w-5 text-white" />;
  };

  const getStatusColor = (message: string, isLatest: boolean) => {
    const isSuccess = isLatest && (message.toLowerCase().includes('deliver') || data?.status === 'Delivered');
    if (isSuccess) return "bg-green-500 shadow-green-500/40";
    if (isLatest) return "bg-primary shadow-primary/40";
    return "bg-secondary text-muted-foreground shadow-none border border-border";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background border-b z-10 pt-10 pb-8 md:pt-20 md:pb-16">
        {/* Background Accents */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 -right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container relative mx-auto px-4 max-w-5xl z-10 flex flex-col items-center">
          <Button variant="outline" size="sm" className="mb-8 self-start md:self-auto rounded-full backdrop-blur-md bg-background/50 border-primary/20 hover:bg-primary/10 transition-colors shadow-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            <BilingualInline en={translations.en.backToHome} ta={translations.ta.backToHome} />
          </Button>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center justify-center p-2 sm:p-3 bg-primary/10 rounded-xl mb-3 sm:mb-4 shadow-inner ring-1 ring-primary/20">
              <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-foreground drop-shadow-sm mb-2 sm:mb-4">
              Track Your <span className="text-primary bg-clip-text">Order</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground/90 tamil-text mt-1 max-w-xl mx-auto leading-relaxed px-2">
              உங்கள் பார்சலின் விரிவான பயணத்தைக் காண உங்கள் கண்காணிப்பு ஐடியை உள்ளிடவும்.
            </p>

            {/* Tracking Search Form */}
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
               className="mt-6 sm:mt-8"
            >
              <Card className="p-2 sm:p-3 md:p-4 rounded-2xl shadow-xl border border-primary/20 bg-card/80 backdrop-blur-xl ring-2 ring-primary/5 w-full mx-auto">
                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full relative">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary/60 transition-colors group-focus-within:text-primary z-10" />
                    <Input
                      type="text"
                      placeholder="Enter Tracking ID (e.g. THD1234)"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                      className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base md:text-lg rounded-xl bg-secondary/30 border border-border/50 focus:border-primary/50 focus-visible:ring-0 shadow-inner font-bold text-foreground placeholder:font-medium placeholder:text-muted-foreground/40 uppercase tracking-wider transition-all relative z-10"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-10 sm:h-12 px-5 sm:px-6 rounded-xl w-full sm:w-auto text-sm sm:text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                     <span className="flex items-center gap-1.5">
                       {translations.en.trackButton} <ChevronRight className="h-4 w-4" />
                     </span>
                    }
                  </Button>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8 md:py-16">
        {loading && (
            <div className="py-24 flex flex-col items-center justify-center text-muted-foreground animate-fade-in">
                <div className="relative">
                   <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                   <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10 mb-6" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-2">Getting updates...</h3>
                <p className="text-sm sm:text-base opacity-80 tamil-text text-center px-4">தகவல்களை பெற்றுவருகிறோம், காத்திருக்கவும்.</p>
            </div>
        )}

        {!loading && data && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid lg:grid-cols-12 gap-6 lg:gap-10"
          >
            {/* Left Column: Shipment Details & Timeline */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6 lg:space-y-8">
              
              {/* Order Info Summary Tag */}
              <div className="flex flex-wrap items-center gap-3 bg-secondary/50 p-2 pl-4 rounded-2xl border w-fit mx-auto lg:mx-0">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                     <FileText className="h-4 w-4" /> STATUS
                  </span>
                  <span className="bg-primary text-primary-foreground font-bold px-4 py-1.5 rounded-xl text-sm shadow-sm">
                      {data.status}
                  </span>
              </div>

              {/* Sender / Receiver Details Card */}
              {(data.fromAddress || data.toAddress) && (
                <Card className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-card/60 backdrop-blur-md shadow-card border border-border/60 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[80px] z-0 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                  
                  <h3 className="text-base sm:text-lg font-bold font-serif mb-4 relative z-10 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" /> {translations.en.orderDetails}
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    {data.fromAddress && (
                      <div className="flex gap-3 p-2 sm:p-3 rounded-xl bg-background shadow-sm border border-border/50">
                        <div className="bg-primary/10 p-2 sm:p-2.5 rounded-lg h-fit shrink-0">
                           <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">From / இருந்து</p>
                          <p className="font-medium text-xs sm:text-sm text-foreground leading-relaxed">{data.fromAddress}</p>
                        </div>
                      </div>
                    )}
                    
                    {data.toAddress && (
                      <div className="flex gap-3 p-2 sm:p-3 rounded-xl bg-background shadow-sm border border-border/50">
                        <div className="bg-green-500/10 p-2 sm:p-2.5 rounded-lg h-fit shrink-0">
                           <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground/80 uppercase tracking-wider mb-0.5">To / பெறுநர்</p>
                          <p className="font-medium text-xs sm:text-sm text-foreground leading-relaxed">{data.toAddress}</p>
                        </div>
                      </div>
                    )}

                    {data.contactNumber && (
                      <div className="flex gap-4 items-center">
                        <div className="bg-secondary p-2.5 sm:p-3 rounded-xl h-fit shrink-0 text-muted-foreground">
                           <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base text-foreground">{data.contactNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Sleek Vertical Timeline Card */}
              <Card className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-card/60 backdrop-blur-md shadow-card border border-border/60 hover:shadow-xl transition-all duration-300">
                <h3 className="text-base sm:text-lg font-bold font-serif mb-4 lg:mb-6 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> {translations.en.journeyDetails}
                </h3>
                
                <div className="relative isolate px-1 sm:px-2">
                  {/* Background vertical connecting line */}
                  <div className="absolute left-[16px] sm:left-[20px] top-5 bottom-5 w-0.5 bg-border -z-10 rounded-full"></div>
                  
                  {/* Glowing active line segment */}
                  <div className="absolute left-[16px] sm:left-[20px] top-5 h-1/3 w-0.5 bg-gradient-to-b from-primary to-transparent -z-10 rounded-full"></div>

                  <div className="space-y-4 sm:space-y-6">
                    <AnimatePresence>
                      {data.checkpoints.map((cp, idx) => {
                        const isLatest = idx === 0;
                        const bgColor = getStatusColor(cp.message, isLatest);
                        
                        return (
                          <motion.div 
                              initial={{ opacity: 0, x: -10, y: 10 }}
                              animate={{ opacity: 1, x: 0, y: 0 }}
                              transition={{ delay: idx * 0.15, type: "spring", bounce: 0.4 }}
                              key={idx} 
                              className="relative flex gap-4 sm:gap-6 group"
                          >
                            {/* Stepper Node */}
                            <div className="flex flex-col items-center shrink-0 w-8 sm:w-10 mt-0.5">
                               <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110 z-10 border-2 ${isLatest ? 'border-primary/20 bg-primary/10 backdrop-blur-md' : 'border-border bg-card'}`}>
                                  {/* Inner glowing dot or icon */}
                                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-md ${bgColor}`}>
                                     {isLatest ? getStatusIcon(cp.message, isLatest) : <span className="h-2 w-2 rounded-full bg-border" />}
                                  </div>
                               </div>
                            </div>

                            {/* Content */}
                            <div className={`flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 ${isLatest ? 'bg-primary/5 border-primary/30 shadow-md ring-1 ring-primary/10' : 'bg-secondary/20 border-border/50 hover:bg-secondary/40'} relative`}>
                              {/* Tail pointer */}
                              <div className={`absolute top-4 -left-1.5 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 rotate-45 border-l border-b ${isLatest ? 'bg-primary/5 border-primary/30' : 'bg-secondary/20 border-border/50'}`}></div>
                              
                              <h4 className={`text-sm sm:text-base font-bold break-words leading-tight ${isLatest ? 'text-primary' : 'text-foreground'}`}>
                                {cp.message}
                              </h4>
                              
                              <div className="flex items-start sm:items-center text-muted-foreground text-[10px] sm:text-xs mt-2 gap-1.5 bg-background/80 backdrop-blur-sm w-fit px-2 py-1.5 rounded-lg border border-border/50 shadow-sm">
                                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 text-primary mt-0.5 sm:mt-0" />
                                <span className="font-medium text-foreground">{cp.location}</span>
                              </div>
                              
                              <div className="text-[10px] sm:text-xs text-muted-foreground/60 mt-4 sm:mt-5 font-bold tracking-widest uppercase flex items-center gap-1.5">
                                <div className="h-px flex-1 bg-border/50"></div>
                                {new Date(cp.date).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Stunning Embedded Map */}
            <div className="lg:col-span-12 xl:col-span-7 h-[350px] sm:h-[450px] xl:h-[auto] min-h-[400px]">
                <Card className="h-full w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50 flex flex-col relative group">
                  
                  {/* Floating Map Header */}
                  <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-start pointer-events-none">
                     <div className="bg-background/80 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl border border-white/10 ring-1 ring-black/5 pointer-events-auto flex items-center gap-3">
                         <div className="bg-primary p-2 sm:p-2.5 rounded-xl shadow-inner">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-bounce-slight" />
                         </div>
                         <div>
                            <h3 className="font-bold font-serif text-sm sm:text-base">Live Route</h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-wide">Interactive Tracking</p>
                         </div>
                     </div>
                     <span className="bg-green-500/90 backdrop-blur-md text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold shadow-lg border border-green-400/50 flex items-center gap-2 text-xs sm:text-sm">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> LIVE
                     </span>
                  </div>

                  <div className="flex-1 w-full bg-secondary/5 z-0">
                      {coordinates.length > 0 ? (
                          <MapContainer 
                              center={[11.2189, 78.1674]} 
                              zoom={7} 
                              minZoom={6}
                              maxZoom={12}
                              maxBounds={TN_BOUNDS}
                              maxBoundsViscosity={1.0}
                              style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
                              scrollWheelZoom={true}
                              className="z-0"
                          >
                              {/* Dark or beautiful light map tiles */}
                              <TileLayer
                                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                              />
                              <MapBounds coordinates={coordinates} />
                              
                              {/* Sleek Polyline */}
                              <Polyline 
                                  positions={coordinates} 
                                  color="hsl(var(--primary))" 
                                  weight={4} 
                                  opacity={0.8}
                                  lineJoin="round"
                                  lineCap="round"
                              />
                              
                              {fromCoord && (
                                  <Marker position={fromCoord} icon={StartIcon}>
                                      <Popup className="rounded-xl font-sans border-0 shadow-lg">
                                          <div className="p-1">
                                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Source</p>
                                              <p className="font-semibold text-foreground text-sm leading-tight">{data.fromAddress}</p>
                                          </div>
                                      </Popup>
                                  </Marker>
                              )}
                              
                              {toCoord && (
                                  <Marker position={toCoord} icon={EndIcon}>
                                      <Popup className="rounded-xl font-sans border-0 shadow-lg">
                                          <div className="p-1">
                                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Destination</p>
                                              <p className="font-semibold text-foreground text-sm leading-tight">{data.toAddress}</p>
                                          </div>
                                      </Popup>
                                  </Marker>
                              )}

                              {data.checkpoints
                                  .map((cp, idx) => ({ ...cp, originalIdx: idx }))
                                  .filter(cp => cp.lat && cp.lng && cp.originalIdx > 0)
                                  .map((cp) => (
                                      <Marker 
                                          key={`marker-${cp.originalIdx}`} 
                                          position={[cp.lat!, cp.lng!]}
                                      >
                                          <Popup className="rounded-xl font-sans border-0 shadow-lg">
                                              <div className="p-1 max-w-[200px]">
                                                  <p className="font-bold text-primary mb-1 leading-tight">{cp.message}</p>
                                                  <p className="text-xs text-muted-foreground leading-snug">{cp.location}</p>
                                                  <p className="text-[10px] text-muted-foreground/70 tracking-widest uppercase mt-2 font-bold">{new Date(cp.date).toLocaleDateString()}</p>
                                              </div>
                                          </Popup>
                                      </Marker>
                                  ))
                              }

                              {/* Latest Checkpoint Marker */}
                              {data.checkpoints[0]?.lat && data.checkpoints[0]?.lng && (
                                  <Marker 
                                      position={[data.checkpoints[0].lat, data.checkpoints[0].lng]}
                                      icon={LatestIcon}
                                      zIndexOffset={1000}
                                  >
                                      <Popup className="rounded-xl font-sans border-0 shadow-lg">
                                          <div className="p-1 max-w-[200px]">
                                              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-1.5 inline-block">Latest Event</span>
                                              <p className="font-bold text-foreground mb-1 leading-tight">{data.checkpoints[0].message}</p>
                                              <p className="text-xs text-muted-foreground leading-snug">{data.checkpoints[0].location}</p>
                                          </div>
                                      </Popup>
                                  </Marker>
                              )}
                          </MapContainer>
                      ) : (
                          <div className="h-full w-full bg-secondary/10 flex flex-col items-center justify-center text-muted-foreground p-8 text-center border-l border-primary/10 backdrop-blur-sm relative z-10">
                              <div className="bg-background p-6 lg:p-8 rounded-full shadow-lg border border-border/50 mb-6 relative hover:scale-105 transition-transform duration-500">
                                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                                  <Compass className="h-16 w-16 lg:h-20 lg:w-20 text-primary/60 relative z-10 animate-pulse" />
                              </div>
                              <h3 className="text-2xl lg:text-3xl font-serif text-foreground font-bold mb-3 tracking-tight">
                                <BilingualInline en={translations.en.mapFeedUnavailable} ta={translations.ta.mapFeedUnavailable} />
                              </h3>
                              <p className="max-w-sm text-sm lg:text-base opacity-80 leading-relaxed px-4">
                                <BilingualText en={translations.en.mapFeedError} ta={translations.ta.mapFeedError} />
                              </p>
                          </div>
                      )}
                  </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
