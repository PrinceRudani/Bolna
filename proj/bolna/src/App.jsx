import { useState } from 'react'
import { BrowserRouter } from "react-router";
import './App.css'
import CallHistoryPage from './pages/Callhistory'
import SidebarNav from './components/Sidebar'
import { Routes, Route } from "react-router";
import HomeDashboard from './pages/home';
import ComplaintsDashboard from './pages/Complains';



function App() {

  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <BrowserRouter>

      <div className="min-h-screen bg-gray-50">
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        {/* Main content area */}
        <main className={`
                        min-h-screen transition-all duration-300
                        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}
                        ml-0
                    `}>
          <Routes>
            <Route index element={<HomeDashboard />} />
            <Route path="/call-history" element={<CallHistoryPage />} />
            <Route path="/complaints" element={<ComplaintsDashboard />} />
          </Routes>

        </main>
      </div>

    </BrowserRouter>
  )
}

export default App
