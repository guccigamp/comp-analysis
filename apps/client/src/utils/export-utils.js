/**
 * Convert an array of objects to CSV format
 */
export function convertToCSV(data, headers) {
    // Create header row
    const headerRow = Object.values(headers).join(",");

    // Create data rows
    const rows = data.map((item) => {
        return Object.keys(headers)
            .map((key) => {
                // Handle values that might contain commas or quotes
                const value = item[key];
                if (value === null || value === undefined) {
                    return "";
                }
                const stringValue = String(value);
                // Escape quotes and wrap in quotes if contains comma or quote
                if (stringValue.includes(",") || stringValue.includes('"')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            })
            .join(",");
    });

    // Combine header and rows
    return [headerRow, ...rows].join("\n");
}

/**
 * Export facilities data to CSV file
 */
export function exportFacilitiesToCSV(
    facilities,
    filename = "facilities-export.csv"
) {
    // Define headers mapping (field name -> display name)
    const headers = {
        companyName: "Company",
        address: "Address",
        state: "State",
        latitude: "Latitude",
        longitude: "Longitude",
    };

    // Convert data to CSV
    const csv = convertToCSV(facilities, headers);

    // Create a blob and download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
}
