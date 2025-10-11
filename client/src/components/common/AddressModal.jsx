import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { MapPin, PlusCircle, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const AddressModal = ({ onClose }) => {
    const { savedAddresses, saveShippingAddress, addAddress } = useCart();
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newAddress, setNewAddress] = useState({ address: '', city: '', postalCode: '', country: '' });
    const [isLocating, setIsLocating] = useState(false);

    const handleSelectAddress = (address) => {
        saveShippingAddress(address);
        onClose();
    };

    const handleAddNewAddress = (e) => {
        e.preventDefault();
        // A simple check to prevent adding duplicate addresses
        const addressExists = savedAddresses.some(addr => 
            addr.address === newAddress.address && addr.city === newAddress.city
        );

        if (!addressExists) {
            addAddress(newAddress);
        }
        
        saveShippingAddress(newAddress); // Select the new address immediately
        onClose();
    };

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                if (data && data.address) {
                    const fetchedAddress = {
                        address: data.address.road || '',
                        city: data.address.city || data.address.town || data.address.state_district || '',
                        postalCode: data.address.postcode || '',
                        country: data.address.country || '',
                    };
                    setNewAddress(fetchedAddress); // Pre-fill the form
                    setIsAddingNew(true); // Show the form for confirmation/editing
                }
            } catch (error) {
                console.error("Failed to fetch address from location.", error);
                alert("Could not fetch address details. Please enter manually.");
            } finally {
                setIsLocating(false);
            }
        }, (error) => {
            setIsLocating(false);
            alert("Unable to retrieve your location. Please grant permission.");
        });
    };

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
                            <p className="text-sm text-gray-600">{`${addr.city}, ${addr.postalCode}, ${addr.country}`}</p>
                        </div>
                    ))}
                </div>

                <div className="border-t mt-4 pt-4">
                    {isAddingNew ? (
                        <form onSubmit={handleAddNewAddress}>
                            <h4 className="font-semibold mb-2">Add New Address</h4>
                            <div className="space-y-2">
                                <input type="text" placeholder="Address (Street, House No.)" value={newAddress.address} onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} className="w-full p-2 border rounded-md" required />
                                <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-2 border rounded-md" required />
                                <input type="text" placeholder="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full p-2 border rounded-md" required />
                                <input type="text" placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} className="w-full p-2 border rounded-md" required />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="submit" className="w-full bg-primary text-white p-2 rounded-md font-semibold hover:bg-primary-dark">Save Address</button>
                                <button type="button" onClick={() => setIsAddingNew(false)} className="w-full bg-gray-200 p-2 rounded-md font-semibold hover:bg-gray-300">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            <button onClick={() => setIsAddingNew(true)} className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200">
                                <PlusCircle size={20} /> Add a New Address
                            </button>
                             <button onClick={handleLocationClick} disabled={isLocating} className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 disabled:opacity-50">
                                {isLocating ? <LoadingSpinner size="small"/> : <MapPin size={20} />}
                                {isLocating ? 'Locating...' : 'Use Current Location'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddressModal;

