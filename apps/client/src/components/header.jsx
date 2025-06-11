// import { Building } from "lucide-react"
import altorLogo from "../assets/altor-logo.png"
import { Button } from "./ui/button.jsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu.jsx"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.jsx"
import { useAuth } from "../contexts/AuthContext.jsx"


export function Header() {
    const { logout } = useAuth()
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo & name */}
                <div className="flex items-center gap-2">
                    <img src={altorLogo} alt="Altor HawkEye" className="h-10 w-auto" />
                    <span className="hidden text-xl font-bold sm:inline-block">HawkEye</span>
                </div>

                {/* User profile on the right */}
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                                    <AvatarFallback>AS</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
