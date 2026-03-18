# File Manager Access Guide

## 🎯 How to Access File Manager

### **Admin Dashboard**
1. Login as **Admin**
2. You'll see two buttons below the "Manage users and equipment" text:
   - **Product Deliveries** (Blue button)
   - **File Manager** (Gray button) ← Click this!
3. Click **File Manager** button to open the file manager

### **Manager Dashboard**
1. Login as **Manager**
2. You'll see two buttons below the "Overview of all service requests" text:
   - **Product Deliveries** (Blue button)
   - **File Manager** (Gray button) ← Click this!
3. Click **File Manager** button to open the file manager

---

## ✨ File Manager Features

Once you click the File Manager button, you'll be able to:

✅ **Upload Files**
- Click "Upload Files" button
- Select up to 10 files (max 50MB each)
- Add optional category (e.g., "invoices", "contracts")
- Add optional folder (e.g., "2024/march")
- Add optional description

✅ **View Files**
- See all uploaded files in a grid layout
- Preview images and PDFs directly
- View file details (size, type, upload date)

✅ **Organize Files**
- Filter by category
- Filter by folder
- Search files by name

✅ **Download Files**
- Click "Download" button on any file
- Files open in new tab

✅ **Delete Files**
- Click trash icon to delete
- Removes from both Cloudinary and database

---

## 📍 Direct URL Access

You can also directly navigate to:
```
http://localhost:5173/files
```
or on production:
```
https://your-domain.com/files
```

**Note:** Only Admin and Manager roles can access this page.

---

## 🔒 Access Restrictions

- ❌ **Customers** - Cannot access File Manager
- ❌ **Engineers** - Cannot access File Manager
- ✅ **Managers** - Full access
- ✅ **Admins** - Full access

---

## 📦 What's Next?

1. **Configure Cloudinary** (Required)
   - Add Cloudinary credentials to your `.env` file
   - See `CLOUDINARY_SETUP_GUIDE.md` for full setup instructions

2. **Start Using It!**
   - Upload your first file
   - Organize by categories and folders
   - Share files with your team

---

## 🎨 UI Location

### Admin Dashboard View:
```
┌─────────────────────────────────────┐
│ Admin Panel                         │
│ Manage users and equipment          │
│                                     │
│ [Product Deliveries] [File Manager] │ ← HERE!
└─────────────────────────────────────┘
```

### Manager Dashboard View:
```
┌─────────────────────────────────────┐
│ Manager Dashboard                   │
│ Overview of all service requests... │
│                                     │
│ [Product Deliveries] [File Manager] │ ← HERE!
└─────────────────────────────────────┘
```

---

**Your File Manager is now ready to use!** 🚀
