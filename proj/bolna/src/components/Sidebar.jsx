import { ClipboardList, Home, MessageSquare, Phone } from "lucide-react";
import { NavLink } from "react-router-dom";

const SidebarNav = ({ sidebarOpen, setSidebarOpen }) => {
    const menuItems = [
        { id: 'home', path: '/', label: 'Home', icon:<Home className="w-5 h-5" /> },
        { id: 'complaints', path: '/complaints', label: 'Complaints (Department-wise)', icon: <ClipboardList className="w-5 h-5" /> },
        { id: 'call-history', path: '/call-history', label: 'Call History', icon: <Phone className="w-5 h-5" /> }
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="bg-white p-2 rounded-lg shadow-md"
                >
                    <i data-lucide="menu" className="w-5 h-5"></i>
                </button>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`
                fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 
                shadow-lg z-40 transition-transform duration-300 flex flex-col
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>

                {/* Logo Section */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <MessageSquare  className="text-white w-6 h-6"></MessageSquare>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Sahana AI</h1>
                            <p className="text-sm text-gray-500">Chat Assistant</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <NavLink
                                    to={item.path}
                                    end={item.path === "/"}
                                    className={({ isActive }) =>
                                        `
                                        w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-lg 
                                        transition-colors duration-200
                                        ${isActive
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }
                                        `
                                    }
                                    onClick={() => setSidebarOpen(false)}
                                >   
                                <div className="flex size-6 items-center justify-center">{item.icon}</div>
                                    <span className="font-medium text-left">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <i data-lucide="user" className="text-gray-600 w-5 h-5"></i>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">Municipal Admin</p>
                            <p className="text-sm text-gray-500">Ahmedabad Corporation</p>
                            <p className="text-xs text-gray-400 mt-1">14 Departments Active</p>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default SidebarNav;  