export default function ReportHeader({ reportDate }) {
  return (
    <div className="bg-black text-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img src="/altor-logo-white.png" alt="Altor Logo" className="h-20 mr-4" />
        </div>
        <div className="text-sm">
          <p>Confidential Report</p>
          <p>{reportDate}</p>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-2">Facility Location Analysis Report</h1>
      <p className="text-gray-300 text-lg">Innovative solutions to secure what matters most</p>
    </div>
  )
}
