import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { X } from 'lucide-react';

// Icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map logic
function MapController({ onAddressFound, setStatusMessage }) {
    const map = useMap();

    useEffect(() => {
        setStatusMessage('Getting your location...');
        map.locate().on('locationfound', function (e) {
            map.flyTo(e.latlng, 16);
            reverseGeocode(e.latlng);
        }).on('locationerror', function() {
            setStatusMessage('Could not find location. Move the map to select an address.');
            reverseGeocode(map.getCenter());
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, setStatusMessage]);

    // ✅ THIS IS THE FIX: Improved address parsing logic
    const reverseGeocode = useCallback(async (latlng) => {
        setStatusMessage('Fetching address...');
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                
                // Build the address string more robustly
                const addressLine = [
                    addr.house_number, 
                    addr.road, 
                    addr.neighbourhood, 
                    addr.suburb, 
                    addr.village // Add village as a possibility
                ].filter(Boolean).join(', '); // Filter out empty parts and join

                // Determine the city/town/village name
                const cityName = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';

                const fetchedAddress = {
                    address: addressLine || data.display_name.split(',')[0] || '', // Use first part of display_name as fallback street
                    city: cityName,
                    postalCode: addr.postcode || '',
                    country: addr.country || '',
                };

                // Check if essential parts are present (postal code is optional)
                if (fetchedAddress.address && fetchedAddress.city && fetchedAddress.country) {
                    setStatusMessage(data.display_name); // Show the full display name
                    onAddressFound(fetchedAddress); // Send complete address
                } else {
                    setStatusMessage("Incomplete address details. Try moving the pin slightly.");
                    onAddressFound(null); // Signal that the address is incomplete
                }
            } else {
                setStatusMessage("Address not found for this location.");
                onAddressFound(null);
            }
        } catch (error) {
            setStatusMessage("Could not fetch address. Check network connection.");
            onAddressFound(null);
        }
    }, [onAddressFound, setStatusMessage]); // useCallback dependencies

    useMapEvents({
        moveend() {
            reverseGeocode(map.getCenter());
        },
    });

    return null;
}


const AddressMapSelector = ({ onClose, onAddressSelect }) => {
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Move the map to select an address.');

    const handleConfirm = () => {
        if (selectedAddress) {
            onAddressSelect(selectedAddress);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-[100]">
            <div className="w-full h-full relative">
                 <button onClick={onClose} className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                    <X size={24} />
                </button>

                <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController onAddressFound={setSelectedAddress} setStatusMessage={setStatusMessage} />
                </MapContainer>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]">
                    <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" alt="marker" style={{ marginLeft: '-12px', marginTop: '-41px' }} />
                </div>
                
                 <div className="absolute bottom-0 left-0 w-full bg-white p-4 shadow-lg-top z-[1000] text-center">
                    <p className="font-semibold mb-2">Selected Address:</p>
                    <p className="text-sm text-gray-700 mb-4 h-10">{statusMessage}</p>
                    <button onClick={handleConfirm} disabled={!selectedAddress} className="w-full max-w-xs mx-auto px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Confirm This Address
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressMapSelector;