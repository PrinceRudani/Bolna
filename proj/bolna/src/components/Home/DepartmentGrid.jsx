import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/axios";

// Departments Grid Component
const DepartmentGrid = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeDepartment, setActiveDepartment] = useState('water');

    const [departments, setDepartments] = useState([]);

    const fetchDepartmentCounts = async () => {
        try {

            setLoading(true);

            const response = await api.get(
                "/department-counts"
            );

            setDepartments(response.data);

        } catch (error) {
            console.error("Failed to fetch complaints:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartmentCounts();
    }, []);


    const handleDepartmentClick = (department) => {
        console.log("Selected department:", department.name);

        setActiveDepartment(department.id);

        navigate(`/complaints?department=${encodeURIComponent(department.name)}`);
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
            </div>
        );
    }
    return (

        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Departments Overview</h2>
                <div className="text-sm text-gray-500">
                    {departments.length} active departments
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {departments.map((department, index) => (
                    <DepartmentCard
                        key={department.id}
                        department={department}
                        isActive={activeDepartment === department.id}
                        onClick={() => handleDepartmentClick(department)}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
};


// Department Card Component
const DepartmentCard = ({ department, isActive, onClick, index }) => {
    const getDepartmentIcon = (name) => {
        const icons = {
            'Water': 'droplets',
            'Drainage': 'water',
            'Garbage/Cleanliness': 'trash-2',
            'Roads': 'road',
            'Streetlights': 'lightbulb',
            'Health & Mosquito': 'shield',
            'Encroachment': 'alert-triangle',
            'Animals (Cattle/Dogs)': 'paw-print',
            'Parks & Gardens': 'trees',
            'Fire & Emergency': 'flame',
            'Property Tax': 'credit-card',
            'Certificates': 'file-text',
            'Illegal Construction': 'building',
            'General Civic Issue': 'message-square'
        };
        return icons[name] || 'building';
    };

    // Color rotation array for light pastel backgrounds
    const colorSchemes = [
        { bg: 'bg-blue-50', border: 'border-blue-100', hoverBg: 'hover:bg-blue-100', hoverBorder: 'hover:border-blue-300', activeBg: 'bg-blue-100', iconBg: 'bg-blue-100' },
        { bg: 'bg-emerald-50', border: 'border-emerald-100', hoverBg: 'hover:bg-emerald-100', hoverBorder: 'hover:border-emerald-300', activeBg: 'bg-emerald-100', iconBg: 'bg-emerald-100' },
        { bg: 'bg-amber-50', border: 'border-amber-100', hoverBg: 'hover:bg-amber-100', hoverBorder: 'hover:border-amber-300', activeBg: 'bg-amber-100', iconBg: 'bg-amber-100' },
        { bg: 'bg-rose-50', border: 'border-rose-100', hoverBg: 'hover:bg-rose-100', hoverBorder: 'hover:border-rose-300', activeBg: 'bg-rose-100', iconBg: 'bg-rose-100' },
        { bg: 'bg-violet-50', border: 'border-violet-100', hoverBg: 'hover:bg-violet-100', hoverBorder: 'hover:border-violet-300', activeBg: 'bg-violet-100', iconBg: 'bg-violet-100' },
        { bg: 'bg-cyan-50', border: 'border-cyan-100', hoverBg: 'hover:bg-cyan-100', hoverBorder: 'hover:border-cyan-300', activeBg: 'bg-cyan-100', iconBg: 'bg-cyan-100' },
        { bg: 'bg-orange-50', border: 'border-orange-100', hoverBg: 'hover:bg-orange-100', hoverBorder: 'hover:border-orange-300', activeBg: 'bg-orange-100', iconBg: 'bg-orange-100' },
        { bg: 'bg-teal-50', border: 'border-teal-100', hoverBg: 'hover:bg-teal-100', hoverBorder: 'hover:border-teal-300', activeBg: 'bg-teal-100', iconBg: 'bg-teal-100' },
        { bg: 'bg-sky-50', border: 'border-sky-100', hoverBg: 'hover:bg-sky-100', hoverBorder: 'hover:border-sky-300', activeBg: 'bg-sky-100', iconBg: 'bg-sky-100' },
        { bg: 'bg-fuchsia-50', border: 'border-fuchsia-100', hoverBg: 'hover:bg-fuchsia-100', hoverBorder: 'hover:border-fuchsia-300', activeBg: 'bg-fuchsia-100', iconBg: 'bg-fuchsia-100' },
        { bg: 'bg-lime-50', border: 'border-lime-100', hoverBg: 'hover:bg-lime-100', hoverBorder: 'hover:border-lime-300', activeBg: 'bg-lime-100', iconBg: 'bg-lime-100' },
        { bg: 'bg-indigo-50', border: 'border-indigo-100', hoverBg: 'hover:bg-indigo-100', hoverBorder: 'hover:border-indigo-300', activeBg: 'bg-indigo-100', iconBg: 'bg-indigo-100' },
        { bg: 'bg-pink-50', border: 'border-pink-100', hoverBg: 'hover:bg-pink-100', hoverBorder: 'hover:border-pink-300', activeBg: 'bg-pink-100', iconBg: 'bg-pink-100' },
        { bg: 'bg-purple-50', border: 'border-purple-100', hoverBg: 'hover:bg-purple-100', hoverBorder: 'hover:border-purple-300', activeBg: 'bg-purple-100', iconBg: 'bg-purple-100' }
    ];

    const colors = colorSchemes[index % colorSchemes.length];

    return (
        <div
            onClick={onClick}
            className={`
                        rounded-xl border p-6 transition-all duration-300 cursor-pointer 
                        flex flex-col h-full
                        ${isActive
                    ? `border-blue-500 ${colors.activeBg} shadow-md ring-2 ring-blue-200`
                    : `${colors.bg} ${colors.border} shadow-sm ${colors.hoverBg} ${colors.hoverBorder} hover:shadow-md hover:-translate-y-1`
                }
                    `}
        >
            {/* Department Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{department.name}</h3>
                <div className={`p-2 ${colors.iconBg} rounded-lg`}>
                    <i data-lucide={getDepartmentIcon(department.name)} className="w-5 h-5 text-gray-700"></i>
                </div>
            </div>

            {/* KPI Mini Grid (2x2) */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{department.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Total</p>
                </div>
                <div className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{department.resolved.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Resolved</p>
                </div>
                <div className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{department.inProgress.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">In Progress</p>
                </div>
                <div className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{department.open.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Open</p>
                </div>
            </div>
        </div>
    );
};

export default DepartmentGrid;