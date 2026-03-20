import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Truck, MapPin, CheckCircle, ArrowLeft, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '@/components/Header';
import { trackOrderAPI } from '@/services/api';
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

// Custom Icon for Latest Checkpoint
const LatestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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
}

const TrackOrder = () => {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackingData | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const navigate = useNavigate();

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
    if (!trackingId.trim()) return toast.error('Please enter a tracking ID');

    setLoading(true);
    setData(null);
    setCoordinates([]);
    
    try {
      const response = await trackOrderAPI(trackingId);
      if (response.success && response.data) {
        let trackingData = response.data;
        
        // Geocode each checkpoint
        const mappedCheckpoints = [...trackingData.checkpoints];
        const validCoords: [number, number][] = [];

        // Reverse to show newest first in timeline but map oldest -> newest
        for (let idx = 0; idx < mappedCheckpoints.length; idx++) {
          const cp = mappedCheckpoints[idx];
          const coords = await geocodeLocation(cp.location);
          if (coords) {
            mappedCheckpoints[idx].lat = coords[0];
            mappedCheckpoints[idx].lng = coords[1];
            validCoords.push(coords); // Add to coords array for polyline (oldest -> newest order)
          }
        }

        setData({ ...trackingData, checkpoints: mappedCheckpoints.reverse() });
        setCoordinates(validCoords);
        toast.success(`Tracking details found for ${trackingId}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Tracking ID not found');
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
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl flex-1">
        <Button variant="ghost" className="mb-6 -ml-4 hover:bg-primary/5 rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start justify-between mb-10 gap-4"
        >
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3 tracking-tight">Track Your Order / உங்கள் ஆர்டரை கண்காணிக்கவும்</h1>
            <p className="text-muted-foreground text-lg">Enter your tracking ID to see the detailed journey of your package. / உங்கள் பார்சலின் விரிவான பயணத்தைக் காண உங்கள் கண்காணிப்பு ஐடியை உள்ளிடவும்.</p>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="p-3 mb-10 rounded-3xl shadow-lg border-primary/10 bg-card/80 backdrop-blur-md">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto items-center">
              <div className="relative flex-1 w-full bg-secondary/40 rounded-2xl border border-transparent focus-within:border-primary/30 transition-colors">
                <Package className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/70" />
                <Input
                  type="text"
                  placeholder="Enter Tracking ID (e.g. TEST1234) / கண்காணிப்பு ஐடியை உள்ளிடவும்"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  className="pl-14 h-16 text-xl rounded-2xl bg-transparent border-0 focus-visible:ring-0 shadow-none font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              <Button type="submit" size="lg" className="h-16 px-10 rounded-2xl min-w-[160px] font-bold text-lg shadow-md hover:shadow-lg transition-all" disabled={loading}>
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Search className="mr-2 h-5 w-5" /> Track / கண்காணிக்க</>}
              </Button>
            </form>
          </Card>
        </motion.div>

        {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p>Retrieving package journey and geolocating data... / பார்சல் பயணம் மற்றும் இருப்பிடத் தரவைப் பெறுகிறது...</p>
            </div>
        )}

        {!loading && data && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-10"
          >
            {/* Timeline Pane */}
            <div className="space-y-6 bg-card p-6 md:p-8 rounded-3xl shadow-sm border border-border/50">
              <div className="flex items-center justify-between border-b pb-5 mb-6">
                <h2 className="text-2xl font-bold font-serif">Journey Details / பயண விவரங்கள்</h2>
                <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20 shadow-sm">
                  {data.status}
                </span>
              </div>
              
              <div className="relative border-l-2 border-primary/30 ml-4 pl-8 space-y-10 py-2">
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
                      <div className="absolute -left-[43px] top-0 p-1.5 bg-background rounded-full border-2 border-background shadow-md ring-1 ring-border/50 z-10 group-hover:scale-110 transition-transform">
                        {getStatusIcon(cp.message, isLatest)}
                      </div>
                      <div className={`p-5 rounded-2xl border ${isLatest ? 'bg-primary/5 border-primary/30 shadow-md ring-1 ring-primary/10' : 'bg-secondary/10 border-border/30'} hover:border-primary/50 transition-all duration-300`}>
                        <h4 className={`text-lg font-bold ${isLatest ? 'text-primary' : 'text-foreground'}`}>{cp.message}</h4>
                        <div className="flex items-center text-muted-foreground text-sm mt-3 gap-2 bg-background/50 w-fit px-3 py-1.5 rounded-lg border shadow-sm">
                          <MapPin className="h-4 w-4 shrink-0 text-primary" />
                          <span className="font-medium text-foreground">{cp.location}</span>
                        </div>
                        <div className="text-xs text-muted-foreground/70 mt-3 font-medium tracking-wide uppercase">
                          {new Date(cp.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Map Pane */}
            <div className="bg-card rounded-3xl overflow-hidden shadow-xl ring-1 ring-border/50 flex flex-col h-[650px] lg:h-auto min-h-[550px]">
                <div className="p-5 border-b bg-secondary/30 flex items-center justify-between z-10 relative shadow-sm">
                    <h3 className="font-bold flex items-center gap-3 text-xl font-serif">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <MapPin className="h-5 w-5 text-primary"/>
                        </div>
                        Live Tracking Map / நேரடி கண்காணிப்பு வரைபடம்
                    </h3>
                    <span className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                      Active Mode / செயலில் உள்ளது
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
                            <p className="text-xl font-serif text-foreground mb-2">Map Feed Unavailable</p>
                            <p className="max-w-xs text-sm">We couldn't accurately parse the geographic data for this tracking journey.</p>
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
