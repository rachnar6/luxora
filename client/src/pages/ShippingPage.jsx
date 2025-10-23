import React, { useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCart } from '../contexts/CartContext';
import CheckoutSteps from '../components/common/CheckoutSteps';
import { MapPin, PlusCircle } from 'lucide-react'; // Import icons

const ShippingPage = () => {
    // Get necessary functions and data from CartContext
    const { shippingAddress, saveShippingAddress, savedAddresses, addAddress, token } = useCart(); 
    const navigate = useNavigate();

    // Setup react-hook-form
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        // Default values initially set from context's shippingAddress (could be localStorage or first saved)
        defaultValues: {
            address: shippingAddress?.address || '',
            city: shippingAddress?.city || '',
            postalCode: shippingAddress?.postalCode || '',
            country: shippingAddress?.country || '',
            saveAddress: false // Add a checkbox state
        },
    });

    // Function to handle selecting a saved address
    const handleSelectAddress = (selectedAddr) => {
        // Use setValue from react-hook-form to update form fields
        setValue('address', selectedAddr.address);
        setValue('city', selectedAddr.city);
        setValue('postalCode', selectedAddr.postalCode);
        setValue('country', selectedAddr.country);
        setValue('saveAddress', false); // Uncheck save option when selecting existing
    };

    // Form submission handler
    const onSubmit = async (data) => {
        const { saveAddress, ...addressData } = data; // Separate checkbox state from address data

        // Save the chosen/entered address for the current checkout
        saveShippingAddress(addressData);

        // Optional: If 'Save address' is checked, add it to the user's saved addresses
        if (saveAddress) {
            try {
                // Check if this address already exists in savedAddresses to avoid duplicates
                const exists = savedAddresses.some(addr => 
                    addr.address === addressData.address &&
                    addr.city === addressData.city &&
                    addr.postalCode === addressData.postalCode &&
                    addr.country === addressData.country
                );
                if (!exists) {
                    await addAddress(addressData); // Call context function to save to DB
                }
            } catch (error) {
                console.error("Failed to save address:", error);
                // Optionally show a toast notification for the error
            }
        }
        
        navigate('/payment'); // Navigate to the next step
    };

    // Watch the form values to determine if it's a new address
    const currentFormData = watch();
    const isNewAddress = !savedAddresses.some(addr => 
        addr.address === currentFormData.address &&
        addr.city === currentFormData.city &&
        addr.postalCode === currentFormData.postalCode &&
        addr.country === currentFormData.country
    );

    // Effect to set initial form values if context loads after form init (edge case)
    useEffect(() => {
        if (shippingAddress) {
            setValue('address', shippingAddress.address);
            setValue('city', shippingAddress.city);
            setValue('postalCode', shippingAddress.postalCode);
            setValue('country', shippingAddress.country);
        }
    }, [shippingAddress, setValue]);


    return (
        <div className="max-w-xl mx-auto px-4"> {/* Increased max-width and added padding */}
            <CheckoutSteps step1 step2 />
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mt-6 dark:bg-gray-800"> {/* Increased padding and margin-top */}
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Shipping Address</h1>

                {/* --- Display Saved Addresses --- */}
                {savedAddresses && savedAddresses.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Select a saved address:</h2>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2"> {/* Added max height and scroll */}
                            {savedAddresses.map((addr, index) => (
                                <button
                                    key={addr._id || index} // Use _id if available from backend
                                    type="button"
                                    onClick={() => handleSelectAddress(addr)}
                                    className={`w-full text-left p-4 border rounded-lg flex items-start gap-3 transition-colors ${
                                        // Highlight if matches current form data
                                        addr.address === currentFormData.address && addr.city === currentFormData.city && addr.postalCode === currentFormData.postalCode && addr.country === currentFormData.country 
                                        ? 'bg-primary-light border-primary dark:bg-primary-dark/30 dark:border-primary' 
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                                    }`}
                                >
                                   <MapPin className="w-5 h-5 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0"/>
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-800 dark:text-gray-100">{addr.address}</p>
                                        <p className="text-gray-600 dark:text-gray-300">{addr.city}, {addr.postalCode}</p>
                                        <p className="text-gray-600 dark:text-gray-300">{addr.country}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-center my-4 text-gray-500 dark:text-gray-400">--- OR Enter a new address ---</p>
                    </div>
                )}

                {/* --- Address Form --- */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Address Field */}
                    <div className="mb-4">
                        <label htmlFor="address" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Address</label>
                        <input
                            {...register("address", { required: "Address is required" })}
                            type="text"
                            id="address"
                            placeholder="Street address, P.O. box, etc."
                            className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-gray-200`}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>

                    {/* City Field */}
                    <div className="mb-4">
                        <label htmlFor="city" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">City</label>
                        <input
                            {...register("city", { required: "City is required" })}
                            type="text"
                            id="city"
                            placeholder="Enter city"
                            className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-gray-200`}
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>

                    {/* Postal Code Field */}
                    <div className="mb-4">
                        <label htmlFor="postalCode" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Postal Code</label>
                        <input
                            {...register("postalCode", { required: "Postal code is required" })}
                            type="text"
                            id="postalCode"
                            placeholder="Enter postal code"
                            className={`w-full p-2 border rounded ${errors.postalCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-gray-200`}
                        />
                        {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                    </div>

                    {/* Country Field */}
                    <div className="mb-6"> {/* Increased margin bottom */}
                        <label htmlFor="country" className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Country</label>
                        <input
                            {...register("country", { required: "Country is required" })}
                            type="text"
                            id="country"
                            placeholder="Enter country"
                            className={`w-full p-2 border rounded ${errors.country ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-gray-200`}
                        />
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                    </div>

                    {/* Save Address Checkbox - Show only if it's a new address */}
                    {isNewAddress && (
                         <div className="mb-6">
                            <label htmlFor="saveAddress" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input
                                    {...register("saveAddress")}
                                    type="checkbox"
                                    id="saveAddress"
                                    className="rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                                />
                                Save this address for future checkouts
                            </label>
                        </div>
                    )}


                    {/* Submit Button */}
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors text-lg">
                        Continue to Payment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ShippingPage;