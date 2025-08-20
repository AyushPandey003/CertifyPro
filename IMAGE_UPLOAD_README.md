# Image Upload in CertifyPro Editor

## 🖼️ How to Use Image Upload

The image upload functionality in the CertifyPro editor supports multiple ways to add images:

### 1. Cloud Upload (Cloudinary)
- Click the "Upload to Cloudinary" button in the Image Properties panel
- Select an image file from your computer
- Image is automatically uploaded to your Cloudinary account
- Benefits: Persistent storage, fast CDN, transformations

### 2. Local Upload (Demo)
- Click the "Choose Local Image" button in the Image Properties panel
- Select an image file from your computer (supports JPG, PNG, GIF, SVG, etc.)
- The image will be converted to a data URL and embedded in your template
- Note: Images are stored locally in your browser for demo purposes

### 3. URL Input (External Images)
- Enter a direct URL to an image in the "Image URL" field
- Supports any publicly accessible image URL
- Useful for logos or images hosted elsewhere

## 🎯 Features

- Real-time Preview: See your image immediately after selection
- Alt Text Support: Add descriptive text for accessibility
- Error Handling: Graceful fallback for broken or invalid images
- Responsive Design: Images scale properly within the canvas
- Drag & Drop: Move and resize images on the canvas
- Cloud Storage: Professional image hosting with Cloudinary
- Progress Indicators: Visual feedback during uploads
- Template Gallery: Pre-designed certificate templates

## 🚀 Cloudinary Integration

### Setup Instructions

1. Create Environment File:
```bash
# .env.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

2. Cloudinary Setup:
- Create a Cloudinary account (`https://cloudinary.com`)
- In Settings → Upload, create an unsigned upload preset for client-side uploads
- Copy your cloud name and the upload preset into `.env.local`

3. Test the Integration:
- Go to Dashboard → "Test Image Upload"
- Try uploading an image to verify everything works
- Check the console for upload details

## 📁 Technical Details

### ImageUpload Component
- Located in `components/image-upload.tsx`
- Handles file selection, URL input, and preview
- Integrates with Cloudinary for cloud storage
- Emits image data changes to parent component
- Supports multiple upload methods

### TemplateGallery Component
- Located in `components/template-gallery.tsx`
- Showcases certificate templates
- Category-based filtering and organization
- Integration with the main editor

### Editor Integration
- Images are added as `EditorElement` with type "image"
- Properties include `src`, `alt`, dimensions, and position
- Canvas renders images with proper scaling and positioning
- Properties panel allows editing of all image attributes

### File Support
- Formats: JPG, PNG, GIF, SVG, WebP, BMP
- Size: Client uploads limited by browser and Cloudinary preset
- Quality: Maintains original image quality

## 🐛 Troubleshooting

### Cloudinary Issues
- Ensure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` are set
- Verify your unsigned upload preset exists and allows image uploads
- Check browser console for detailed error messages

### Image Not Displaying
- Check if the image file is valid
- Ensure the image URL is accessible
- Try refreshing the page
- Check browser console for errors

## 🔮 What's Next
- [ ] Image compression and optimization
- [ ] Batch image upload
- [ ] Advanced image editing (crop, filters, etc.)
- [ ] Drag & drop from desktop
- [ ] Image search integration
- [ ] Template customization presets

## 🧪 Testing
Before using in production:
1. Test Upload: Verify Cloudinary uploads work
2. Test Templates: Visit `/templates` to browse certificate templates
3. Test Editor: Try adding images in the editor at `/editor`
4. Check Console: Monitor browser console for any errors
5. Verify Storage: Check Cloudinary Media Library for uploaded files

## 📚 API Endpoints
- None required for unsigned Cloudinary upload (client-side uses Cloudinary upload endpoint)

---

Note: The cloud upload functionality is now fully operational with Cloudinary. Local uploads remain available as a fallback option.
