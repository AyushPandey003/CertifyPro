"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from "lucide-react"
import { RecipientData } from "@/app/data/page"

interface DataUploadProps {
  onDataUploaded: (recipients: Omit<RecipientData, "id">[]) => void
}

export function DataUpload({ onDataUploaded }: DataUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    setUploadedFile(file)
    setIsProcessing(true)

    try {
      const text = await file.text()
      const parsed = parseCSV(text)
      setParsedData(parsed)
      
      // Validate the data
      const errors = validateData(parsed)
      setValidationErrors(errors)
      
      if (errors.length === 0) {
        // Convert to recipient format
        const recipients = parsed.map(row => ({
          name: row.name || row.Name || row.NAME || '',
          email: row.email || row.Email || row.EMAIL || row['Email Address'] || '',
          rollNumber: row.rollNumber || row.roll_number || row.reg_number || row['Registration Number'] || '',
          teamId: row.teamId || row.team_id || row['Team ID'] || '',
          department: row.department || row.Department || '',
          achievement: row.achievement || row.Achievement || '',
          customFields: {
            games: row.games || row.Games || '',
            event: row.event || row.Event || '',
            date: row.date || row.Date || ''
          }
        }))
        
        onDataUploaded(recipients)
      }
    } catch (error) {
      console.error('Error parsing CSV:', error)
      setValidationErrors(['Failed to parse CSV file'])
    } finally {
      setIsProcessing(false)
    }
  }

  const parseCSV = (csvText: string): Record<string, string>[] => {
    const lines = csvText.split('\n')
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, string> = {}
        
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        
        data.push(row)
      }
    }
    
    return data
  }

  const validateData = (data: Record<string, string>[]): string[] => {
    const errors: string[] = []
    
    if (data.length === 0) {
      errors.push('No data found in CSV file')
      return errors
    }
    
    data.forEach((row, index) => {
      if (!row.name && !row.Name && !row.NAME) {
        errors.push(`Row ${index + 1}: Name is required`)
      }
      if (!row.email && !row.Email && !row.EMAIL && !row['Email Address']) {
        errors.push(`Row ${index + 1}: Email is required`)
      }
    })
    
    return errors
  }

  const removeFile = () => {
    setUploadedFile(null)
    setParsedData([])
    setValidationErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `Name,Email,Registration Number,Team ID,Games,Event,Date
MEHUL KHARE,mehul@example.com,24BAI10631,1,A,LinPack Club Event,2024-01-15
PRAYUSH PATEL,prayush@example.com,24BCE10488,1,A,LinPack Club Event,2024-01-15
Priyanshi Solanki,priyanshi@example.com,24BCE10518,2,A,LinPack Club Event,2024-01-15`
    
    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_recipients.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Recipient Data
          </CardTitle>
          <CardDescription>
            Upload a CSV file with recipient information or drag and drop files here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!uploadedFile ? (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium">Drop your CSV file here</p>
                  <p className="text-muted-foreground">or click to browse</p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <FileText className="h-12 w-12 text-primary mx-auto" />
                <div>
                  <p className="text-lg font-medium">{uploadedFile.name}</p>
                  <p className="text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button variant="outline" onClick={removeFile}>
                  <X className="h-4 w-4 mr-2" />
                  Remove File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sample CSV */}
      <Card>
        <CardHeader>
          <CardTitle>Sample CSV Format</CardTitle>
          <CardDescription>
            Download a sample CSV file to see the required format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• Name (required)</div>
                <div>• Email (required)</div>
                <div>• Registration Number</div>
                <div>• Team ID</div>
                <div>• Games</div>
                <div>• Event</div>
                <div>• Date</div>
              </div>
            </div>
            <Button variant="outline" onClick={downloadSampleCSV}>
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing Results */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Processing CSV file...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationErrors.length > 0 && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {parsedData.length > 0 && validationErrors.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Successfully uploaded {parsedData.length} recipients
                </p>
                <p className="text-sm text-green-600">
                  All data has been validated and is ready for certificate generation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              First few rows of your uploaded data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {Object.keys(parsedData[0] || {}).map((header) => (
                      <th key={header} className="text-left p-2 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="p-2">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 5 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Showing first 5 rows of {parsedData.length} total rows
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
