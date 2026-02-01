## ✅ WHITE SCREEN FIX - BUILD & RUN GUIDE

### What Was Fixed
The white screen issue was caused by:
1. **main.js** was hardcoded to load from `http://localhost:3000` which didn't exist
2. **No dev vs production switching** - Electron didn't know whether to load the dev server or built files
3. **Wrong Vite port** - Changed from 3000 to standard 5173
4. **Missing error handling** - Added proper error handling and app ready states

### Installation & Setup

**1. Install Dependencies**
```powershell
cd g:\CHAT
npm install
```

### Running the App

#### Development Mode (with Hot Reload)
```powershell
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2 (wait 5-10 seconds for server to start): Start Electron
npm run electron
```

The app will load from the local dev server with hot reload support.

#### Production Mode (Packaged Executable)
```powershell
npm run electron-build
```

This will:
1. Build the React app with Vite
2. Package it with Electron Builder
3. Create a Windows installer at `dist\SupraChat Setup 0.0.0.exe`

You can then run the installer or the unpacked executable at `dist\win-unpacked\SupraChat.exe`

### Key Changes Made

**main.js**
- Added `electron-is-dev` detection
- Development: Loads from `http://localhost:5173`
- Production: Loads from `file://` protocol with built dist folder
- Added error handling and ready state management

**vite.config.ts**
- Changed dev server port to 5173
- Added proper build output configuration
- Configured dist folder as output

**package.json**
- Updated scripts with proper dev/build workflow
- Added dependencies: `electron-is-dev`, `concurrently`, `wait-on`
- Updated devDependencies

**preload.js**
- Added proper contextBridge setup
- Prepared for IPC if needed in future

### Troubleshooting

**Issue: "ERR_CONNECTION_REFUSED" when running in dev mode**
- Make sure the Vite dev server is running first (`npm run dev` in Terminal 1)
- Wait a few seconds for the server to start before running Electron
- Use `npm run electron-dev` to run both automatically

**Issue: White screen in production**
- Ensure you ran `npm run electron-build` to create the dist folder
- Check that `dist/index.html` exists
- Verify the built app loads without errors

**Issue: App crashes**
- Check the Electron console for errors
- In development mode, uncomment `win.webContents.openDevTools();` in main.js to see DevTools

### Distributing Your App

The built installer is at: `dist\SupraChat Setup 0.0.0.exe`

To customize:
- Update `package.json` `build` section with your app icon, author, etc.
- Change version number in `package.json`
- Sign the executable (optional but recommended)

### Package Configuration

The build configuration is in `package.json`:
```json
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
```

You can customize this for your needs (icon, installer behavior, etc.)
