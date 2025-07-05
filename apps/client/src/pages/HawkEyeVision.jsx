import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.jsx"
import { MainMap } from "../components/map/MainMap.jsx"
import { List } from "../components/list/List.jsx"
import AdvancedFilters from "../components/search/AdvancedFilters.jsx"
import { useAlert } from "../hooks/use-alert.jsx"
import { useConfirm } from "../hooks/use-confirm.jsx"
import { AlertProvider } from "../components/ui/alert-provider.jsx"

export default function HawkEyeVision() {
    const [activeTab, setActiveTab] = useState("map")
    const { alertState, showAlert, hideAlert } = useAlert()
    const { confirmState, showConfirm, hideConfirm } = useConfirm()

    return (
        <div className="flex flex-1 flex-col gap-4 mx-4 p-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight ">HawkEye Vision</h1>
                <p className="text-muted-foreground ">
                    Visualize and explore facility locations with interactive maps and detailed listings
                </p>
            </div>

            <div className="mb-6">
                <AdvancedFilters />

            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="map">Map View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>

                <TabsContent value="map" className="flex-1 mt-4">
                    <div className="h-full min-h-[600px] rounded-lg">
                        <MainMap showAlert={showAlert} showConfirm={showConfirm} />
                    </div>
                </TabsContent>

                <TabsContent value="list" className="flex-1 mt-4">
                    <div className="h-full min-h-[600px]">
                        <List showAlert={showAlert} showConfirm={showConfirm} />
                    </div>
                </TabsContent>
            </Tabs>
            {/* Alert and Confirm Providers */}
            <AlertProvider
                alertState={alertState}
                confirmState={confirmState}
                onAlertClose={hideAlert}
                onConfirmCancel={hideConfirm}
            />
        </div>
    )
}
