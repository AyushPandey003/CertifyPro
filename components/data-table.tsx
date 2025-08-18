"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import type { RecipientData } from "@/app/data/page"

interface DataTableProps {
  recipients: RecipientData[]
  onAddRecipient: (recipient: Omit<RecipientData, "id">) => void
  onUpdateRecipient: (id: string, updates: Partial<RecipientData>) => void
  onDeleteRecipient: (id: string) => void
}

export function DataTable({ recipients, onAddRecipient, onUpdateRecipient, onDeleteRecipient }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRecipient, setEditingRecipient] = useState<RecipientData | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredRecipients = recipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipient.rollNumber && recipient.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddRecipient = (formData: FormData) => {
    const recipient: Omit<RecipientData, "id"> = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      rollNumber: formData.get("rollNumber") as string,
      teamId: formData.get("teamId") as string,
      department: formData.get("department") as string,
      achievement: formData.get("achievement") as string,
    }
    onAddRecipient(recipient)
    setIsAddDialogOpen(false)
  }

  const handleEditRecipient = (formData: FormData) => {
    if (!editingRecipient) return

    const updates: Partial<RecipientData> = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      rollNumber: formData.get("rollNumber") as string,
      teamId: formData.get("teamId") as string,
      department: formData.get("department") as string,
      achievement: formData.get("achievement") as string,
    }
    onUpdateRecipient(editingRecipient.id, updates)
    setIsEditDialogOpen(false)
    setEditingRecipient(null)
  }

  const RecipientForm = ({
    recipient,
    onSubmit,
  }: { recipient?: RecipientData; onSubmit: (formData: FormData) => void }) => (
    <form action={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" defaultValue={recipient?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" defaultValue={recipient?.email} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rollNumber">Roll Number</Label>
          <Input id="rollNumber" name="rollNumber" defaultValue={recipient?.rollNumber} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamId">Team ID</Label>
          <Input id="teamId" name="teamId" defaultValue={recipient?.teamId} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" defaultValue={recipient?.department} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="achievement">Achievement</Label>
          <Input id="achievement" name="achievement" defaultValue={recipient?.achievement} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
          }}
        >
          Cancel
        </Button>
        <Button type="submit">{recipient ? "Update" : "Add"} Recipient</Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recipients</CardTitle>
              <CardDescription>Manage individual recipient data</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Recipient</DialogTitle>
                  <DialogDescription>Enter the recipient&#39;s information</DialogDescription>
                </DialogHeader>
                <RecipientForm onSubmit={handleAddRecipient} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Team ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Achievement</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {recipients.length === 0 ? "No recipients added yet" : "No recipients match your search"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium">{recipient.name}</TableCell>
                      <TableCell>{recipient.email}</TableCell>
                      <TableCell>{recipient.rollNumber || "-"}</TableCell>
                      <TableCell>{recipient.teamId || "-"}</TableCell>
                      <TableCell>{recipient.department || "-"}</TableCell>
                      <TableCell>{recipient.achievement || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingRecipient(recipient)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteRecipient(recipient.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recipient</DialogTitle>
            <DialogDescription>Update the recipient&#39;s information</DialogDescription>
          </DialogHeader>
          {editingRecipient && <RecipientForm recipient={editingRecipient} onSubmit={handleEditRecipient} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
