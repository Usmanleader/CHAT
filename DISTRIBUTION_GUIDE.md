# SupraChat Windows - Distribution Guide

## 🎉 Your App is Ready to Install!

### Download Location
Your installer is ready at:
```
dist\SupraChat Setup 0.0.0.exe (194 MB)
```

## 📦 Installation Instructions for End Users

### Step 1: Download the Installer
Copy `SupraChat Setup 0.0.0.exe` to your distribution location (USB, cloud, email, etc.)

### Step 2: Run the Installer
1. Double-click `SupraChat Setup 0.0.0.exe`
2. Click "Install" to proceed
3. Choose installation directory (default: `C:\Users\[Username]\AppData\Local\SupraChat`)
4. Wait for installation to complete
5. Click "Finish"

### Step 3: Launch the App
- A desktop shortcut will be created automatically
- App appears in Windows Start Menu as "SupraChat"
- Click to launch

### Step 4: First Time Setup
1. Create an account or sign in with email
2. App connects to Supabase database
3. Start chatting!

---

## 🔧 What's Included in the Installer

✅ Complete React application with Tailwind CSS  
✅ Electron wrapper for Windows desktop  
✅ All dependencies bundled (no separate installation needed)  
✅ Auto-updates support (optional, see below)  
✅ Uninstaller program  

---

## 📋 Customization Before Distribution

### Update App Details (Recommended)
Edit `package.json` before building:

```json
{
  "name": "suprachat-windows",
  "version": "1.0.0",          // Change version number
  "description": "Your description here",
  "author": "Your Name <email@example.com>",
  "build": {
    "appId": "com.suprachat.app",
    "productName": "SupraChat",
    "files": ["dist/**/*", "main.js", "preload.js", "package.json"],
    "win": {
      "target": "nsis"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

### Add Custom Icon (Optional)
1. Create a 512x512 PNG icon: `icon.png`
2. Place in project root
3. Update `package.json`:
```json
"build": {
  "win": {
    "icon": "icon.png"
  }
}
```
4. Rebuild: `npm run electron-build`

### Add App Description
```json
"build": {
  "appId": "com.company.suprachat",
  "productName": "SupraChat",
  "artifactName": "SupraChat-${version}.${ext}"
}
```

---

## 🔄 Building Updated Versions

To build new versions:

```powershell
# Update version in package.json
"version": "1.0.1"

# Rebuild
npm run electron-build

# New installer: dist\SupraChat Setup 1.0.1.exe
```

---

## 📁 Distribution Files

### Main Installer
- `dist\SupraChat Setup 0.0.0.exe` - User installer

### Additional Files Generated
- `dist\SupraChat Setup 0.0.0.exe.blockmap` - For delta updates (optional)
- `dist\win-unpacked\` - Unpacked app files (for portable version)
- `dist\builder-effective-config.yaml` - Build configuration used

### Portable Version (Optional)
If you want users to run without installing:
1. Copy entire `dist\win-unpacked\` folder
2. Create zip: `SupraChat-Portable.zip`
3. Users extract and run `SupraChat.exe`

---

## 🚀 Advanced: Setting Up Auto-Updates

To enable automatic updates for installed apps, update `package.json`:

```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "your-github-username",
    "repo": "suprachat"
  }
}
```

Then users will get automatic update notifications.

---

## 🔒 Security Checklist

Before distributing:

- [ ] Update `.env` with production Supabase credentials
- [ ] Verify Supabase RLS (Row Level Security) is enabled
- [ ] Test installation on a clean Windows PC
- [ ] Verify all features work in production build
- [ ] Sign the executable (optional but recommended)
- [ ] Create antivirus scan report (if needed)

---

## ⚠️ Common Issues & Solutions

### "App doesn't start after installation"
- Check Windows Event Viewer for error details
- Ensure .NET Framework 4.8+ is installed
- Try reinstalling with admin privileges

### "Login not working"
- Verify internet connection
- Check `.env` file has correct Supabase credentials
- Ensure Supabase database is accessible

### "Users can't create accounts"
- Verify Supabase Auth is enabled
- Check email confirmation is set up
- Ensure `profiles` table exists in database

---

## 📞 Support

For issues:
1. Check the [BUILD_RUN_GUIDE.md](BUILD_RUN_GUIDE.md)
2. Review [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
3. Check Windows Event Viewer for app errors

---

## 🎯 Version History

- **0.0.0** - Initial build (current)
  - Sign in / Sign up with email
  - Real-time chat with Supabase
  - User presence detection
  - Dark theme UI

---

**Your app is ready to distribute! 🚀**
