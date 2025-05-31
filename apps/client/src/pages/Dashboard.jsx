import SearchForm from '../components/SearchForm';
import FacilityList from '../components/FacilityList';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Find Nearby Facilities</h1>
        <p className="mt-2 text-gray-600">
          Search for facilities by proximity or state
        </p>
      </div>

      <SearchForm />
      <FacilityList />
    </div>
  );
}
