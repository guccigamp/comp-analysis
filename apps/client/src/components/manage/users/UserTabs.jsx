import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs.jsx"

export function UserTabs({ activeTab, onTabChange, getUsersByRole, children }) {
    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="admin">Admins ({getUsersByRole("admin")})</TabsTrigger>
                <TabsTrigger value="user">Users ({getUsersByRole("user")})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
                {children}
            </TabsContent>
        </Tabs>
    )
}
