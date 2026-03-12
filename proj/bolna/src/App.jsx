import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router";
import './App.css'
import CallHistoryPage from './pages/Callhistory'
import SidebarNav from './components/Sidebar'
import HomeDashboard from './pages/home';
import ComplaintsDashboard from './pages/Complains';
import Login from './pages/Login';   // ← your new login page


// ── Guard: redirects to /login if no token is stored ─────────────────────────
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// ── Layout wraps every protected page (sidebar + main) ───────────────────────
function DashboardLayout() {
  const [activeTab, setActiveTab]     = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main className={`
        min-h-screen transition-all duration-300
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}
        ml-0
      `}>
        <Routes>
          <Route index                element={<HomeDashboard />}      />
          <Route path="/call-history" element={<CallHistoryPage />}    />
          <Route path="/complaints"   element={<ComplaintsDashboard />} />
        </Routes>
      </main>
    </div>
  );
}


// ── Root App ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes — everything else goes through DashboardLayout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;