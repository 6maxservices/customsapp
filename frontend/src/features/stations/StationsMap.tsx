import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React-Leaflet
// Use CDN to guarantee icons load without bundler issues
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


interface StationsMapProps {
    stations: any[];
}

function FitBounds({ stations }: { stations: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (stations.length > 0) {
            const bounds = L.latLngBounds(stations.map(s => [s.lat || 37.9838, s.lng || 23.7275]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [stations, map]);

    return null;
}

export default function StationsMap({ stations }: StationsMapProps) {
    // Filter out stations without coordinates
    const validStations = stations.filter(s => s.lat && s.lng);

    if (validStations.length === 0) {
        return (
            <div className="h-[500px] w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                No stations with coordinates to display.
            </div>
        );
    }

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-sm border border-gray-200 relative z-0">
            <MapContainer
                center={[37.9838, 23.7275]}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {validStations.map(station => {
                    const isCompliant = station.compliance?.status === 'COMPLIANT';
                    // Custom colored icons could be added here, using simple default for now

                    return (
                        <Marker
                            key={station.id}
                            position={[station.lat, station.lng]}
                        >
                            <Popup>
                                <div className="p-1">
                                    <strong className="block text-sm mb-1">{station.name}</strong>
                                    <div className="text-xs text-gray-500 mb-2">{station.address}</div>
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {isCompliant ? 'Compliant' : 'Non-Compliant'}
                                    </span>
                                    <div className="mt-2 text-xs">
                                        <a href={`/stations/${station.slug || station.id}`} className="text-blue-600 hover:underline">
                                            View Details
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
                <FitBounds stations={validStations} />
            </MapContainer>
        </div>
    );
}
