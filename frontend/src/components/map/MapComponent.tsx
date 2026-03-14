"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet Icon in React
const fixLeafletIcon = () => {
    try {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    } catch (e) {
        console.error("Leaflet icon fix failed", e);
    }
};

interface MapProps {
    latitude: number;
    longitude: number;
    radius: number;
    isEditing: boolean;
    onLocationChange: (lat: number, lng: number) => void;
}

const MapController = ({ center, isEditing, onLocationChange }: { center: [number, number], isEditing: boolean, onLocationChange: (lat: number, lng: number) => void }) => {
    const map = useMap();

    useEffect(() => {
        map.setView(center);
        // Force resize to ensure tiles load correctly
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [center, map]);

    useMapEvents({
        click(e) {
            if (isEditing) {
                onLocationChange(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    return null;
};

const MapComponent = ({ latitude, longitude, radius, isEditing, onLocationChange }: MapProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        fixLeafletIcon();
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold min-h-[400px]">
                Initializing Map...
            </div>
        );
    }

    const lat = latitude || -6.175392;
    const lng = longitude || 106.827153;

    return (
        <div className="absolute inset-0 w-full h-full z-0">
            <MapContainer 
                center={[lat, lng]} 
                zoom={16} 
                scrollWheelZoom={true} 
                dragging={true}
                className="w-full h-full outline-none"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapController center={[lat, lng]} isEditing={isEditing} onLocationChange={onLocationChange} />
                
                <Marker position={[lat, lng]} />
                
                <Circle 
                    center={[lat, lng]} 
                    radius={radius || 500} 
                    pathOptions={{ color: '#2D6A4F', fillColor: '#2D6A4F', fillOpacity: 0.2 }} 
                />
            </MapContainer>
        </div>
    );
};

export default MapComponent;