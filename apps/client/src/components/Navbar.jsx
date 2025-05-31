import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="text-xl font-semibold text-gray-800">
                        Facility Finder
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/"
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Search
                        </Link>
                        <a
                            href="https://github.com/yourusername/facility-finder"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
} 