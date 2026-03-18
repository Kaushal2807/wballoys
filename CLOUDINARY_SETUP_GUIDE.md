# Cloudinary File Manager Setup Guide - 100% FREE!

## ✨ Overview
Your File Manager now uses **Cloudinary** instead of Firebase Storage! Cloudinary offers:

✅ **25 GB FREE Storage** (5x more than Firebase!)
✅ **25 GB/month Bandwidth** FREE
✅ **NO Payment Method Required**
✅ **NO Credit Card Required**
✅ **Automatic Image Optimization**
✅ **Built-in CDN** for fast file delivery

---

## 🚀 Step-by-Step Setup (5 Minutes)

### Step 1: Create FREE Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Click **"Sign Up for Free"**
3. Fill in your details:
   - Name
   - Email
   - Password
4. Check your email and **verify your account**
5. Done! Your account is ready (no payment method needed!)

---

### Step 2: Get Your Cloudinary Credentials

Once logged in to your Cloudinary dashboard:

1. You'll see your **Dashboard** with a section called **"Account Details"**
2. Copy these three values:
   ```
   Cloud Name: xxxxxxxxxx
   API Key: xxxxxxxxxxxxxxxxxx
   API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**Screenshot Location:**
- Top of dashboard → "Product Environment Credentials"
- Or click your profile icon → "Settings" → "Access Keys"

---

### Step 3: Update Your `.env` File

Open `backend/.env` and update these lines:

```env
# Cloudinary Configuration (for File Storage - 25GB FREE!)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Replace with your actual values from Step 2!**

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dz1a2b3c4
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcd1234efgh5678ijkl9012mnop3456
```

---

### Step 4: Restart Your Backend

```bash
cd /home/kaushal/Desktop/wb_alloys

# Stop current containers
docker-compose down

# Start with new Cloudinary configuration
docker-compose up -d

# Check logs to ensure it started successfully
docker-compose logs backend
```

---

## 🎯 You're Done! Start Uploading Files

1. **Login** as Admin or Manager
2. Click **"File Manager"** button on dashboard
3. Click **"Upload Files"**
4. Select files and upload!

All files will now be stored in your FREE Cloudinary account! 🎉

---

## 📁 File Storage Structure

Your files will be organized in Cloudinary like this:

```
wb_alloys/
  ├── uploads/           # Default folder
  ├── documents/         # Custom category
  ├── invoices/          # Custom category
  ├── contracts/         # Custom folder
  │   └── 2024/
  └── images/
