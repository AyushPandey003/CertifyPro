"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Calendar, User, Hash, Award, Building } from "lucide-react"
export type VerificationResult = import("@/lib/hash-verifier").VerificationResult

interface VerificationResultProps {
  result: VerificationResult | null
  onReset: () => void
}

export function VerificationResult({ result, onReset }: VerificationResultProps) {
  if (!result) return null

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          {result.isValid ? (
            <CheckCircle className="w-12 h-12 text-green-500" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
          )}
        </div>
        <CardTitle className={result.isValid ? "text-green-700" : "text-red-700"}>
          {result.isValid ? "Certificate Verified" : "Verification Failed"}
        </CardTitle>
        <CardDescription>
          {result.isValid
            ? "This certificate is authentic and valid"
            : result.error || "Certificate could not be verified"}
        </CardDescription>
      </CardHeader>

      {result.isValid && result.certificateData && (
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <User className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium">{result.certificateData.name}</p>
                <p className="text-sm text-slate-600">Recipient Name</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Hash className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium">{result.certificateData.registrationNumber}</p>
                <p className="text-sm text-slate-600">Registration Number</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Award className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium">{result.certificateData.certificateType}</p>
                <p className="text-sm text-slate-600">Certificate Type</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Building className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium">{result.certificateData.eventName}</p>
                <p className="text-sm text-slate-600">Event</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium">{new Date(result.certificateData.issueDate).toLocaleDateString()}</p>
                <p className="text-sm text-slate-600">Issue Date</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Verified at:</span>
              <span>{result.verifiedAt.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      )}

      <CardContent className="pt-0">
        <Button onClick={onReset} className="w-full bg-transparent" variant="outline">
          Scan Another Certificate
        </Button>
      </CardContent>
    </Card>
  )
}
