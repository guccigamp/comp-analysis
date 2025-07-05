import { Card, CardContent } from "../../ui/card.jsx"
import { Button } from "../../ui/button.jsx"

export function AddUserCard({ onAddUser }) {
    return (
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <CardContent className="flex items-center justify-center h-full min-h-[200px]">
                <Button
                    variant="ghost"
                    onClick={onAddUser}
                    className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-700"
                >
                    <span>Add New User</span>
                </Button>
            </CardContent>
        </Card>
    )
}
