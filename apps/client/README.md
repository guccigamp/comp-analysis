# Altor Solutions Dashboard

A React-based dashboard for visualizing and analyzing competitor facility locations on an interactive map.

## Features

- **Interactive Map View**: Google Maps integration with custom markers for each company
- **List View**: Sortable table of all facilities with search and filtering
- **Analytics View**: Charts and metrics showing facility distribution by company and state
- **Multi-Select Search**: Advanced filtering by company, state, city, and text search
- **Proximity Search**: Find facilities within a specified radius of a location
- **Export Functionality**: Export filtered results to CSV

## Technology Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component library
- **Google Maps API** - Interactive mapping
- **Recharts** - Data visualization
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Google Maps API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd altor-solutions-dashboard
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file in the root directory:
\`\`\`env
VITE_GOOGLE_MAPS_API=your_google_maps_api_key_here
VITE_MAP_ID=your_map_id_here
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The application will be available at `http://localhost:5173`

### Building for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Project Structure

\`\`\`
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── map/            # Map-related components
│   ├── list/           # List view components
│   ├── analytics/      # Analytics components
│   └── search/         # Search components
├── contexts/           # React contexts
├── data/              # Static data files
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── pages/             # Page components
├── utils/             # Utility functions
└── main.jsx           # Application entry point
\`\`\`

## Environment Variables

- `VITE_GOOGLE_MAPS_API` - Google Maps API key
- `VITE_MAP_ID` - Google Maps Map ID (optional)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Migration from Next.js

This project was migrated from Next.js + TypeScript to React + JavaScript:

- ✅ Converted from Next.js App Router to React Router
- ✅ Removed TypeScript types and converted to JavaScript
- ✅ Replaced Next.js build system with Vite
- ✅ Updated environment variable handling
- ✅ Maintained all original functionality

## License

Private - Altor Solutions
