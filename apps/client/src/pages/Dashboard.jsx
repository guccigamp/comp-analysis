import { Routes, Route, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../components/ui/sidebar.jsx"
import { AppSidebar } from "../components/AppSidebar.jsx"
import { Separator } from "../components/ui/separator.jsx"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb.jsx"
import HawkEyeVision from "./HawkEyeVision.jsx"
import HawkEyeAnalytics from "./HawkEyeAnalytics.jsx"
import ManageData from "./ManageData.jsx"

export default function Dashboard() {
  const location = useLocation()

  const getBreadcrumbTitle = () => {
    switch (location.pathname) {
      case "/":
        return "HawkEye Vision"
      case "/analytics":
        return "HawkEye Analytics"
      case "/manage-data":
        return "Manage Data"
      default:
        return "Dashboard"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{getBreadcrumbTitle()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <Routes>
          <Route path="/" element={<HawkEyeVision />} />
          <Route path="/analytics" element={<HawkEyeAnalytics />} />
          <Route path="/manage-data" element={<ManageData />} />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  )
}
