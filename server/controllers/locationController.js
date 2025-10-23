import asyncHandler from '../utils/asyncHandler.js';
// Correct import for the Google Maps library
import { Client, Language } from "@googlemaps/google-maps-services-js";

// Initialize the Google Maps Client outside the handler
const googleMapsClient = new Client({});

// @desc    Lookup address details from a Google Maps URL
// @route   POST /api/location/lookup-url
// @access  Private
const lookupUrl = asyncHandler(async (req, res) => {
    const { url } = req.body;

    if (!url) {
        res.status(400);
        throw new Error('URL is required');
    }

    // --- Basic URL Parsing (Refine as needed for different URL types) ---
    let query = '';
    try {
        const urlParts = new URL(url);
        if (url.includes('/@')) {
            const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordsMatch) {
                query = `${coordsMatch[1]},${coordsMatch[2]}`;
            }
        } else if (urlParts.searchParams.get('q')) {
            query = urlParts.searchParams.get('q');
        } else {
            const pathMatch = urlParts.pathname.match(/\/place\/([^/]+)/);
             if (pathMatch) {
                 query = decodeURIComponent(pathMatch[1].replace(/\+/g, ' '));
             }
        }
    } catch (parseError) {
         console.error("URL Parsing Error:", parseError);
         // If parsing fails, maybe the pasted text IS the query
         if (typeof url === 'string' && url.length > 3) {
            query = url;
         }
    }
    
    if (!query) {
        res.status(400);
        throw new Error('Could not extract location query from URL/text');
    }

    console.log(`Looking up Google Maps query: "${query}"`);

    try {
        // --- Use the Google Maps Client ---
        const response = await googleMapsClient.textSearch({
            params: {
                query: query,
                key: process.env.GOOGLE_MAPS_API_KEY,
                language: Language.en // Optional: specify language
            },
            timeout: 5000, // Optional: timeout in milliseconds
        });

        if (response.data.status !== 'OK' || response.data.results.length === 0) {
            console.error("Google Maps API Error Status:", response.data.status, response.data.error_message);
            throw new Error(`Location not found via Google Maps API. Status: ${response.data.status}`);
        }

        const place = response.data.results[0]; // Take the first result
        const placeId = place.place_id;

        // --- Get Place Details for Address Components ---
        const detailsResponse = await googleMapsClient.placeDetails({
             params: {
                 place_id: placeId,
                 fields: ['address_components', 'formatted_address', 'name'],
                 key: process.env.GOOGLE_MAPS_API_KEY,
                 language: Language.en
             },
             timeout: 5000,
        });

        if (detailsResponse.data.status !== 'OK') {
             console.error("Google Place Details API Error Status:", detailsResponse.data.status, detailsResponse.data.error_message);
             throw new Error(`Could not get place details. Status: ${detailsResponse.data.status}`);
        }

        const details = detailsResponse.data.result;
        const addressComponents = details.address_components || [];

        // Helper function to extract address component types
        const getAddressComponent = (type) => {
            const component = addressComponents.find(comp => comp.types.includes(type));
            return component ? component.long_name : '';
        };

        // Format the address
        const fetchedAddress = {
            address: details.formatted_address || details.name || '', // Use formatted address if available
            city: getAddressComponent('locality') || getAddressComponent('administrative_area_level_2') || '',
            postalCode: getAddressComponent('postal_code') || '',
            country: getAddressComponent('country') || '', // Usually returns full country name
        };
        
        // Use shorter street address if formatted is too long/complex (optional refinement)
        const streetNumber = getAddressComponent('street_number');
        const streetName = getAddressComponent('route');
        if (streetNumber && streetName) {
            fetchedAddress.address = `${streetNumber} ${streetName}`;
        } else if (streetName) {
             fetchedAddress.address = streetName;
        }


        // Basic validation
        if (!fetchedAddress.address || !fetchedAddress.city || !fetchedAddress.country) {
             console.warn("Incomplete address extracted:", fetchedAddress);
             throw new Error('Could not extract a complete address from the Google Maps result.');
        }

        res.status(200).json(fetchedAddress);

    } catch (error) {
        console.error("Google Maps API Request Error:", error);
        res.status(500); // Use 500 for server-side/API key errors
        throw new Error(error.message || 'Failed to lookup address from Google Maps API.');
    }
});

export { lookupUrl };