import { ArrowDown, ArrowUp, ArrowUpDown, CassetteTape, ChevronLeft, ChevronRight, ClipboardCopy, Download, Play, Search, X } from "lucide-react";
import { use, useEffect, useMemo } from "react";
import { useState } from "react";
import api from "../utils/axios";

const StatusBadge = ({ status }) => {
  if (status === "Completed") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      {status}
    </span>
  );
};

// Search Bar Component
const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search by execution id"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm"
      />
    </div>
  );
};

// Recording Card Component
const RecordingCard = ({ data }) => {




  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const url = data?.telephony_data?.recording_url;

        if (!url) return;

        const response = await api.get(url, {
          responseType: "blob",   // Important for audio
        });

        const blobUrl = URL.createObjectURL(response.data);

        setAudioUrl(blobUrl);

      } catch (err) {
        console.error(
          "Error fetching audio:",
          err.response?.data || err.message
        );
      }
    };

    fetchAudio();

    // Cleanup to prevent memory leaks
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };

  }, [data?.telephony_data?.recording_url]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Recording</h3>
        <div className="flex space-x-2">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ClipboardCopy className="h-4 w-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="flex-shrink-0 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors shadow-md">
          <Play className="h-5 w-5 fill-current" />
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>0:00</span>
            <span>1:12</span>
          </div>
          <div className="h-12 flex items-center justify-center space-x-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="waveform-bar w-1 bg-blue-300 rounded-full"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



// Transcript Chat Component
const TranscriptChat = ({ transcript }) => {

  const messages = useMemo(() => {
    if (!transcript) return [];

    return transcript
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        if (line.toLowerCase().startsWith("assistant:")) {
          return {
            role: "assistant",
            content: line.replace(/assistant:/i, "").trim(),
          };
        }
        if (line.toLowerCase().startsWith("user:")) {
          return {
            role: "user",
            content: line.replace(/user:/i, "").trim(),
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [transcript]);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Transcript</h3>

      <div className="space-y-4">
        {/* Assistant Message */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"
              }`}
          >
            <div
              className={`max-w-[75%] px-2 text-left py-2 rounded-2xl text-sm shadow-sm ${msg.role === "assistant"
                  ? "bg-white border border-gray-200 text-gray-800"
                  : "bg-slate-100"
                }`}
            >
              <h2 className="font-medium text-base text-left text-gray-700 mb-1">{msg.role === "assistant" ? "Assistant" : "User  "}</h2>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Conversation Drawer Component
const ConversationDrawer = ({ isOpen, onClose, data }) => {


  if (!data) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 drawer-overlay ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-gray-50 z-50 shadow-2xl drawer-panel transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto scrollbar-hide`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">Conversation data</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              <span className="font-medium">{data.id}</span>
              <button className="hover:text-blue-600 transition-colors">
                <ClipboardCopy className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* <RecordingCard data={data} /> */}
          <TranscriptChat transcript={data.transcript} />
        </div>
      </div>
    </>
  );
};

// Call Table Component
const CallTable = ({ data, sortConfig, onSort, onOpenConversation }) => {
  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return <ArrowUpDown />;
    return sortConfig.direction === 'asc' ?
      <ArrowUp className="h-3.5 w-3.5 text-blue-600 ml-1" /> :
      <ArrowDown className="h-3.5 w-3.5 text-blue-600 ml-1" />;
  };

  const SortableHeader = ({ column, children }) => {
    const isSortable = ['duration', 'timestamp', 'cost'].includes(column);
    return (
      <th
        className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${isSortable ? 'cursor-pointer hover:bg-gray-200 transition-colors' : ''}`}
        onClick={() => isSortable && onSort(column)}
      >
        <div className="flex items-center">
          {children}
          {isSortable && getSortIcon(column)}
        </div>
      </th>
    );
  };


  return (
    <div className="w-full overflow-x-auto border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            {/* <SortableHeader column="executionId">Execution ID</SortableHeader> */}
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Execution ID</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User Number</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Conversation Type</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration (s)</th>
            {/* <SortableHeader column="duration">Duration (s)</SortableHeader> */}
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hangup By</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
            {/* <SortableHeader column="timestamp">Timestamp</SortableHeader> */}
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Conversation Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row) => (

            <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-150 group">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                {row.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {row.user_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                {row.telephony_data?.call_type || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {row.telephony_data?.duration || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {row.telephony_data?.hangup_by || 'N/A'}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {formatWithISTOffset(row.updated_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onOpenConversation(row)}
                  className="inline-flex flex-col items-start px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-lg transition-all duration-200 group/btn"
                >
                  <span className="font-semibold flex items-center">
                    Recordings
                    <CassetteTape className="w-5 ml-3" />
                  </span>
                  <span className="text-blue-600/80 text-[10px]">transcripts, etc</span>
                </button>
              </td>
              {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                {row.traceData}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                {row.rawData}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const CallHistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [callData, setCallData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const payload = {"agent_id":"d8926378-e9cd-49ec-9b36-000c8bb4e48b","from":"2026-02-10T18:30:00.000Z","to":"2026-03-11T18:29:59.999Z","page_number":1,"page_size":100}

  // ✅ API Call
  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post(
          `agent/${payload.agent_id}/metrics`,
          payload
        );

        setCallData(response.data || []);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();
  }, []);

  // ✅ Filter + Sort
  const processedData = useMemo(() => {
    let data = [...(callData?.data?.executions || [])];
    // let data = []
    // console.log(callData)
    // Search
    if (searchQuery) {
      data = data.filter(
        (row) =>
          row.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.user_number?.includes(searchQuery)
      );
    }

    // Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [callData, searchQuery, sortConfig]);

  // ✅ Pagination
  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  const paginatedData = processedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleOpenConversation = (data) => {
    setSelectedConversation(data);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedConversation(null), 300);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 space-y-4 sm:space-y-0">
            <div className="flex flex-col space-y-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Sahana AI Chat Assistant
              </h1>
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full ">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Loading */}
          {loading && (
            <div className="p-6 text-center text-gray-500">
              Loading call history...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-6 text-center text-red-500">
              {typeof error === "string" ? error : "Something went wrong"}
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <CallTable
                data={paginatedData}
                sortConfig={sortConfig}
                onSort={handleSort}
                onOpenConversation={handleOpenConversation}
              />

              {/* Pagination */}
              <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="form-select rounded-lg border-gray-300 text-sm bg-gray-50 py-1.5 pl-3 pr-8"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>

                  <span className="ml-4">
                    Showing{" "}
                    {(currentPage - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * rowsPerPage,
                      processedData.length
                    )}{" "}
                    of {processedData.length} entries
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    <ChevronLeft />
                  </button>

                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === i + 1
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100 text-gray-700"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Drawer */}
      <ConversationDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        data={selectedConversation}
      />
    </div>
  );
};


export default CallHistoryPage;




// const formatWithISTOffset = (utcDateString) => {
export const formatWithISTOffset = (utcString) => {
  if (!utcString) return "";

  // Ensure UTC interpretation
  const utcDate = new Date(
    utcString.endsWith("Z") ? utcString : utcString + "Z"
  );

  // Add 5 hours 30 minutes (IST offset)
  const istDate = new Date(
    utcDate.getTime() + (5.5 * 60 * 60 * 1000)
  );

  const formatted = istDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  return `${formatted} IST`;
};