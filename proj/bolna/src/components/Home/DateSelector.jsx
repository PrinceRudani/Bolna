import { useState } from "react";

// Date Selector Component
const DateSelector = () => {
    const [selectedDate, setSelectedDate] = useState('today');
    const dateOptions = [
        { id: 'today', label: 'Today' },
        { id: 'last7', label: 'Last 7 days' },
        { id: 'month', label: 'This month' },
        { id: 'custom', label: 'Custom' }
    ];

    return (
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
            {dateOptions.map((option) => (
                <button
                    key={option.id}
                    onClick={() => setSelectedDate(option.id)}
                    className={`
                                px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200
                                ${selectedDate === option.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                            `}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default DateSelector;
