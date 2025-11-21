
'use client';
import 'leaflet/dist/leaflet.css';
import L, { DivIcon, Map } from 'leaflet';
import { useEffect, useRef } from 'react';
import type { Deployment } from '@/lib/definitions';
import { Cpu, MemoryStick, HardDrive } from 'lucide-react';

interface ResourceDeployment extends Deployment {
    resourceStatus: 'optimal' | 'over-allocated' | 'under-allocated' | 'unknown';
    resources: {
        cpu: { allocated: number, used: number };
        memory: { allocated: number, used: number };
        storage: { allocated: number, used: number };
    };
}

const statusColors: Record<string, string> = {
  optimal: '#4ade80', // green-400
  'over-allocated': '#f87171', // red-400
  'under-allocated': '#facc15', // yellow-400
  unknown: '#9ca3af', // gray-400
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

export default function ResourceMap({ deployments }: { deployments: ResourceDeployment[] }) {
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

                const { cpu, memory, storage } = deployment.resources;
                const cpuUsage = cpu.allocated > 0 ? (cpu.used / cpu.allocated * 100).toFixed(0) : 0;
                const memUsage = memory.allocated > 0 ? (memory.used / memory.allocated * 100).toFixed(0) : 0;
                const storageUsage = storage.allocated > 0 ? (storage.used / storage.allocated * 100).toFixed(0) : 0;
                
                const popupContent = `
                    <div style="font-family: sans-serif; font-size: 13px;">
                        <strong>ID:</strong> ${deployment.details.deploymentId} <br/>
                        <strong>Status:</strong> <span style="text-transform: capitalize; color: ${statusColors[deployment.resourceStatus]}">${deployment.resourceStatus.replace('-', ' ')}</span> <br/>
                        <hr style="margin: 4px 0;"/>
                        <div><strong>CPU:</strong> ${cpu.used}/${cpu.allocated} Cores (${cpuUsage}%)</div>
                        <div><strong>Mem:</strong> ${memory.used}/${memory.allocated} GB (${memUsage}%)</div>
                        <div><strong>Sto:</strong> ${storage.used}/${storage.allocated} GB (${storageUsage}%)</div>
                        <hr style="margin: 4px 0;"/>
                        <a href="/fleet-management/resource-management/details?deployment=${deployment._id}" style="color: #3b82f6; text-decoration: underline;">View Detailed View</a>
                    </div>
                `;
                
                const marker = L.marker(finalPosition, { icon: createMarkerIcon(deployment.resourceStatus) })
                    .addTo(map)
                    .bindPopup(popupContent);
                
                markersRef.current.push(marker);
            });
        }
    }, [deployments]);

    return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} className="rounded-md" />;
}
