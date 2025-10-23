import React, { useState } from 'react';
import axios from 'axios'; // 👈 1. Import axios
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext'; // 👈 2. Import useAuth
import { MapPin, PlusCircle, X, Compass, ClipboardPaste } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import AddressMapSelector from './AddressMapSelector';

const AddressModal = ({ onClose }) => {
    const { savedAddresses, saveShippingAddress, addAddress } = useCart();
    const { token } = useAuth(); // 👈 3. Get token from auth context

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newAddress, setNewAddress] = useState({ address: '', city: '', postalCode: '', country: '' });
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isLoadingPasted, setIsLoadingPasted] = useState(false);

    const handleSelectAddress = (address) => {
        saveShippingAddress(address);
        onClose();
    };

    const handleAddNewAddress = (e) => {
        e.preventDefault();
        const addressExists = savedAddresses.some(addr => 
            addr.address === newAddress.address && addr.city === newAddress.city
        );

        if (!addressExists) {
            addAddress(newAddress);
        }
        
        saveShippingAddress(newAddress);
        onClose();
    };

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        setIsMapOpen(true);
    };

    const handleAddressFromMap = (addressFromMap) => {
        setNewAddress(addressFromMap);
        setIsMapOpen(false);
        setIsAddingNew(true);
    };

    // ✅ 4. This is the fully updated function
    const handlePasteLocation = async () => {
        const pastedText = prompt("Please paste the shared location (Coordinates like '9.1, 77.8' or a Google Maps URL):");
        if (!pastedText) return;

        setIsLoadingPasted(true);
        try {
            let fetchedAddress;

            const parts = pastedText.split(',').map(part => part.trim());
            const isCoords = parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]));

            if (isCoords) {
                // --- Handle Coordinates using OpenStreetMap ---
                const lat = parseFloat(parts[0]);
                const lon = parseFloat(parts[1]);
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await response.json();

                if (data && data.address) {
                    const addr = data.address;
                    const addressLine = [addr.house_number, addr.road, addr.neighbourhood, addr.suburb, addr.village].filter(Boolean).join(', ');
                    const cityName = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
                    fetchedAddress = {
                        address: addressLine || data.display_name.split(',')[0] || '',
                        city: cityName,
                        postalCode: addr.postcode || '',
                        country: addr.country || '',
                    };
                } else {
                    throw new Error("Address not found for these coordinates via OpenStreetMap.");
                }
            } else if (pastedText.toLowerCase().includes('google.com/maps')) {
                // --- Handle Google Maps URL by calling our backend ---
                if (!token) throw new Error("You must be logged in to use this feature.");

                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.post('/api/location/lookup-url', { url: pastedText }, config); 
                fetchedAddress = data;
            } else {
                throw new Error("Invalid format. Please paste coordinates (lat, lon) or a Google Maps URL.");
            }

            // --- Process the fetched address ---
            if (fetchedAddress && fetchedAddress.address && fetchedAddress.city && fetchedAddress.country) {
                setNewAddress(fetchedAddress);
                setIsAddingNew(true);
            } else {
                throw new Error("Could not determine a complete address from the provided location.");
            }

        } catch (error) {
            console.error("Failed to fetch address from pasted location.", error);
            alert(error.response?.data?.message || error.message || "Could not fetch address details.");
        } finally {
            setIsLoadingPasted(false);
        }
    };

    if (isMapOpen) {
        return <AddressMapSelector onAddressSelect={handleAddressFromMap} onClose={() => setIsMapOpen(false)} />;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Select a Shipping Address</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {savedAddresses.map((addr, index) => (
                        <div key={index} onClick={() => handleSelectAddress(addr)} className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <p className="font-semibold">{addr.address}</p>
                            <p className="text-sm text-gray-600">{`${addr.city}, ${addr.postalCode || ''}, ${addr.country}`}</p>
                        </div>
                    ))}
                     {savedAddresses.length === 0 && !isAddingNew && (
                        <p className="text-center text-gray-500 py-4">No saved addresses found.</p>
                    )}
                </div>

                <div className="border-t mt-4 pt-4">
                    {isAddingNew ? (
                         <form onSubmit={handleAddNewAddress}>
                            <h4 className="font-semibold mb-2">Add/Confirm Address</h4>
                            <div className="space-y-2">
                                <input type="text" placeholder="Address (Street, House No.)" value={newAddress.address} onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} className="w-full p-2 border rounded-md" required />
                                <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-2 border rounded-md" required />
                                <input type="text" placeholder="Postal Code (Optional)" value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full p-2 border rounded-md" />
                                <input type="text" placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} className="w-full p-2 border rounded-md" required />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="submit" className="w-full bg-primary text-white p-2 rounded-md font-semibold hover:bg-primary-dark">Save & Select Address</button>
                                <button type="button" onClick={() => { setIsAddingNew(false); setNewAddress({ address: '', city: '', postalCode: '', country: '' }); }} className="w-full bg-gray-200 p-2 rounded-md font-semibold hover:bg-gray-300">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            <button onClick={() => setIsAddingNew(true)} className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200">
                                <PlusCircle size={20} /> Add Manually
                            </button>
                            <button onClick={handleLocationClick} className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100">
                                <Compass size={20} /> Use Map Location
                            </button>
                            <button onClick={handlePasteLocation} disabled={isLoadingPasted} className="w-full flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 disabled:opacity-50">
                                {isLoadingPasted ? <LoadingSpinner size="small"/> : <ClipboardPaste size={20} />}
                                {isLoadingPasted ? 'Fetching...' : 'Use Shared Location'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddressModal;