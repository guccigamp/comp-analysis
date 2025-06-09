class TemplateController {
    constructor() {
        this.getSampleAddressTemplate =
            this.getSampleAddressTemplate.bind(this);
        this.getSampleCoordinatesTemplate =
            this.getSampleCoordinatesTemplate.bind(this);
    }

    /**
     * Generate and serve a sample address-based CSV template
     */
    getSampleAddressTemplate(req, res) {
        const headers = ["company_name", "legend_color", "address", "tags"];
        const sampleData = [
            [
                "Tech Corp",
                "#FF5733",
                "1600 Amphitheatre Parkway, Mountain View, CA 94043",
                "headquarters, office, tech",
            ],
            [
                "Tech Corp",
                "#FF5733",
                "1 Hacker Way, Menlo Park, CA 94301",
                "research, development, office",
            ],
            [
                "Data Solutions",
                "#33FF57",
                "410 Terry Ave N, Seattle, WA 98109",
                "data-center, cloud, office",
            ],
            [
                "Analytics Inc",
                "#3357FF",
                "1 Microsoft Way, Redmond, WA 98052",
                "headquarters, research, office",
            ],
        ];

        // Generate CSV content
        const csvContent = this.generateCSV(headers, sampleData);

        // Set response headers for file download
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="sample-address-template.csv"'
        );

        // Send the CSV content
        res.send(csvContent);
    }

    /**
     * Generate and serve a sample coordinates-based CSV template
     */
    getSampleCoordinatesTemplate(req, res) {
        const headers = [
            "company_name",
            "legend_color",
            "latitude",
            "longitude",
            "tags",
        ];
        const sampleData = [
            [
                "Mobile Corp",
                "#FF33F5",
                "37.4419",
                "-122.1430",
                "mobile, office, headquarters",
            ],
            [
                "Cloud Services",
                "#F5FF33",
                "47.6062",
                "-122.3321",
                "cloud, data-center, office",
            ],
            [
                "AI Innovations",
                "#33F5FF",
                "40.7589",
                "-73.9851",
                "ai, research, office",
            ],
        ];

        // Generate CSV content
        const csvContent = this.generateCSV(headers, sampleData);

        // Set response headers for file download
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="sample-coordinates-template.csv"'
        );

        // Send the CSV content
        res.send(csvContent);
    }

    /**
     * Generate CSV content from headers and data
     * @param {Array} headers - Array of header strings
     * @param {Array} data - 2D array of data rows
     * @returns {String} CSV content as string
     */
    generateCSV(headers, data) {
        // Helper function to escape CSV values
        const escapeCSV = (value) => {
            if (value === null || value === undefined) return "";
            const stringValue = String(value);
            // Escape quotes and wrap in quotes if needed
            if (
                stringValue.includes(",") ||
                stringValue.includes('"') ||
                stringValue.includes("\n")
            ) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        // Generate header row
        const headerRow = headers.map(escapeCSV).join(",");

        // Generate data rows
        const dataRows = data.map((row) => row.map(escapeCSV).join(","));

        // Combine header and data rows
        return [headerRow, ...dataRows].join("\n");
    }
}

export default new TemplateController();
