# CertifyPro - Certificate & Event Pass Generation Platform

A comprehensive, user-friendly web application for designing, generating, and distributing personalized event passes and certificates in bulk. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login/register system with session management
- **Template Editor**: Drag-and-drop interface for designing certificates and passes
- **Data Management**: CSV upload and validation for recipient information
- **Bulk Generation**: Generate thousands of personalized documents automatically
- **QR Code Integration**: Unique SHA-256 hashing for each certificate
- **Email Distribution**: Automated sending with personalized messages
- **Verification System**: Web-based QR scanner for instant verification
- **Admin Dashboard**: Analytics and verification logs

### Technical Features
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Component Library**: Reusable UI components with Radix UI
- **Hash Security**: SHA-256 hashing with salt protection
- **PDF Generation**: Certificate output in PDF format
- **Real-time Updates**: Live progress tracking for generation jobs

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, CSS Modules
- **UI Components**: Radix UI, Lucide Icons
- **Authentication**: Custom session management
- **Hashing**: Node.js crypto module (SHA-256)
- **Development**: ESLint, PostCSS

## 📁 Project Structure

```
my-app/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin panel and verification logs
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   ├── data/              # Data management
│   ├── demo/              # Live demo page
│   ├── editor/            # Template editor
│   ├── email/             # Email distribution
│   ├── generate/          # Certificate generation
│   ├── login/             # Authentication
│   ├── register/          # User registration
│   └── verify/            # QR code verification
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components
│   ├── auth-form.tsx      # Authentication forms
│   ├── dashboard-*.tsx    # Dashboard components
│   ├── data-*.tsx         # Data management components
│   ├── editor-*.tsx       # Editor components
│   ├── generation-*.tsx   # Generation components
│   └── qr-scanner.tsx     # QR code scanner
├── lib/                   # Utility libraries
│   ├── auth.ts            # Authentication logic
│   ├── email-service.ts   # Email functionality
│   ├── generation.ts      # Generation engine
│   ├── hash-generator.ts  # Hash generation
│   ├── hash-verifier.ts   # Hash verification
│   ├── pdf-generator.ts   # PDF generation
│   └── qr-generator.ts    # QR code generation
└── knowledge/             # Sample data and Python scripts
    ├── data_with_hashes.json  # Sample certificate data
    ├── latentQrmaker.py       # Python QR code generator
    ├── emailpass.py           # Python email sender
    └── readme.txt             # Project requirements
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cluRecruits/my-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. User Registration & Login
- Visit `/register` to create a new account
- Use `/login` to sign in to existing account
- Sessions are managed automatically

### 2. Dashboard Overview
- **Quick Actions**: Create certificates or manage recipients
- **Analytics**: View project statistics and recent activity
- **Navigation**: Access different sections of the platform

### 3. Template Design
- Navigate to `/editor` to design certificates
- **Add Elements**: Text, QR codes, images, shapes
- **Customize**: Fonts, colors, positioning, sizing
- **Save Templates**: Store designs for reuse

### 4. Data Management
- Go to `/data` to manage recipient information
- **Upload CSV**: Drag & drop or browse for CSV files
- **Validation**: Automatic data validation and error checking
- **Manual Entry**: Add recipients one by one
- **Preview**: Review data before generation

### 5. Certificate Generation
- Visit `/generate` to create certificates
- **Configure Settings**: Hash generation, QR codes, PDF options
- **Preview**: See how certificates will look
- **Generate**: Process all recipients automatically
- **Monitor Progress**: Real-time generation status

### 6. Email Distribution
- Navigate to `/email` to send certificates
- **Compose Campaigns**: Personalized email templates
- **Attach Certificates**: Automatic PDF attachments
- **Track Progress**: Monitor sending status
- **View Reports**: Success/failure analytics

### 7. Verification System
- Use `/verify` to scan QR codes
- **Web Scanner**: Camera-based QR code scanning
- **Instant Verification**: Real-time hash validation
- **Certificate Details**: View verified information
- **Scan History**: Track verification attempts

### 8. Admin Panel
- Access `/admin/verification-logs` for analytics
- **Verification Logs**: Monitor all scan attempts
- **Success Rates**: Track verification statistics
- **User Analytics**: Device and location insights

## 🔐 Security Features

### Hash Generation
- **SHA-256 Algorithm**: Industry-standard cryptographic hashing
- **Salt Protection**: Unique salt "Linpack2025" for added security
- **Configurable Fields**: Choose which data to include in hash
- **Unique Outputs**: Each certificate gets a distinct hash

### Verification Process
- **Database Lookup**: Hash verification against stored certificates
- **Real-time Validation**: Instant authenticity checking
- **Audit Trail**: Complete verification logging
- **Tamper Detection**: Invalid hashes are immediately flagged

## 📊 Sample Data

The project includes sample data from the LinPack Club Event:

- **10 Sample Recipients**: Real student data with generated hashes
- **Team Structure**: Organized by team IDs
- **Registration Numbers**: VIT Bhopal student IDs
- **Event Details**: LinPack Club Event 2024

### CSV Format
```csv
Name,Email,Registration Number,Team ID,Games,Event,Date
MEHUL KHARE,mehul@example.com,24BAI10631,1,A,LinPack Club Event,2024-01-15
PRAYUSH PATEL,prayush@example.com,24BCE10488,1,A,LinPack Club Event,2024-01-15
```

## 🎨 Customization

### Template Elements
- **Text Fields**: Customizable fonts, sizes, colors, alignment
- **QR Codes**: Automatic placement with hash data
- **Images**: Background images and logos
- **Shapes**: Geometric elements for design

### Hash Configuration
- **Field Selection**: Choose which recipient data to hash
- **Event Customization**: Set event names and dates
- **Salt Protection**: Built-in security measures
- **Flexible Output**: Adapt to different use cases

## 📧 Email Integration

### Gmail API Integration
- **Python Scripts**: Ready-to-use email automation
- **Bulk Sending**: Process thousands of emails
- **Personalization**: Dynamic content replacement
- **Attachment Support**: Automatic certificate delivery

### Email Templates
- **Placeholder Support**: `{{name}}`, `{{email}}`, etc.
- **Custom Fields**: Dynamic content insertion
- **Professional Layouts**: Pre-designed templates
- **Responsive Design**: Mobile-friendly emails

## 🔍 Verification System

### QR Code Scanner
- **Web-based**: No app installation required
- **Camera Access**: Mobile and desktop support
- **File Upload**: Alternative to camera scanning
- **Instant Results**: Real-time verification

### Verification Results
- **Valid Certificates**: Complete recipient information
- **Invalid Attempts**: Clear error messages
- **Audit Trail**: Complete verification history
- **Security Logs**: Admin monitoring capabilities

## 🚀 Production Deployment

### Environment Variables
```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
DATABASE_URL=your_database_connection_string
EMAIL_API_KEY=your_email_service_key
```

### Database Setup
- Replace in-memory storage with PostgreSQL/MySQL
- Implement proper user authentication
- Add email service integration
- Set up file storage for certificates

### Security Considerations
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the demo page for examples
- Review the code documentation
- Contact the development team

## 🎯 Roadmap

### Future Enhancements
- **Advanced Templates**: More design options
- **API Integration**: RESTful API endpoints
- **Mobile App**: Native mobile applications
- **Advanced Analytics**: Detailed reporting
- **Multi-language**: Internationalization support
- **Cloud Storage**: AWS/Azure integration

---

**CertifyPro** - Professional Certificate Generation Made Simple
