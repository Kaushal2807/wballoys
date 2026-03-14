# Service Management System - Frontend

A modern, responsive React application for managing service requests with role-based access control.

## 🎨 Features

- ✅ **Dark/Light Mode** - Beautiful color schemes for both themes
- ✅ **Mobile Responsive** - Works perfectly on all devices
- ✅ **Demo Login** - Pre-configured demo credentials for all 3 roles
- ✅ **Role-Based Dashboards** - Customer, Engineer, and Manager views
- ✅ **Modern UI** - Clean, attractive design using Tailwind CSS
- ✅ **Type-Safe** - Built with TypeScript
- ✅ **Fast** - Powered by Vite

## 🎓 Demo Credentials

### Customer Role
- **Email:** customer@gmail.com
- **Password:** customer123

### Engineer Role
- **Email:** engineer@gmail.com
- **Password:** engineer123

### Manager Role
- **Email:** manager@gmail.com
- **Password:** manager123

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to http://localhost:5173
   - Use any of the demo credentials above to login

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── LoadingSpinner.tsx
│   ├── auth/             # Authentication components
│   ├── customer/         # Customer-specific components
│   ├── engineer/         # Engineer-specific components
│   └── manager/          # Manager-specific components
├── contexts/
│   ├── ThemeContext.tsx  # Dark/Light mode management
│   └── AuthContext.tsx   # Authentication state
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CustomerDashboard.tsx
│   ├── EngineerDashboard.tsx
│   └── ManagerDashboard.tsx
├── services/
│   ├── api.ts            # Axios instance
│   └── authService.ts    # Auth API calls
├── types/
│   └── index.ts          # TypeScript types
├── App.tsx               # Main app component
└── main.tsx              # Entry point
```

## 🎨 Theme System

The application supports both light and dark modes:

- **Light Mode**: Clean, bright interface with blue accents
- **Dark Mode**: Easy on the eyes with slate backgrounds

Toggle between themes using the sun/moon icon in the navbar.

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1280px+)

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🎯 User Roles & Features

### Customer
- View dashboard with active requests
- Create new service requests
- Track request status
- View completion photos
- Access to 3 active requests overview

### Engineer
- View assigned jobs
- Accept/reject job assignments
- Update job status
- Upload photos
- Add work notes
- Mark jobs as completed

### Manager
- Overview of all requests
- Assign jobs to engineers
- Monitor team performance
- View urgent jobs
- Access to statistics and KPIs
- Manage engineer workload

## 🔧 Backend Integration

Currently, the frontend uses mock authentication. To integrate with the backend:

1. Update `.env` with your backend URL:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

2. Uncomment the API call in `src/services/authService.ts`
3. Comment out the mock login logic

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variable:** `VITE_API_BASE_URL`

### Deploy to Netlify

1. Push code to GitHub
2. Import repository in Netlify
3. Configure build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variable:** `VITE_API_BASE_URL`

## 🎨 Color Scheme

### Light Mode
- Primary: Blue (#3b82f6)
- Background: White (#ffffff)
- Surface: Gray 50 (#f9fafb)
- Text: Gray 900 (#111827)

### Dark Mode
- Primary: Blue 400 (#60a5fa)
- Background: Slate 950 (#0f172a)
- Surface: Slate 800 (#1e293b)
- Text: Slate 50 (#f1f5f9)

## 📦 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Toastify** - Notifications
- **Lucide React** - Icons

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Clear cache
rm -rf dist node_modules/.vite
npm install
npm run build
```

## 📝 Notes

- Backend integration is pending
- Demo login uses mock authentication
- Photos and data are currently hardcoded
- All features will be connected to API once backend is ready

## 🎓 College Project

This is a college project demonstrating:
- Full-stack development skills
- Modern React patterns
- TypeScript usage
- Responsive design
- Role-based access control
- Dark/Light theme implementation
- Clean code practices

---

## 🙏 Next Steps

1. ✅ Frontend setup complete
2. ⏳ Backend development (pending)
3. ⏳ API integration
4. ⏳ Full feature implementation
5. ⏳ Production deployment

**Tip:** Use the demo credentials from the login page to test all three user roles!
