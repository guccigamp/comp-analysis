import { useLocation, useNavigate } from "react-router-dom"
import { Eye, BarChart3, Database, Users, ChevronDown, LogOut, Settings } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "./ui/sidebar.jsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu.jsx"
import { Avatar, AvatarFallback } from "./ui/avatar.jsx"
import { useAuth } from "../contexts/AuthContext.jsx"

const navigationItems = [
    {
        title: "HawkEye Vision",
        url: "/",
        icon: Eye,
        description: "Map and list view of facilities",
        isAdminOnly: false,
    },
    {
        title: "HawkEye Analytics",
        url: "/analytics",
        icon: BarChart3,
        description: "Analytics and insights dashboard",
        isAdminOnly: false,
    },
    {
        title: "Manage Data",
        url: "/manage-data",
        icon: Database,
        description: "Upload and manage facility data",
        isAdminOnly: true,
    },
    {
        title: "Manage Users",
        url: "/manage-users",
        icon: Users,
        description: "Manage user accounts and permissions",
        isAdminOnly: true,
    },
]

export function AppSidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout, isAdmin } = useAuth()
    const handleNavigation = (url) => {
        navigate(url)
    }

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <img src="/src/assets/altor-logo.png" alt="Altor" className="size-6 object-contain" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold">Altor</span>
                                <span className="text-xs">HawkEye Intelligence</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.filter((item) => !item.isAdminOnly || isAdmin).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        onClick={() => handleNavigation(item.url)}
                                        isActive={location.pathname === item.url}
                                        tooltip={item.description}
                                    >
                                        <item.icon className="size-4" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">
                                            {user?.email?.charAt(0).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.name}</span>
                                        <span className="truncate text-xs capitalize">{user?.role}</span>
                                    </div>
                                    <ChevronDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Account Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
