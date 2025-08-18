import { generateHashFromPythonData } from "./hash-generator"

export interface VerificationResult {
  isValid: boolean
  certificateData?: {
    name: string
    registrationNumber: string
    teamId: string
    eventName: string
    issueDate: string
    certificateType: string
    games?: string
  }
  error?: string
  verifiedAt: Date
  scanLocation?: string
}

export interface VerificationLog {
  id: string
  hash: string
  result: VerificationResult
  scannedBy: string
  ipAddress: string
  userAgent: string
  timestamp: Date
}

// Mock data from the knowledge folder
const mockCertificates = [
  {
    name: "MEHUL KHARE",
    reg_number: "24BAI10631",
    team_id: 1,
    hashed_code: "369c1e3444d8ae3f63412d05663acd8476a3b198036903976c0e1632d9368434",
    Games: "A"
  },
  {
    name: "PRAYUSH PATEL",
    reg_number: "24BCE10488",
    team_id: 1,
    hashed_code: "097e5036fed7680e4180b73e2e985a16fdbc723747bb19b076e94c155946b5d0",
    Games: "A"
  },
  {
    name: "Priyanshi Solanki",
    reg_number: "24BCE10518",
    team_id: 2,
    hashed_code: "cfef4f1560803ec02f0b0b62e7dae9836e5713da487b34542d1219190812ed01",
    Games: "A"
  },
  {
    name: "Kishika Raheja",
    reg_number: "23BCE10877",
    team_id: 2,
    hashed_code: "eba82421cbeef9ac18f0986d909db8422839f42d85308a49b9c7aca6106d8617",
    Games: "A"
  },
  {
    name: "Anshika Mishra",
    reg_number: "23MIM10080",
    team_id: 3,
    hashed_code: "5863240e207ea2aa9971b4da06954a0f74426c6bcd5f9721a2a165976be9fc16",
    Games: "A"
  },
  {
    name: "Vardaan Shukla",
    reg_number: "23BAI10079",
    team_id: 3,
    hashed_code: "9d8bf8b25deedd49526f451b2de4854e1f53d716a1e3780f63592ef3b93cf3aa",
    Games: "A"
  },
  {
    name: "Aastha",
    reg_number: "23BAI11213",
    team_id: 4,
    hashed_code: "5eaa9d3be039f27abecb06ce9d89714f15249bb731d6ec5070ebbd06a6d61dec",
    Games: "A"
  },
  {
    name: "Purvi",
    reg_number: "23BAI10042",
    team_id: 4,
    hashed_code: "998b73efe7589de1c402fa8e7553da8cd1fa2890ae687f114e8c9abda8944555",
    Games: "A"
  },
  {
    name: "Yash Tilwani",
    reg_number: "22BCE10405",
    team_id: 5,
    hashed_code: "800c6cbd45a44bc84b8c11ae75214be4270bfe03042de323e482e255fb425e39",
    Games: "A"
  },
  {
    name: "Neha Babel",
    reg_number: "24BCY10007",
    team_id: 5,
    hashed_code: "6fc83a9ac6db1745fcd61a5257aae08f376f28a74c2a881094845481854ddef4",
    Games: "A"
  }
]

export class HashVerifier {
  private static SALT = "Linpack2025" // Matches Python script salt

  static generateHash(name: string, regNumber: string, teamId: string): string {
    return generateHashFromPythonData(name, regNumber, teamId)
  }

  static async verifyHash(scannedHash: string): Promise<VerificationResult> {
    try {
      // Look up the certificate in our database
      const certificateData = await this.lookupCertificate(scannedHash)

      if (!certificateData) {
        return {
          isValid: false,
          error: "Certificate not found in our database",
          verifiedAt: new Date(),
        }
      }

      // Verify the hash matches what we would generate
      const expectedHash = this.generateHash(
        certificateData.name,
        certificateData.reg_number,
        certificateData.team_id.toString(),
      )

      const isValid = expectedHash === scannedHash

      return {
        isValid,
        certificateData: isValid ? {
          name: certificateData.name,
          registrationNumber: certificateData.reg_number,
          teamId: certificateData.team_id.toString(),
          eventName: "LinPack Club Event 2024",
          issueDate: "2024-01-15",
          certificateType: "Participation Certificate",
          games: certificateData.Games
        } : undefined,
        error: isValid ? undefined : "Hash verification failed",
        verifiedAt: new Date(),
      }
    } catch (error) {
      return {
        isValid: false,
        error: `Verification error: ${error}`,
        verifiedAt: new Date(),
      }
    }
  }

  private static async lookupCertificate(hash: string) {
    // Search in our mock database
    return mockCertificates.find((cert) => cert.hashed_code === hash)
  }

  static async logVerification(hash: string, result: VerificationResult, scannedBy: string): Promise<void> {
    const log: VerificationLog = {
      id: `log_${Date.now()}`,
      hash,
      result,
      scannedBy,
      ipAddress: "127.0.0.1", // Would get actual IP
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : "Server",
      timestamp: new Date(),
    }

    // Store verification log
    console.log("[v0] Verification logged:", log)
    
    // In production, this would save to a database
    // await saveVerificationLog(log)
  }

  // Function to get all certificates for testing
  static getAllCertificates() {
    return mockCertificates
  }
}
