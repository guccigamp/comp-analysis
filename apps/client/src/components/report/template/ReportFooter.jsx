import { Separator } from "../../ui/separator.jsx"

export default function ReportFooter({ reportDate }) {
  return (
    <>
      <Separator className="my-6" />
      <footer className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center">
          <div className="bg-black text-white px-2 py-1 text-xs font-bold mr-2">ALTOR</div>
          <p>© {new Date().getFullYear()} Altor. All rights reserved.</p>
        </div>
        <p>Generated on {reportDate} | Confidential</p>
      </footer>
    </>
  )
}
