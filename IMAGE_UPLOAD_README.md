# Image Upload in CertifyPro Editor

## 🖼️ How to Use Image Upload

The image upload functionality in the CertifyPro editor now supports **four ways** to add images:

### 1. **Stock Photos (Pexels) - NEW! 🎨**
- Click the "Browse Stock Photos" button in the Image Properties panel
- Browse through curated categories: Academic, Business, Achievement, Event, Professional
- Search for specific images using keywords
- **Benefits**: High-quality, free stock photos, professional templates, instant access

### 2. **Cloud Upload (UploadThing)**
- Click the "Upload to Cloud" button in the Image Properties panel
- Select an image file from your computer
- Image is automatically uploaded to UploadThing cloud storage
- **Benefits**: Persistent storage, fast loading, professional hosting

### 3. **Local Upload (Demo)**
- Click the "Choose Local Image" button in the Image Properties panel
- Select an image file from your computer (supports JPG, PNG, GIF, SVG, etc.)
- The image will be converted to a data URL and embedded in your template
- **Note**: Images are stored locally in your browser for demo purposes

### 4. **URL Input (External Images)**
- Enter a direct URL to an image in the "Image URL" field
- Supports any publicly accessible image URL
- Useful for logos, stock photos, or images hosted elsewhere

## 🎯 Features

- **Real-time Preview**: See your image immediately after selection
- **Alt Text Support**: Add descriptive text for accessibility
- **Error Handling**: Graceful fallback for broken or invalid images
- **Responsive Design**: Images scale properly within the canvas
- **Drag & Drop**: Move and resize images on the canvas
- **Cloud Storage**: Professional image hosting with UploadThing
- **Progress Indicators**: Visual feedback during uploads
- **Stock Photo Library**: Access to thousands of free Pexels images
- **Template Gallery**: Pre-designed certificate templates with stock photos

## 🚀 Pexels Integration - NEW FEATURE!

### Stock Photo Access:
- **Free High-Quality Images**: Access to Pexels' extensive library
- **Curated Categories**: Academic, Business, Achievement, Event, Professional
- **Search Functionality**: Find specific images by keywords
- **Professional Templates**: Ready-to-use certificate designs
- **Attribution**: Automatic photographer credits and licensing info

### Template Gallery:
Visit `/templates` to browse our curated collection of certificate templates:
- **Academic**: Diplomas, academic achievements, graduation certificates
- **Business**: Professional recognition, corporate awards, executive certificates
- **Achievement**: Excellence awards, innovation recognition, performance certificates
- **Event**: Participation certificates, workshop completion, event recognition

## 🚀 UploadThing Integration - NOW ACTIVE!

The cloud upload functionality is now fully integrated and ready to use!

### Setup Instructions:

1. **Create Environment File**:
   ```bash
   # Create .env.local file in your project root
   UPLOADTHING_TOKEN=your_uploadthing_token_here
   PEXELS_API_KEY=your_pexels_api_key_here
   ```

2. **Get Your API Keys**:
   - **UploadThing**: Visit [https://uploadthing.com/](https://uploadthing.com/)
   - **Pexels**: Visit [https://www.pexels.com/api/](https://www.pexels.com/api/)
   - Create accounts and get your API credentials
   - Add them to your `.env.local` file

3. **Test the Integration**:
   - Go to Dashboard → "Test Image Upload"
   - Try uploading an image to verify everything works
   - Check the console for upload details

### Current Implementation

The current implementation includes:
- **UploadThing SDK**: Full cloud storage integration
- **Pexels SDK**: Stock photo library integration
- **File Router**: Configured for image uploads (8MB max, 1 file at a time)
- **SSR Plugin**: Optimized performance with Next.js
- **Fallback Support**: Local uploads still work for demo purposes
- **Error Handling**: Comprehensive error messages and retry logic
- **Template Gallery**: Professional certificate templates with stock photos

## 📁 Technical Details

### ImageUpload Component
- Located in `components/image-upload.tsx`
- Handles file selection, URL input, and preview
- Integrates with UploadThing for cloud storage
- Integrates with Pexels for stock photos
- Emits image data changes to parent component
- Supports multiple upload methods

### PexelsImagePicker Component
- Located in `components/pexels-image-picker.tsx`
- Modal interface for browsing Pexels images
- Category-based navigation and search
- Responsive grid layout for image selection
- Automatic image attribution and licensing info

### TemplateGallery Component
- Located in `components/template-gallery.tsx`
- Showcases certificate templates with Pexels images
- Category-based filtering and organization
- Template difficulty indicators and tags
- Integration with the main editor

### Editor Integration
- Images are added as `EditorElement` with type "image"
- Properties include `src`, `alt`, dimensions, and position
- Canvas renders images with proper scaling and positioning
- Properties panel allows editing of all image attributes

### File Support
- **Formats**: JPG, PNG, GIF, SVG, WebP, BMP
- **Size**: Cloud uploads limited to 8MB, local files limited by browser memory
- **Quality**: Maintains original image quality
- **Compression**: No automatic compression applied

## 🎨 Usage Tips

1. **Stock Photos**: Use Pexels images for professional, high-quality backgrounds
2. **Cloud Uploads**: Use for production certificates and important images
3. **Local Uploads**: Use for quick testing and development
4. **Template Gallery**: Start with pre-designed templates for faster workflow
5. **Logo Placement**: Use small, high-quality logos for professional look
6. **Background Images**: Consider using large, high-resolution images
7. **File Sizes**: Keep images under 5MB for best performance
8. **Alt Text**: Always add descriptive alt text for accessibility

## 🐛 Troubleshooting

### Pexels Integration Issues
- Check if your `.env.local` file has the correct `PEXELS_API_KEY`
- Verify your Pexels account is active and has API access
- Check browser console for detailed error messages
- Ensure you have an active internet connection

### Cloud Upload Issues
- Check if your `.env.local` file has the correct `UPLOADTHING_TOKEN`
- Verify your UploadThing account is active
- Check browser console for detailed error messages
- Try the test page at `/test-upload` first

### Image Not Displaying
- Check if the image file is valid
- Ensure the image URL is accessible
- Try refreshing the page
- Check browser console for errors

### Upload Not Working
- Ensure you have selected a valid image file
- Check if the file is not corrupted
- Try a different image format
- Clear browser cache if needed

## 🔮 What's Next

- [x] Cloud storage integration (UploadThing) ✅
- [x] Stock photo integration (Pexels) ✅
- [x] Template gallery with stock photos ✅
- [ ] Image compression and optimization
- [ ] Batch image upload
- [ ] Advanced image editing (crop, filters, etc.)
- [ ] Drag & drop from desktop
- [ ] Image search integration
- [ ] Template customization presets

## 🧪 Testing

Before using in production:
1. **Test Upload**: Visit `/test-upload` to verify cloud uploads work
2. **Test Pexels**: Try browsing stock photos in the editor
3. **Test Templates**: Visit `/templates` to browse certificate templates
4. **Test Editor**: Try adding images in the editor at `/editor`
5. **Check Console**: Monitor browser console for any errors
6. **Verify Storage**: Check UploadThing dashboard for uploaded files

## 📚 API Endpoints

- **Pexels Search**: `/api/pexels/search` - Search and browse Pexels images
- **UploadThing**: `/api/uploadthing` - Handle file uploads to cloud storage

---

**Note**: The cloud upload and stock photo functionality are now fully operational. Local uploads remain available as a fallback option. All Pexels images are free to use with proper attribution.
