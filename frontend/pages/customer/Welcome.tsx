import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ArrowRight, UtensilsCrossed, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ApiService } from '../../services/api';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [locationStatus, setLocationStatus] = useState<string>("Checking restaurant requirements...");
  const [canProceed, setCanProceed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get Table ID from URL (e.g. /?table=10)
  const getTableId = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('table') || '01'; // Default if not found
  };

  const tableId = getTableId();

  useEffect(() => {
    // Persist Table ID for the session
    if (tableId) {
      localStorage.setItem('restaurant_table_id', tableId);
    }

    const validateLocation = async () => {
      setIsLoading(true);

      try {
        const config = await ApiService.getLocationConfig();

        // If Geofencing is disabled, allow entry immediately
        if (!config.isActive) {
          setLocationStatus("Location Check: Disabled (Open Access)");
          setCanProceed(true);
          setIsLoading(false);
          return;
        }

        // Geofencing Active: Request GPS
        if ("geolocation" in navigator) {
          setLocationStatus("Verifying your GPS location...");

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const distance = ApiService.calculateDistance(
                position.coords.latitude,
                position.coords.longitude,
                config.latitude,
                config.longitude
              );

              if (distance <= config.radiusMeters) {
                setLocationStatus(`Location Verified (${Math.round(distance)}m away)`);
                setCanProceed(true);
              } else {
                setLocationStatus(`You are too far from the restaurant (${Math.round(distance)}m). Max allowed: ${config.radiusMeters}m.`);
                setCanProceed(false);
              }
              setIsLoading(false);
            },
            (error) => {
              console.error("GPS Error", error);
              setLocationStatus("Location access denied. Please enable GPS to order.");
              setCanProceed(false); // Strict mode: Block if denied
              setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else {
          setLocationStatus("Your device does not support GPS.");
          setCanProceed(false);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("API Error", err);
        setLocationStatus("System Error: Could not verify settings.");
        setIsLoading(false);
      }
    };

    validateLocation();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-beige text-forest">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-forest/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-terracotta/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center max-w-md w-full"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-forest rounded-full shadow-lg shadow-forest/20">
            <UtensilsCrossed size={40} className="text-beige" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-forest">
          Selamat Datang
        </h1>
        <div className="mb-4">
          <span className="inline-block bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
            DEMO MODE
          </span>
        </div>
        <p className="text-lg md:text-xl text-charcoal/80 font-light mb-4 italic">
          "Silakan duduk nyaman, kami siap melayani Anda."
        </p>

        {/* Table Number Tag - Only appears after verification */}
        {canProceed && (
          <div className="mb-8 inline-block bg-white border-2 border-forest/20 rounded-xl px-8 py-3 shadow-sm transform -rotate-2 hover:rotate-0 transition-transform duration-300">
            <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Your Table</span>
            <span className="font-serif font-bold text-3xl text-forest">Table-{tableId}</span>
          </div>
        )}

        <div className={`bg-white/60 backdrop-blur-sm p-4 rounded-xl border mb-8 flex items-center justify-center gap-3 transition-colors ${!canProceed && !isLoading ? 'border-terracotta/30 bg-red-50/50' : 'border-stone-200'}`}>
          {isLoading ? (
            <Loader2 size={20} className="animate-spin text-forest" />
          ) : canProceed ? (
            <MapPin size={20} className="text-forest animate-bounce" />
          ) : (
            <AlertTriangle size={20} className="text-terracotta" />
          )}
          <span className={`text-sm font-medium tracking-wide ${!canProceed && !isLoading ? 'text-terracotta' : 'text-charcoal'}`}>{locationStatus}</span>
        </div>

        <button
          onClick={() => canProceed && navigate('/menu')}
          disabled={!canProceed}
          className={`
            group relative w-full py-4 rounded-xl font-serif text-lg font-bold tracking-wider transition-all duration-500
            ${canProceed
              ? 'bg-forest text-beige shadow-xl shadow-forest/30 hover:shadow-2xl hover:-translate-y-1'
              : 'bg-stone-300 text-stone-500 cursor-not-allowed'}
          `}
        >
          <span className="flex items-center justify-center gap-2">
            LIHAT MENU
            {canProceed && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />}
          </span>
        </button>


      </motion.div>


    </div>
  );
};

export default Welcome;