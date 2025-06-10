import { ReportHeader } from "./ReportHeader"
import { ReportFooter } from "./ReportFooter"
import { CustomerInfo } from "./CustomerInfo"
import { ExecutiveSummary } from "./ExecutiveSummary"
import { FacilityMapCard } from "./FacilityMapCard"
import { ProximityAnalysis } from "./ProximityAnalysis"
import { buildStaticMap } from "../../../utils/map-utils"

function ReportTemplate({
    featuredFacilities,
    altorFacilities,
    filteredFacilities,
    reportDate = new Date().toLocaleDateString(),
    proximityRadius
}) {
    // Create maps
    const featuredMap = buildStaticMap(
        center = { lat: 0, lng: 0 },
        facilities = featuredFacilities,
    )

    const altorMap = buildStaticMap(
        center = { lat: 0, lng: 0 },
        facilities = altorFacilities,
    )


    const featuredCompanyName = featuredFacilities.facilities[0].companyName
    // Create facility counts
    const featuredCount = featuredFacilities.facilities.length;
    const altorCount = altorFacilities.length;
    const filteredCount = filteredFacilities.length;
    const allCount = featuredCount + altorCount + filteredCount;

    return (
        <div>
            <div id="facility-report">
                {/* Report Header */}
                <ReportHeader reportDate={reportDate} />
                <div className="p-6">
                    {/* Customer Info */}
                    <CustomerInfo
                        customerName={featuredCompanyName}
                        proximityRadius={proximityRadius}
                    />
                    {/* Executive Summary */}
                    <ExecutiveSummary
                        customerName={featuredCompanyName}
                        proximityRadius={proximityRadius}
                        facilityData={featuredFacilities}
                    />
                    {/* Featured Map Card */}
                    <FacilityMapCard
                        title="1. Featured Facilities"
                        map={featuredMap}
                        companyType="Customer"
                        // TODO: Add the number of states and cities to the caption
                        caption={`${featuredCompanyName} facility network spanning ${0} states and ${0} cities`}
                    />
                    {/* Altor Map Card */}
                    {altorFacilities.length > 0 && (
                        // Only show Altor Map Card if there are Altor facilities
                        // This is to avoid showing an empty map card
                        <>
                            <FacilityMapCard
                                title="2. Altor Facilities"
                                map={altorMap}
                                companyType="Altor"
                                caption={`Strategic distribution of ${0} Altor facilities across ${0} states`}
                            />
                            {/* Featured and Altor Map Card */}
                            <FacilityMapCard
                                title="3. Featured and Altor Facilities"
                                map={featuredAndAltorMap}
                                companyType="Combined"
                            />
                        </>
                    )}


                    {/* All Facilities Map Card */}
                    {filteredFacilities.length > 0 && <FacilityMapCard
                        title="All Facilities"
                        map={allFacilitiesMap}
                        companyType="All"
                    />}

                    {/* Proximity Map Card */}
                    <ProximityAnalysis
                        customerName={featuredCompanyName}
                        proximityRadius={proximityRadius}
                        facilityData={featuredFacilities}
                    />

                    {/* Report Footer */}
                    <ReportFooter reportDate={reportDate} />
                </div>

            </div>
        </div>
    )
}

export default function generateReport({ featuredFacilities, altorFacilities, filteredFacilities, reportDate = new Date().toLocaleDateString() }) {
    return new Promise((resolve, reject) => {
        try {
            // Create a temporary container for the report
            const tempContainer = document.createElement("div")
            tempContainer.style.position = "absolute"
            tempContainer.style.left = "-9999px"
            tempContainer.style.top = "-9999px"
            tempContainer.style.width = "8.5in"
            tempContainer.style.backgroundColor = "white"
            document.body.appendChild(tempContainer)

            import("react").then((React) => {
                import("react-dom").then((ReactDOM) => {
                    const root = ReactDOM.createRoot(tempContainer)
                    // Render the report component
                    root.render(<ReportTemplate featuredFacilities={featuredFacilities} altorFacilities={altorFacilities} filteredFacilities={filteredFacilities} reportDate={reportDate} />)
                })
            })

            setTimeout(() => {
                // Print the report
                const reportContent = tempContainer.innerHTML
                const printWindow = window.open("", "_blank")
                if (printWindow) {
                    printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Facility Location Analysis Report - ${customerName}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                      @media print {
                        body { margin: 0; }
                        .page-break { page-break-before: always; }
                        .keep-together { page-break-inside: avoid; }
                        .map-section { page-break-inside: avoid; margin-bottom: 2rem; }
                        .proximity-map { page-break-inside: avoid; margin-bottom: 1.5rem; }
                        @page { margin: 0.75in; size: letter; }
                      }
                      body { 
                        font-family: system-ui, -apple-system, sans-serif; 
                        background: white;
                        color: black;
                      }
                      .map-section { min-height: fit-content; }
                      img { max-width: 100%; height: auto; }
                    </style>
                  </head>
                  <body>${reportContent}</body>
                </html>
              `)
                    printWindow.document.close()
                    // Trigger print after 1 second to ensure content is fully loaded
                    setTimeout(() => {
                        printWindow.print()
                        document.body.removeChild(tempContainer)
                        resolve(true)
                    }, 1000)
                } else {
                    document.body.removeChild(tempContainer)
                    reject(new Error("Failed to open print window"))
                }
            }, 2000)
        } catch (err) {
            document.body.removeChild(tempContainer)
            reject(err)
        }
    })
}

function downloadImage(url, filename = "static-map.gif") {
    fetch(url)
        .then(res => res.blob())
        .then(blob => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
}

// Usage:
downloadImage("PASTE_YOUR_GENERATED_STATIC_MAP_URL_HERE");

