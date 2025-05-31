import { useState } from 'react';
import { useSearch } from '../contexts/search-context';

export default function SearchForm() {
    const { searchNearby, searchByState, loading } = useSearch();
    const [location, setLocation] = useState('');
    const [radius, setRadius] = useState(50);
    const [searchType, setSearchType] = useState('proximity'); // 'proximity' or 'state'

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (searchType === 'proximity') {
            // Use browser's geolocation API to get coordinates
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        await searchNearby(latitude, longitude, radius);
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        alert('Please enable location services to use proximity search.');
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser');
            }
        } else {
            await searchByState(location);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
            <div className="flex space-x-4">
                <label className="flex items-center">
                    <input
                        type="radio"
                        value="proximity"
                        checked={searchType === 'proximity'}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="mr-2"
                    />
                    Proximity Search
                </label>
                <label className="flex items-center">
                    <input
                        type="radio"
                        value="state"
                        checked={searchType === 'state'}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="mr-2"
                    />
                    State Search
                </label>
            </div>

            {searchType === 'proximity' ? (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="radius" className="block text-sm font-medium text-gray-700">
                            Search Radius (miles)
                        </label>
                        <input
                            type="number"
                            id="radius"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            min="1"
                            max="500"
                        />
                    </div>
                </div>
            ) : (
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        State (e.g., CA, NY)
                    </label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value.toUpperCase())}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        maxLength="2"
                        placeholder="Enter state code"
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
                {loading ? 'Searching...' : 'Search'}
            </button>
        </form>
    );
} 