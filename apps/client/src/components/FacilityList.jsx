import { useSearch } from '../contexts/search-context';

export default function FacilityList() {
    const { facilities, loading, error } = useSearch();

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!facilities.length) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No facilities found. Try adjusting your search criteria.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {facilities.map((facility) => (
                <div
                    key={facility._id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                    <h3 className="text-lg font-semibold text-gray-900">{facility.companyName}</h3>
                    <p className="text-gray-600 mt-2">{facility.address}</p>
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-500">{facility.state}</span>
                        {facility.distance && (
                            <span className="text-sm font-medium text-blue-600">
                                {Math.round(facility.distance * 10) / 10} miles away
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
} 