```

---

## 💰 Free Tier Limits (Very Generous!)

| Feature | FREE Tier | Notes |
|---------|-----------|-------|
| Storage | **25 GB** | More than enough! |
| Bandwidth | **25 GB/month** | Very generous |
| Transformations | **25,000/month** | Image resizing, etc. |
| File Size | **100 MB/file** | Large files supported |
| Storage Credits | **25 credits** | Per month |

**You won't hit these limits** unless you're storing thousands of large files!

---

## 🔒 Security Features

✅ **Secure HTTPS URLs** - All files served over HTTPS
✅ **Access Control** - Only Admin/Manager can upload
✅ **Database Tracking** - All file metadata in PostgreSQL
✅ **Automatic Backups** - Cloudinary handles backups
✅ **DDoS Protection** - Built-in CDN protection

---

## 🎨 File Types Supported

✅ **Images** - JPG, PNG, GIF, WebP, SVG
✅ **Documents** - PDF, DOC, DOCX, XLS, XLSX
✅ **Videos** - MP4, MOV, AVI (up to 100MB)
✅ **Archives** - ZIP, RAR
✅ **Any File Type** - Up to 100MB per file

---

## 🛠️ Features You Get

### File Manager Features:
- ✅ Multi-file upload (up to 10 files at once)
- ✅ Organize by categories and folders
- ✅ Preview images and PDFs
- ✅ Download files
- ✅ Delete files
- ✅ Search and filter files
- ✅ File size and type validation

### Cloudinary Bonus Features:
- ✅ Automatic image optimization
- ✅ CDN delivery (files load faster worldwide)
- ✅ Image transformations (crop, resize, format conversion)
- ✅ Video transcoding
- ✅ Automatic format detection

---

## 📊 Cloudinary vs Firebase Comparison

| Feature | Cloudinary (FREE) | Firebase (FREE) |
|---------|-------------------|-----------------|
| Storage | **25 GB** | 5 GB |
| Bandwidth | **25 GB/month** | 1 GB/day |
| Payment Method | **NOT Required** | Required |
| Credit Card | **NOT Required** | Required |
| Max File Size | **100 MB** | 10 MB (default) |
| CDN | **Included** | Extra cost |
| Image Optimization | **Included** | Extra cost |

**Cloudinary is the clear winner!** 🏆

---

## 🧪 Testing Your Setup

### Test 1: Upload a File
1. Login as Admin/Manager
2. Go to File Manager
3. Upload a small image (< 1MB)
4. You should see it appear in the file list
5. Click "View" to preview
6. Click "Download" to test download

### Test 2: Check Cloudinary Dashboard
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Login to your account
3. Click "Media Library"
4. You should see your uploaded file in the `wb_alloys/` folder

### Test 3: Delete a File
1. Click trash icon on a test file
2. Confirm deletion
3. Check Cloudinary Media Library - file should be removed

---

## 🐛 Troubleshooting

### Issue: "Failed to upload file"
**Solution:**
1. Check `.env` file has correct Cloudinary credentials
2. Restart backend: `docker-compose restart backend`
3. Check backend logs: `docker-compose logs backend`

### Issue: "Invalid credentials"
**Solutions:**
1. Double-check Cloud Name, API Key, and API Secret
2. Make sure you copied them correctly (no extra spaces)
3. Verify your Cloudinary account is verified (check email)

### Issue: "File size exceeds limit"
**Solution:**
- Current limit is 50MB per file (backend setting)
- Cloudinary supports up to 100MB
- To increase, edit `backend/app/routers/files.py` line 35

### Issue: Files not appearing in Cloudinary dashboard
**Solution:**
1. Go to Cloudinary → Media Library
2. Navigate to folder: `wb_alloys/uploads/`
3. Files are there but may be in subfolders

---

## 📈 Monitoring Your Usage

### Check Your Cloudinary Usage:
1. Login to [https://cloudinary.com](https://cloudinary.com)
2. Dashboard shows:
   - Storage used (out of 25 GB)
   - Bandwidth used (out of 25 GB/month)
   - Transformations used

### You'll get email alerts if you approach limits!

---

## 🎓 Pro Tips

### Tip 1: Organize Files by Category
Use meaningful categories when uploading:
- `invoices` - Customer invoices
- `contracts` - Legal documents
- `reports` - Monthly/annual reports
- `assets` - Company assets

### Tip 2: Use Folders for Projects
Organize by year/month or project:
- `2024/january`
- `projects/client-a`
- `equipment/manuals`

### Tip 3: Add Descriptions
For important files, add descriptions to help find them later

### Tip 4: Regular Cleanup
Periodically delete old/unused files to stay within free tier

---

## 🆙 Upgrading (Optional)

If you ever need more than 25GB:

**Cloudinary Plus Plan** - $99/month
- 280 GB storage
- 280 GB bandwidth
- Still way cheaper than Firebase!

But for most projects, **FREE tier is more than enough!** 🎉

---

## 🔐 Security Best Practices

1. ✅ **Keep API credentials secret** - Don't commit `.env` to git
2. ✅ **Use environment variables** - Already configured!
3. ✅ **Restrict access** - Only Admin/Manager can upload
4. ✅ **Monitor usage** - Check Cloudinary dashboard monthly
5. ✅ **Enable 2FA** - In Cloudinary account settings

---

## 📞 Support

### Cloudinary Support:
- Documentation: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
- Community Forum: [https://community.cloudinary.com](https://community.cloudinary.com)
- Support: [https://support.cloudinary.com](https://support.cloudinary.com)

### Your File Manager:
- Backend API: `http://localhost:8000/docs`
- Frontend: `http://localhost:5173/files`
- Check logs: `docker-compose logs backend`

---

## ✅ Quick Start Checklist

- [ ] Created FREE Cloudinary account (no payment needed!)
- [ ] Verified email address
- [ ] Copied Cloud Name, API Key, API Secret
- [ ] Updated `backend/.env` file
- [ ] Restarted backend: `docker-compose restart backend`
- [ ] Logged in as Admin/Manager
- [ ] Tested file upload
- [ ] Checked Cloudinary Media Library
- [ ] Tested file download and delete

---

## 🎉 Congratulations!

Your File Manager is now powered by **Cloudinary** with:
- ✅ 25 GB FREE storage
- ✅ No payment method required
- ✅ No credit card required
- ✅ Fast CDN delivery
- ✅ Automatic image optimization

**Start uploading your files now!** 🚀

---

## 🔄 What Changed?

### Backend Changes:
- ✅ Created `backend/app/utils/cloudinary.py`
- ✅ Updated `backend/app/routers/files.py` to use Cloudinary
- ✅ Added Cloudinary credentials to `.env`

### No Frontend Changes Needed!
Your frontend already works perfectly with Cloudinary! 🎯

---

**Need help?** Check the troubleshooting section or backend logs!
