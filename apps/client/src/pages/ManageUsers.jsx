import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext.jsx"
import { userApi, authApi } from "../lib/api.js"
import { useAlert } from "../hooks/use-alert.jsx"
import { useConfirm } from "../hooks/use-confirm.jsx"
import { AlertProvider } from "../components/ui/alert-provider.jsx"
import AccessDenied from "../components/manage/AccessDenied.jsx"
import { UserSearch } from "../components/manage/users/UserSearch.jsx"
import { UserTabs } from "../components/manage/users/UserTabs.jsx"
import { UserGrid } from "../components/manage/users/UserGrid.jsx"
import { UserDialog } from "../components/manage/users/UserDialog.jsx"

export default function ManageUsers() {
    const { user, isAdmin } = useAuth()
    const { alertState, showAlert, hideAlert } = useAlert()
    const { confirmState, showConfirm, hideConfirm } = useConfirm()
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)

    // Show access denied message for non-admin users
    if (!isAdmin) {
        return <AccessDenied />
    }

    // Fetch users on mount
    useEffect(() => {
        fetchUsers()
    }, [user])

    useEffect(() => {
        filterUsers()
    }, [users, searchTerm, activeTab])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await userApi.getAllUsers()
            setUsers(response.data)
        } catch (error) {
            showAlert({
                variant: "destructive",
                title: "Error",
                message: "Failed to fetch users",
            })
        } finally {
            setLoading(false)
        }
    }

    const filterUsers = () => {
        let filtered = users

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (user) =>
                    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.location?.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Filter by role tab
        if (activeTab !== "all") {
            filtered = filtered.filter((user) => user.role === activeTab)
        }

        setFilteredUsers(filtered)
    }

    const handleAddUser = async (userData) => {
        try {
            await authApi.register(userData)
            showAlert({
                variant: "success",
                title: "Success",
                message: "User added successfully",
            })
            setIsAddDialogOpen(false)
            fetchUsers()
        } catch (error) {
            showAlert({
                variant: "destructive",
                title: "Error",
                message: error.response?.data?.message || "Failed to add user",
            })
        }
    }

    const handleEditUser = async (userData) => {
        try {
            const response = await userApi.updateUser(selectedUser._id, userData)
            console.log(response.data)
            showAlert({
                variant: "success",
                title: "Success",
                message: "User updated successfully",
            })
            setIsEditDialogOpen(false)
            setSelectedUser(null)
            fetchUsers()
        } catch (error) {
            showAlert({
                variant: "destructive",
                title: "Error",
                message: error.response?.data?.message || "Failed to update user",
            })
        }
    }

    const handleDeleteUser = async (userId) => {
        showConfirm({
            title: "Delete User",
            message: "Are you sure you want to delete this user? This action cannot be undone.",
            onConfirm: async () => {
                try {
                    await userApi.deleteUser(userId)
                    showAlert({
                        variant: "success",
                        title: "Success",
                        message: "User deleted successfully",
                    })
                    fetchUsers()
                } catch (error) {
                    showAlert({
                        variant: "destructive",
                        title: "Error",
                        message: "Failed to delete user",
                    })
                }
            },
        })
    }

    const openEditDialog = (user) => {
        setSelectedUser(user)
        setIsEditDialogOpen(true)
    }

    const getUsersByRole = (role) => {
        return users.filter((user) => user.role === role).length
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading users...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Users</h1>

                <UserSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

                <UserTabs activeTab={activeTab} onTabChange={setActiveTab} getUsersByRole={getUsersByRole}>
                    <UserGrid
                        users={filteredUsers}
                        onEditUser={openEditDialog}
                        onDeleteUser={handleDeleteUser}
                        onAddUser={() => setIsAddDialogOpen(true)}
                    />
                </UserTabs>
            </div>

            {/* Add User Dialog */}
            <UserDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onSubmit={handleAddUser}
                title="Add New User"
                description="Create a new user account. They will receive login credentials via email."
            />

            {/* Edit User Dialog */}
            <UserDialog
                isOpen={isEditDialogOpen}
                onClose={() => {
                    setIsEditDialogOpen(false)
                    setSelectedUser(null)
                }}
                onSubmit={handleEditUser}
                user={selectedUser}
                title="Edit User"
                description="Update user information and permissions."
            />

            {/* Alert Provider */}
            <AlertProvider
                alertState={alertState}
                confirmState={confirmState}
                onAlertClose={hideAlert}
                onConfirmCancel={hideConfirm}
            />
        </div>
    )
}
