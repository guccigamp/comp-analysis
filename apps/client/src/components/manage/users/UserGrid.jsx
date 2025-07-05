import { UserCard } from "./UserCard.jsx"
import { AddUserCard } from "./AddUserCard.jsx"

export function UserGrid({ users, onEditUser, onDeleteUser, onAddUser }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
                <UserCard key={user._id} user={user} onEdit={onEditUser} onDelete={onDeleteUser} />
            ))}
            <AddUserCard onAddUser={onAddUser} />
        </div>
    )
}
