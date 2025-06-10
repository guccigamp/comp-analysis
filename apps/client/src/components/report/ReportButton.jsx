import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { companyApi, facilityApi } from "../../lib/api"
import { useState, useEffect } from "react"
import { Loader2, Download } from "lucide-react"
import generateReport from "./template/ReportTemplate"
import { transformFacilityData } from "../../utils/facility-utils"
import { useSearch } from "../../contexts/SearchContext"

export function ReportButton({ }) {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [includeAltor, setIncludeAltor] = useState("true");
    const [altorFacilities, setAltorFacilities] = useState({ type: "altor", facilities: [] });
    const [includeFilters, setIncludeFilters] = useState("true");
    const [isGenerating, setIsGenerating] = useState(false);
    const { filteredFacilities } = useSearch();

    // Load companies
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const res = await companyApi.getAllCompanies();
                setCompanies(res.data.map((c) => ({ name: c.name, id: c._id })));
            } catch (err) {
                console.error(err);
            }
        };
        loadCompanies();
    }, []);

    // Handle Altor visuals
    const handleIncludeAltor = async () => {
        setIncludeAltor(prev => !prev);
        if (includeAltor) {
            setAltorFacilities({
                type: "altor",
                facilities: transformFacilityData(
                    await facilityApi.getFacilitiesByCompany("683a49e8caed6bb0d04e5eee")
                        .then(res => res.data))
            });
        } else {
            setAltorFacilities({ type: "altor", facilities: [] });
        }
    }

    // Generate report
    const handleGenerateReport = async () => {

        setIsGenerating(true);

        try {
            const featuredFacilities = {
                type: "featured", facilities: transformFacilityData(
                    await facilityApi.getFacilitiesByCompany(selectedCompany)
                        .then(res => res.data))
            };
            await generateReport({ featuredFacilities, altorFacilities, filteredFacilities: { type: "competitors", facilities: filteredFacilities } })
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    }


    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button>Report</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4">
                <div className="space-y-4">
                    {/* Company selection */}
                    <div className="space-y-1">
                        <Label htmlFor="company-select">Featured Company</Label>
                        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                            <SelectTrigger id="company-select" className="w-full">
                                <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map((company) => (
                                    <SelectItem
                                        key={company.id}
                                        value={company.id}
                                        disabled={company.name === "Altor Solutions"}
                                    >
                                        {company.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Include Altor visuals */}
                    <div className="flex items-center space-x-2">
                        <Checkbox id="include-altor" defaultChecked={includeAltor} onCheckedChange={handleIncludeAltor} />
                        <Label htmlFor="include-altor">Include Altor visuals</Label>
                    </div>

                    {/* Include facilities */}
                    <div className="flex items-center space-x-2">
                        <Checkbox id="include-facilities" defaultChecked={includeFilters} onCheckedChange={setIncludeFilters} />
                        <Label htmlFor="include-facilities">Include facilities from selected filters</Label>
                    </div>

                    <Button className="w-full" onClick={handleGenerateReport} disabled={isGenerating}
                        variant={isGenerating ? "secondary" : "default"}
                    >
                        {isGenerating ? (<>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Report...
                        </>) : (<>
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                        </>)}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}