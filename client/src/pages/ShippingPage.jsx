import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCart } from '../contexts/CartContext';
import CheckoutSteps from '../components/common/CheckoutSteps';

const ShippingPage = () => {
  const { shippingAddress, saveShippingAddress } = useCart();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      address: shippingAddress?.address || '',
      city: shippingAddress?.city || '',
      postalCode: shippingAddress?.postalCode || '',
      country: shippingAddress?.country || '',
    },
  });

  const onSubmit = (data) => {
    saveShippingAddress(data);
    navigate('/payment'); // Navigate to the next step
  };

  return (
    <div className="max-w-md mx-auto">
      <CheckoutSteps step1 step2 />
      <div className="bg-white p-8 rounded-lg shadow-md mt-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Shipping Address</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="address" className="block font-medium mb-1">Address</label>
            <input
              {...register("address", { required: "Address is required" })}
              type="text"
              id="address"
              placeholder="Enter address"
              className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="city" className="block font-medium mb-1">City</label>
            <input
              {...register("city", { required: "City is required" })}
              type="text"
              id="city"
              placeholder="Enter city"
              className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="postalCode" className="block font-medium mb-1">Postal Code</label>
            <input
              {...register("postalCode", { required: "Postal code is required" })}
              type="text"
              id="postalCode"
              placeholder="Enter postal code"
              className={`w-full p-2 border rounded ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="country" className="block font-medium mb-1">Country</label>
            <input
              {...register("country", { required: "Country is required" })}
              type="text"
              id="country"
              placeholder="Enter country"
              className={`w-full p-2 border rounded ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
          </div>

          <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark">
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShippingPage;