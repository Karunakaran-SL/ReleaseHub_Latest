'use client';
import 'leaflet/dist/leaflet.css';
import L, { DivIcon, Map } from 'leaflet';
import { useEffect, useRef } from 'react';
import type { Deployment } from '@/lib/definitions';

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

export default function DeploymentMap({ deployments }: { deployments: Deployment[] }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        // Initialize map only if the container is available and map instance doesn't exist
        if (mapContainerRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([20, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);
        }

        // Cleanup function to run when the component unmounts
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (map) {
            // Clear existing markers from the map and the ref array
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            deployments.forEach(deployment => {
                const country = deployment.details.country;
                if (!country || !locationCoordinates[country]) return;

                const position = locationCoordinates[country];
                const randomOffset: [number, number] = [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2];
                const finalPosition: [number, number] = [position[0] + randomOffset[0], position[1] + randomOffset[1]];

                const popupContent = `
                    <strong>ID:</strong> ${deployment.details.deploymentId} <br/>
                    <strong>Customer:</strong> ${deployment.details.customer} <br/>
                    <strong>Country:</strong> ${deployment.details.country} <br/>
                    <strong>Status:</strong> ${deployment.status} <br/>
                    <a href="/fleet-management/deployment/${deployment._id}/view" style="color: #3b82f6; text-decoration: underline;">View Details</a>
                `;
                
                const marker = L.marker(finalPosition, { icon: createMarkerIcon(deployment.status) })
                    .addTo(map)
                    .bindPopup(popupContent);
                
                markersRef.current.push(marker);
            });
        }
    }, [deployments]); // This effect re-runs whenever the deployments data changes

    return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} className="rounded-md" />;
}
