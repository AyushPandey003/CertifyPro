"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, AlertTriangle, RefreshCw } from "lucide-react"
import type { RecipientData } from "@/app/data/page"

interface DataValidationProps {
  recipients: RecipientData[]
  onValidate: () => boolean
  errors: string[]
}

export function DataValidation({ recipients, onValidate, errors }: DataValidationProps) {
  const validRecords = recipients.length - errors.length
  const hasErrors = errors.length > 0
  const isEmpty = recipients.length === 0

  const getValidationStatus = () => {
    if (isEmpty) return "empty"
    if (hasErrors) return "errors"
    return "valid"
  }

  const status = getValidationStatus()

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {status === "valid" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === "errors" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            {status === "empty" && <AlertCircle className="h-5 w-5 text-muted-foreground" />}
            Data Validation
          </CardTitle>
          <CardDescription>Review your data for errors before generating certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{recipients.length}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{validRecords}</div>
              <div className="text-sm text-muted-foreground">Valid Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errors.length}</div>
              <div className="text-sm text-muted-foreground">Errors Found</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={status === "valid" ? "default" : status === "errors" ? "destructive" : "secondary"}>
                {status === "valid" && "Ready to Generate"}
                {status === "errors" && "Validation Errors"}
                {status === "empty" && "No Data"}
              </Badge>
            </div>
            <Button onClick={onValidate} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-validate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {status === "empty" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No recipient data found. Please upload a CSV file or add recipients manually.
          </AlertDescription>
        </Alert>
      )}

      {status === "valid" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All {recipients.length} records are valid and ready for certificate generation.
          </AlertDescription>
        </Alert>
      )}

      {status === "errors" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Validation Errors</CardTitle>
            <CardDescription>Please fix the following issues before proceeding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Validation Rules</CardTitle>
          <CardDescription>Data requirements for successful generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Required Fields</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Name must not be empty
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Valid email address format
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No duplicate email addresses
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Optional Fields</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Roll Number</li>
                <li>• Team ID</li>
                <li>• Department</li>
                <li>• Achievement</li>
                <li>• Custom Fields</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
