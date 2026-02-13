# 🎯 FocusTime - Productivity & Focus Application

A **fully offline** productivity and focus management application built with vanilla JavaScript. No backend, no cloud, just pure client-side magic with LocalStorage.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Offline](https://img.shields.io/badge/offline-100%25-orange)

## ✨ Features

### 🎯 Pomodoro Timer
- **25-minute work sessions** with 5-minute breaks
- Visual countdown timer with play/pause/reset controls
- Sound alerts when sessions complete
- Track current task while focusing
- Automatic progress tracking

### ✅ Task Manager
- Create, edit, and delete tasks
- Mark tasks as completed
- Filter between Active and Completed tasks
- Set task priority (normal/high)
- Categorize tasks
- Set due dates
- Click on task to set as current focus

### 📊 Daily Progress
- Real-time progress circle showing daily goal completion
- Track total focus time (hours and minutes)
- Count completed tasks
- Session history
- All data persists across page refreshes

### 🔐 Password Vault
- Securely store passwords (hashed with SHA-256)
- Copy passwords to clipboard
- Toggle password visibility
- Delete entries
- Search and filter passwords

### ⚙️ Settings Panel
- **Dark/Light theme** toggle
- **Accent color** customization (3 color options)
- **Language** selection (English/Turkish)
- **Export/Import** settings as JSON
- **Reset all data** option
- Password protection (optional)

## 🚀 Getting Started

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/focustime.git
   cd focustime
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The app will automatically open at `http://localhost:3000`

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Serve production build on port 8080
npm run serve
```

### Alternative: No Build Required

You can also run the app without NPM:
- Simply open `focustime.html` in your browser
- Or use Python: `python -m http.server 8000`

### File Structure

```
focustime/
├── index.html              # Main dashboard
├── focustime.html          # Pomodoro timer page
├── settings.html           # Settings page
├── password-vault.html     # Password manager
├── utilities.html          # Utilities grid
├── css/
│   └── style.css          # All styles
├── js/
│   ├── app.js             # Main application controller
│   ├── storage.js         # LocalStorage management
│   ├── tasks.js           # Task management module
│   ├── timer.js           # Pomodoro timer module
│   └── settings.js        # Settings management module
└── README.md
```

## 💾 Data Storage

All data is stored in **browser LocalStorage**:

- ✅ Tasks and task history
- ✅ Timer state and sessions
- ✅ Daily progress and statistics
- ✅ Password vault entries (hashed)
- ✅ User settings and preferences
- ✅ Activity log

**Data persists** even after:
- Page refresh
- Browser restart
- Computer restart

## 🎨 Customization

### Themes
- **Dark Mode** (default)
- **Light Mode**

### Accent Colors
- Purple (default: `#7f13ec`)
- Electric Purple (`#9d4edd`)
- Indigo (`#5a189a`)

### Timer Settings
- Customize work duration (default: 25 minutes)
- Customize break duration (default: 5 minutes)
- Enable/disable sound alerts
- Enable/disable notifications

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause timer (FocusTime page) |
| `R` | Reset timer (FocusTime page) |
| `Enter` | Add new task (in task input) |
| `Ctrl+K` | Focus search (Utilities page) |
| `ESC` | Clear search (Utilities page) |

## 🔒 Security

- **Password hashing:** All passwords are hashed using SHA-256
- **No plain text storage:** Passwords are never stored in plain text
- **Local only:** No data is ever sent to any server
- **Optional lock screen:** Protect your app with a master password

## 🌐 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

**Requirements:**
- Modern browser with ES6+ support
- LocalStorage enabled
- JavaScript enabled

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1366px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, animations
- **Tailwind CSS** - Utility-first styling (CDN)
- **Vanilla JavaScript** - No frameworks!
- **LocalStorage API** - Data persistence
- **Web Crypto API** - Password hashing
- **Material Symbols** - Icons

## 📊 Features Breakdown

### Task Management
```javascript
// Add task
Tasks.add({
    title: 'Complete project',
    category: 'Work',
    priority: 'high',
    dueDate: 'Today'
});

// Toggle completion
Tasks.toggleComplete(taskId);

// Delete task
Tasks.delete(taskId);
```

### Timer Control
```javascript
// Start timer
Timer.start();

// Pause timer
Timer.pause();

// Reset timer
Timer.reset();

// Set current task
Timer.setCurrentTask(taskId);
```

### Settings Management
```javascript
// Change theme
Settings.set('theme', 'dark');

// Change accent color
Settings.set('accentColor', '#7f13ec');

// Export all data
const data = Storage.exportData();
```

## 🐛 Known Issues

- None at the moment! 🎉

## 🔮 Future Enhancements

- [ ] PWA support (offline installation)
- [ ] Data sync across devices (optional)
- [ ] More timer presets (15/30/45 min)
- [ ] Task templates
- [ ] Weekly/monthly reports
- [ ] Dark mode auto-switch
- [ ] More accent color options
- [ ] Task tags and filters
- [ ] Pomodoro statistics


---

**Made with ❤️ and ☕ by [Your Name]**

**⭐ Star this repo if you find it useful!**
