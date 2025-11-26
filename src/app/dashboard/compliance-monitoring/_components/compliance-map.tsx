'use client';
import 'leaflet/dist/leaflet.css';
import L, { DivIcon, Map } from 'leaflet';
import { useEffect, useRef } from 'react';
import type { Deployment } from '@/lib/definitions';

// Define a new type for deployments with compliance data
export type ComplianceDeployment = Deployment & {
  compliance: {
    status: 'Compliant' | 'Non-Compliant' | 'In-Progress';
    lastChecked: string;
    issues: number;
  }
};

const complianceStatusColors: Record<string, string> = {
  Compliant: '#4ade80', // green-400
  'Non-Compliant': '#f87171', // red-400
  'In-Progress': '#facc15', // yellow-400
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
  const color = complianceStatusColors[status] || '#9ca3af';
  return new DivIcon({
    html: `<span style="background-color: ${color}; width: 1.5rem; height: 1.5rem; display: block; border-radius: 9999px; border: 2px solid white; box-shadow: 0 0 0 2px ${color};"></span>`,
    className: 'bg-transparent',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export default function ComplianceMap({ deployments }: { deployments: ComplianceDeployment[] }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([20, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (map) {
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
                    <strong>Compliance Status:</strong> ${deployment.compliance.status} <br/>
                    <strong>Issues Found:</strong> ${deployment.compliance.issues} <br/>
                    <strong>Last Checked:</strong> ${deployment.compliance.lastChecked}
                `;
                
                const marker = L.marker(finalPosition, { icon: createMarkerIcon(deployment.compliance.status) })
                    .addTo(map)
                    .bindPopup(popupContent);
                
                markersRef.current.push(marker);
            });
        }
    }, [deployments]);

    return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} className="rounded-md" />;
}
