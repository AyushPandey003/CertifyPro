# CertifyPro - Automated Certificate Generation & Email Features

This document describes the automated certificate generation and email sending features implemented in CertifyPro, based on the tested Python scripts from the knowledge folder.

## 🚀 Features Implemented

### 1. Automated Certificate Generation with QR Codes

**What it does:**
- Generates personalized certificates for multiple recipients
- Creates unique QR codes with custom hashing logic
- Supports custom templates with dynamic text placement
- Generates certificates in bulk with progress tracking

**Key Components:**
- `lib/certificate-generator.ts` - Main certificate generation service
- `lib/qr-generator.ts` - QR code generation with SHA-256 hashing
- `app/generate/page.tsx` - User interface for certificate generation

**Hashing Logic:**
- Similar to `latentQrmaker.py` from knowledge folder
- Configurable salt and hash fields
- SHA-256 hashing for security
- Supports team events and individual certificates

### 2. Automated Email Sending with Attachments

**What it does:**
- Sends personalized emails to recipients
- Automatically attaches generated certificates
- Supports Gmail API integration (similar to `emailpass.py`)
- Batch email processing with progress tracking
- Email personalization with placeholders ({{name}}, etc.)

**Key Components:**
- `lib/email-service.ts` - Email service with Gmail API support
- `app/api/emails/send-certificates/route.ts` - API endpoint for email sending
- Integration with certificate generation workflow

**Email Features:**
- Personalized subject and body
- Automatic certificate attachments
- Batch processing with rate limiting
- Success/failure tracking
- Support for custom fields

### 3. QR Code Verification System

**What it does:**
- Web-based QR code scanner
- Manual hash verification
- Image upload for QR code processing
- Real-time verification against database
- Detailed certificate information display

**Key Components:**
- `app/verify/page.tsx` - Verification interface
- Camera integration for mobile devices
- Hash validation and database lookup
- Mock database for demonstration

### 4. Database Schema Updates

**New Tables:**
- `certificates` - Stores generated certificates and hashes
- `recipients` - Stores recipient information
- `email_batches` - Tracks email sending progress
- `email_logs` - Logs individual email delivery status

**Schema Features:**
- UUID primary keys for scalability
- JSON fields for custom data
- Timestamps for tracking
- Foreign key relationships

## 🔧 Technical Implementation

### Certificate Generation Flow

1. **Template Configuration**
   - Background image upload
   - Text element positioning
   - Hash field selection
   - Custom salt configuration

2. **Recipient Data**
   - CSV file upload
   - Manual data entry
   - Data validation
   - Custom field support

3. **Generation Process**
   - Hash generation for each recipient
   - QR code creation
   - Certificate image generation
   - Progress tracking

4. **Email Distribution**
   - Email template configuration
   - Certificate attachment
   - Batch processing
   - Delivery tracking

### API Endpoints

- `POST /api/certificates/generate` - Generate certificates
- `POST /api/emails/send-certificates` - Send certificate emails

### File Structure

```
lib/
├── certificate-generator.ts    # Certificate generation service
├── qr-generator.ts            # QR code generation with hashing
└── email-service.ts           # Email service with Gmail API

app/
├── generate/                  # Certificate generation page
├── verify/                    # QR code verification page
└── api/
    ├── certificates/          # Certificate API endpoints
    └── emails/               # Email API endpoints

components/
└── dashboard-generation.tsx   # Dashboard generation tab
```

## 📱 User Interface

### Generate Page (`/generate`)
- **Template Tab**: Configure certificate template and hashing
- **Recipients Tab**: Upload CSV or add recipients manually
- **Generate Tab**: Generate certificates with progress tracking
- **Email Tab**: Configure and send emails with certificates

### Verify Page (`/verify`)
- **QR Scanner**: Camera-based QR code scanning
- **Manual Input**: Hash verification by manual entry
- **Image Upload**: Process QR codes from uploaded images
- **Results Display**: Detailed certificate information

### Dashboard Integration
- New "Generation" tab showing:
  - Quick statistics
  - Recent batches
  - Quick actions
  - Best practices tips

## 🔐 Security Features

### Hashing & Verification
- SHA-256 hashing with configurable salt
- Unique hash per recipient
- Hash validation and verification
- Database lookup for authenticity

### Email Security
- Gmail API OAuth2 integration
- Rate limiting for email sending
- Delivery tracking and logging
- Error handling and retry logic

## 📊 Data Management

### CSV Import Format
```
Name,Email,Registration Number,Team ID,Custom Field 1,Custom Field 2
John Doe,john@example.com,24BCE10001,1,Department A,Role B
Jane Smith,jane@example.com,24BCE10002,1,Department A,Role C
```

### Supported Fields
- **Required**: Name, Email
- **Optional**: Registration Number, Team ID
- **Custom**: Any additional fields from CSV

## 🚀 Getting Started

### 1. Setup Dependencies
```bash
npm install
```

### 2. Environment Variables
```env
# Database
DATABASE_URL=your_database_url

# Gmail API (optional)
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
```

### 3. Database Migration
```bash
npm run db:generate
npm run db:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

## 📋 Usage Examples

### Generate Certificates
1. Navigate to `/generate`
2. Configure template and hashing settings
3. Upload CSV with recipient data
4. Generate certificates with QR codes
5. Configure email settings
6. Send certificates via email

### Verify Certificates
1. Navigate to `/verify`
2. Choose verification method:
   - Scan QR code with camera
   - Enter hash manually
   - Upload image with QR code
3. View verification results

## 🔮 Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multi-user template editing
- **Advanced Templates**: Drag-and-drop editor
- **Analytics Dashboard**: Detailed statistics and reports
- **API Integration**: Webhook support for external systems
- **Mobile App**: Native mobile certificate verification

### Technical Improvements
- **Image Processing**: Advanced certificate generation with canvas
- **Email Templates**: Rich HTML email templates
- **Batch Processing**: Background job processing
- **Caching**: Redis integration for performance
- **Monitoring**: Application performance monitoring

## 📚 References

### Python Scripts (Knowledge Folder)
- `latentQrmaker.py` - QR code generation with hashing
- `eventpass - Copy.py` - Certificate generation with PIL
- `emailpass.py` - Gmail API email sending
- `data_with_hashes.json` - Sample data structure

### Technologies Used
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **QR Codes**: qrcode library
- **Database**: PostgreSQL with Drizzle ORM
- **Email**: Gmail API integration
- **Authentication**: Auth0

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This implementation provides a solid foundation for automated certificate generation and email distribution. The system is designed to be scalable, secure, and user-friendly, following the patterns established in the tested Python scripts while leveraging modern web technologies.
