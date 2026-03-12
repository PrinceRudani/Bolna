// ===============================================
// COMPLAINTS DASHBOARD COMPONENTS
// ===============================================
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// Status Badge Component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        'Open': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
        'In Progress': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
        'Resolved': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
        'Closed': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    };

    const config = statusConfig[status] || statusConfig.Open;

    return (
        <span className={`
                    px-3 py-1 rounded-full text-xs font-medium border
                    ${config.bg} ${config.text} ${config.border}
                `}>
            {status}
        </span>
    );
};

import { useSearchParams } from "react-router-dom";
import api from "../utils/axios";

// Complaint Filters Component

const ComplaintFilters = ({ filters, setFilters, department }) => {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);

    const fetchDepartmentCounts = async () => {
        try {

            const response = await api.get(
                "/department-counts"
            );

            setDepartments(([{ name: 'All Departments' }, ...response.data]).map(dept => dept.name));

        } catch (error) {
            console.error("Failed to fetch complaints:", error);
        }
    };

    useEffect(() => {
        fetchDepartmentCounts();
    }, []);

    const statuses = ['All Status', 'Open', 'In Progress', 'Resolved', 'Closed'];

    const areas = [
        'All Areas', 'Maninagar', 'Ghatlodia', 'Navrangpura', 'Satellite', 'Paldi',
        'Naranpura', 'Thaltej', 'Bodakdev', 'Chandkheda', 'Sabarmati', 'Ranip'
    ];

    // export and assign functionality removed per request
    const handleDepartmentClick = (department) => {
        console.log("Selected department:", department.name);
        navigate(`/complaints?department=${encodeURIComponent(department)}`);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-center gap-4">
                {/* Department Filter */}
                <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                        value={department}
                        onChange={(e) => handleDepartmentClick(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                {/* Area Filter */}
                <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area / Zone</label>
                    <select
                        value={filters.area}
                        onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {areas.map(area => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* Date Range */}
                <div className=" min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* action buttons removed */}
            </div>
        </div>
    );
};


// Complaints Table Component
const ComplaintsTable = ({ complaints, onRowClick, nameMasked, toggleNameMask, loading }) => {

    const maskName = (name) => {
        if (!nameMasked) return name;
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0].charAt(0)}**** ${parts[1]}`;
        }
        return `${name.charAt(0)}****`;
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    Name
                                    <button
                                        onClick={toggleNameMask}
                                        className="text-gray-400 hover:text-gray-600"
                                        title={nameMasked ? "Show full names" : "Mask names"}
                                    >
                                        <i data-lucide={nameMasked ? "eye-off" : "eye"} className="w-4 h-4"></i>
                                    </button>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Area
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Complaint Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Transcript
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Token
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned To
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">

                        {loading ? (
                            <tr>
                                <td colSpan="8" className="py-10 text-center">
                                    <div className="flex justify-center items-center gap-3 text-blue-600">
                                        <svg
                                            className="animate-spin h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            ></path>
                                        </svg>
                                        <span className="font-medium">Loading complaints...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : complaints.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-10 text-center text-gray-500">
                                    No complaints found
                                </td>
                            </tr>
                        ) : (
                            complaints.map((complaint) => (
                                <tr
                                    key={complaint.id}
                                    onClick={() => onRowClick(complaint)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {complaint.department}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {maskName(complaint.reporter.name)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {complaint.area}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {complaint.complaint_type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                        <div className="truncate">
                                            {complaint.transcript_preview}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                        {complaint.token}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={complaint.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {complaint.assigned_to}
                                    </td>
                                </tr>
                            ))
                        )}

                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Table Pagination Component
const TablePagination = ({
    totalEntries,
    currentPage,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage
}) => {
    const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
    const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(totalEntries, currentPage * rowsPerPage);

    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    if (endPage - startPage < maxPageButtons - 1) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i += 1) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                    value={rowsPerPage}
                    onChange={(e) => onChangeRowsPerPage(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {[5, 10, 20, 50].map((value) => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </select>
            </div>

            <div className="text-sm text-gray-600">
                Showing {startIndex} to {endIndex} of {totalEntries} entries
            </div>

            <div className="flex items-center gap-1">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onChangePage(currentPage - 1)}
                    className="px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    &lt;
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => onChangePage(1)}
                            className="px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="px-2 text-gray-400">…</span>}
                    </>
                )}

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => onChangePage(page)}
                        className={`px-3 py-1 rounded-md border border-gray-200 ${page === currentPage
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-2 text-gray-400">…</span>}
                        <button
                            onClick={() => onChangePage(totalPages)}
                            className="px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onChangePage(currentPage + 1)}
                    className="px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

// Complaint Modal Component
const ComplaintModal = ({ complaint, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [isPlaying, setIsPlaying] = useState(false);

    const tabs = [
        { id: 'summary', label: 'Summary', icon: 'info' },
        { id: 'transcript', label: 'Full Transcript', icon: 'message-square' },
        { id: 'audio', label: 'Audio Player', icon: 'volume-2' },
        { id: 'actions', label: 'Actions', icon: 'settings' },
        { id: 'history', label: 'History', icon: 'history' }
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        console.log('Audio playback toggled');
    };

    if (!complaint) return null;

    return (
        <div className={`
                    fixed inset-0 z-50 overflow-hidden transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 backdrop-blur-xs bg-opacity-50"
                onClick={onClose}
            ></div>

            {/* Modal Panel */}
            <div className={`
                        absolute right-0 top-0 h-full w-full lg:w-2/5 bg-white shadow-2xl
                        transition-transform duration-300 ease-in-out
                        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    `}>
                {/* Modal Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{complaint.token}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Reported {formatDate(complaint.created_at)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <i data-lucide="x" className="w-5 h-5 text-gray-500"></i>
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <StatusBadge status={complaint.status} />
                        <div className="text-sm text-gray-500">
                            <i data-lucide="clock" className="w-4 h-4 inline mr-1"></i>
                            2h 15m ago
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                            flex items-center gap-2 px-6 py-3 border-b-2 whitespace-nowrap
                                            ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }
                                        `}
                            >
                                <i data-lucide={tab.icon} className="w-4 h-4"></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6 overflow-y-auto h-[calc(100vh-200px)]">
                    {/* Summary Tab */}
                    {activeTab === 'summary' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Reporter Name</p>
                                    <p className="font-medium">{complaint.reporter.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{complaint.reporter.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="font-medium">{complaint.department}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Area</p>
                                    <p className="font-medium">{complaint.area}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Complaint Type</p>
                                    <p className="font-medium">{complaint.complaint_type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Assigned Team</p>
                                    <p className="font-medium">{complaint.assigned_to}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-700 mb-2">Priority Assessment</h4>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-sm font-medium">High Priority</span>
                                    <span className="text-xs text-gray-500 ml-auto">Based on multiple factors</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transcript Tab */}
                    {activeTab === 'transcript' && (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Full Conversation Transcript</h4>
                            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                                <pre className="whitespace-pre-wrap max-h-96 overflow-y-auto">
                                    {complaint.transcript}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Audio Tab */}
                    {activeTab === 'audio' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i data-lucide="volume-2" className="w-12 h-12 text-blue-500"></i>
                                </div>
                                <h4 className="font-medium text-gray-700 mb-2">Call Recording</h4>
                                <p className="text-sm text-gray-500">Duration: 3:42</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-4">
                                    <button className="p-3 hover:bg-gray-100 rounded-full">
                                        <i data-lucide="skip-back" className="w-5 h-5"></i>
                                    </button>
                                    <button
                                        onClick={togglePlay}
                                        className="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                    >
                                        <i data-lucide={isPlaying ? "pause" : "play"} className="w-6 h-6"></i>
                                    </button>
                                    <button className="p-3 hover:bg-gray-100 rounded-full">
                                        <i data-lucide="skip-forward" className="w-5 h-5"></i>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-1/3"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>1:12</span>
                                        <span>3:42</span>
                                    </div>
                                </div>

                                <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <i data-lucide="download" className="w-4 h-4"></i>
                                    Download Recording
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Actions Tab */}
                    {activeTab === 'actions' && (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Available Actions</h4>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                                    <i data-lucide="users" className="w-6 h-6 text-gray-600 mx-auto mb-2"></i>
                                    <p className="text-sm font-medium">Reassign</p>
                                    <p className="text-xs text-gray-500">Change team</p>
                                </button>
                                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                                    <i data-lucide="check-circle" className="w-6 h-6 text-gray-600 mx-auto mb-2"></i>
                                    <p className="text-sm font-medium">Mark Resolved</p>
                                    <p className="text-xs text-gray-500">Close complaint</p>
                                </button>
                                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                                    <i data-lucide="message-square" className="w-6 h-6 text-gray-600 mx-auto mb-2"></i>
                                    <p className="text-sm font-medium">Add Note</p>
                                    <p className="text-xs text-gray-500">Internal comment</p>
                                </button>
                                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
                                    <i data-lucide="alert-circle" className="w-6 h-6 text-gray-600 mx-auto mb-2"></i>
                                    <p className="text-sm font-medium">Escalate</p>
                                    <p className="text-xs text-gray-500">Higher priority</p>
                                </button>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Add Internal Note
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Add notes about this complaint..."
                                ></textarea>
                                <button className="mt-2 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    Save Note
                                </button>
                            </div>
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Timeline History</h4>

                            <div className="space-y-4">
                                {[
                                    { time: '30m ago', action: 'Note added by Field Team A', user: 'Rajesh Kumar' },
                                    { time: '2h ago', action: 'Assigned to Field Team A', user: 'System' },
                                    { time: '2h 15m ago', action: 'Status changed to In Progress', user: 'AI Assistant' },
                                    { time: '2h 30m ago', action: 'Complaint logged via AI Chat', user: 'Sahana AI' }
                                ].map((item, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            {index < 3 && <div className="w-0.5 h-12 bg-gray-200"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{item.action}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-500">{item.user}</p>
                                                <span className="text-xs text-gray-400">•</span>
                                                <p className="text-xs text-gray-400">{item.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// Complaints Dashboard Component
const ComplaintsDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        area: 'All Areas',
        status: 'All Status',
        fromDate: '',
        toDate: ''
    });

    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [nameMasked, setNameMasked] = useState(false);
    const [complaintsData, setComplaintsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const API_BASE = import.meta.env.VITE_BASE_URL;
    const department = searchParams.get("department")
    const fetchComplaints = async () => {

        try {

            setLoading(true);

            let response;

            if (department === "All Departments" || !department) {

                response = await api.get("/ai-summary", {
                    headers: { accept: "application/json" }
                });

            } else {

                response = await api.post(
                    "/ai-summary-by-department",
                    {
                        department: department,
                        page_number: 1,
                        page_size: 50
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            accept: "application/json"
                        }
                    }
                );
            }

            const raw = response.data;
            console.log("Raw API Response:", response);
            const list = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.data)
                    ? raw.data
                    : Array.isArray(raw?.results)
                        ? raw.results
                        : [];
            console.log("Extracted Complaints List:", list);
            const mapped = list.map((item) => {
                const transcript = item.transcript || "";

                return {
                    id: item.id,
                    token: item.related_execution_id || `CMP-${item.id}`,
                    department: item.complaint_type || "General",
                    reporter: {
                        name: item.reporter_name || "Unknown",
                        phone: item.reporter_phone || ""
                    },
                    area: item.area || "",
                    complaint_type: item.complaint_type || "",
                    transcript,
                    transcript_preview:
                        transcript.length > 140
                            ? `${transcript.slice(0, 140)}...`
                            : transcript,
                    status: "Open",
                    assigned_to: item.assigned_to || "Unassigned",
                    created_at: item.created_at || item.inserted_at
                };
            });

            setComplaintsData(mapped);

        } catch (error) {
            console.error("Failed to fetch complaints:", error);
        } finally {
            setLoading(false);
        }
    };
    // Fetch complaints when page loads OR department filter changes
    useEffect(() => {
        fetchComplaints();
    }, [department]);

    const totalEntries = complaintsData.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, rowsPerPage, totalEntries]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedComplaints = complaintsData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <div className="">
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Complaints — Department-wise
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Municipal Operations View
                        </p>
                    </div>

                    <div className="mt-4 lg:mt-0">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                                <div className="text-sm font-medium">
                                    Total Complaints
                                </div>
                                <div className="text-2xl font-bold">
                                    {totalEntries}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ComplaintFilters filters={filters} department={department} setFilters={setFilters} />
            <ComplaintsTable
                complaints={paginatedComplaints}
                onRowClick={setSelectedComplaint}
                nameMasked={nameMasked}
                toggleNameMask={() => setNameMasked(!nameMasked)}
                loading={loading}
            />

            <TablePagination
                totalEntries={totalEntries}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                onChangePage={setCurrentPage}
                onChangeRowsPerPage={(value) => {
                    setRowsPerPage(value);
                }}
            />

            <ComplaintModal
                complaint={selectedComplaint}
                isOpen={!!selectedComplaint}
                onClose={() => setSelectedComplaint(null)}
            />
        </div>
    );
};

export default ComplaintsDashboard;
