import { useState } from "react";

const TopHeader = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sahana AI Chat Assistant</h1>
                    <p className="text-gray-600 mt-1">Municipal Dashboard — Ahmedabad</p>
                </div>

                <div className="mt-4 lg:mt-0">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by phone / token / name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full lg:w-80 pl-10 pr-4 py-3 bg-gray-100 rounded-lg border border-gray-200 
                                             focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        />
                        <i data-lucide="search" className="absolute left-3 top-3.5 text-gray-400 w-5 h-5"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopHeader;