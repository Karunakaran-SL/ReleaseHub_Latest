
'use client';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import type { Deployment } from '@/lib/definitions';
import { memo } from 'react';

const statusColors: Record<string, string> = {
  PROVISIONING: '#facc15', // yellow-400
  ACTIVE: '#4ade80', // green-400
  FAILED: '#f87171', // red-400
  UPGRADING: '#60a5fa', // blue-400
  DECOMMISSIONED: '#9ca3af', // gray-400
};

const locationCoordinates: Record<string, [number, number]> = {
    'Germany': [51.1657, 10.4515],
    'United Kingdom': [55.3781, -3.4360],
    'France': [46.6033, 1.8883],
    'Netherlands': [52.1326, 5.2913],
    'United States': [37.0902, -95.7129],
    'Canada': [56.1304, -106.3468],
    'Brazil': [-14.2350, -51.9253],
    'Japan': [36.2048, 138.2529],
    'China': [35.8617, 104.1954],
    'India': [20.5937, 78.9629],
    'Singapore': [1.3521, 103.8198],
    'South Africa': [-30.5595, 22.9375],
    'Nigeria': [9.0820, 8.6753],
    'Kenya': [-0.0236, 37.9062],
    'Australia': [-25.2744, 133.7751],
    'New Zealand': [-40.9006, 174.8860],
};

const createMarkerIcon = (status: string) => {
  const color = statusColors[status] || '#9ca3af';
  return new DivIcon({
    html: `<span style="background-color: ${color}; width: 1.5rem; height: 1.5rem; display: block; border-radius: 9999px; border: 2px solid white; box-shadow: 0 0 0 2px ${color};"></span>`,
    className: 'bg-transparent',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const DeploymentMap = memo(function DeploymentMap({ deployments }: { deployments: Deployment[] }) {
    
    const markers = deployments.map(deployment => {
        const country = deployment.details.country;
        if (!country || !locationCoordinates[country]) {
            return null;
        }

        const position = locationCoordinates[country];
        const randomOffset: [number, number] = [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2];
        const finalPosition: [number, number] = [position[0] + randomOffset[0], position[1] + randomOffset[1]];
        
        return {
            id: deployment._id,
            position: finalPosition,
            icon: createMarkerIcon(deployment.status),
            popup: (
                <>
                    <strong>ID:</strong> {deployment.details.deploymentId} <br/>
                    <strong>Customer:</strong> {deployment.details.customer} <br/>
                    <strong>Country:</strong> {deployment.details.country} <br/>
                    <strong>Status:</strong> {deployment.status}
                </>
            )
        };
    }).filter(Boolean);

    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} className="rounded-md">
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {markers.map(marker => marker && (
                <Marker key={marker.id} position={marker.position} icon={marker.icon}>
                    <Popup>
                        {marker.popup}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
});

export default DeploymentMap;
