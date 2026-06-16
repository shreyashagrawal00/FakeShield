import { useState, useEffect, useRef } from "react";
import { uploadVideo } from "../api";

const DEFAULT_HISTORY = [
  {
    id: "1",
    filename: "interview_raw_002.mp4",
    time: "12m ago",
    size: "4.2MB",
    result: "FAKE",
    confidence: 0.94,
    previewUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYdc224J1TY25ZpwiDXMcbJw7vlPdmgOq_Y3k32VvEIfJ6OicJS3lNKptcD1LHK8YzqoYdaE40ZTnkhbUO80TAij1COMmWYlD8FbHKA4roF2fwhzRLIrEoA000C5GNKFGvd0mdvLFQFAR_FV-FDZvJTLVX9pQIp56gQiPsxVpoKgrEJul6gPqDFzbP5ju-v_jB3p3WrSrtjDzVgQz-mPKO-jafAPNauks-PoMIswMGHGzTGB6RkVFxb5aAFFp1cgBNXyMLQSCY_hU"
  },
  {
    id: "2",
    filename: "ceo_announcement.png",
    time: "2h ago",
    size: "1.1MB",
    result: "REAL",
    confidence: 0.00, // 0.00 probability of fake = 100% real
    previewUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbiWVjMyATlNetmA70jDCNfMOPrkk0VRcneUaU2JjoABOJcZXdEAB3JRDnIop7D-uRG1TGIfEPnP871nsTBkhHrvLfR6jZ_TALMpecopWcsLX-ZtgSMvuMZv7DgZM7nJCLGkwru8scywm8VyUg0FkmwrYvoROubI_LBPGeGLCggLoc7MW7RBIeIv1vARlGLiOk7ZYuYClvul21AwgMFSBcHVqhdKPZSjNaAzvYpilNaxG_nPd0Cp6iK-ilDZnmpUVfoz7Gtdwsggw"
  },
  {
    id: "3",
    filename: "security_cam_alpha.mov",
    time: "5h ago",
    size: "156MB",
    result: "REAL",
    confidence: 0.01, // 0.01 probability of fake = 99% real
    previewUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7b-hdXfbzdTa_GupCUE6LvuCawVTkTFUJxArCQdDFGqbDMD50znm8CDHt2udr8-N3ZNeMrkBCm_TUeWUaSyWiQcJOkeg1d50uFwNpGBBsVwbSzwOue0aFEbA5Ovl1EIBK0N6PuX_1Kbf7MmGRnJZ8_iQmSGVJRJD19AKVUMZOUij1rcbp4z8aHQ7qQRP2IUOabxqg4LLWCvwp7lGob2kbSUkyuhISHNPVq3KYJ0FaPyoqQ66jSIQq97DINdjT42sJ8wNsP54o_Zk"
  }
];

function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalScanned: 12842, fakesBlocked: 431 });

  const fileInputRef = useRef(null);

  // Load history & stats from LocalStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("fakeshield_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        setHistory(DEFAULT_HISTORY);
      }
    } else {
      setHistory(DEFAULT_HISTORY);
      localStorage.setItem("fakeshield_history", JSON.stringify(DEFAULT_HISTORY));
    }

    const savedStats = localStorage.getItem("fakeshield_stats");
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        // Keep default
      }
    } else {
      localStorage.setItem("fakeshield_stats", JSON.stringify({ totalScanned: 12842, fakesBlocked: 431 }));
    }
  }, []);

  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const analyzeVideo = async (selectedFile) => {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);
    setProgress(0);

    // Simulate progress while uploading and running tensorflow prediction
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          return prev + Math.floor(Math.random() * 8) + 2;
        } else if (prev < 98) {
          return prev + 1;
        }
        return prev;
      });
    }, 150);

    try {
      const data = await uploadVideo(selectedFile);
      clearInterval(progressInterval);
      setProgress(100);

      // Brief delay at 100% for smooth visual transition
      setTimeout(() => {
        setResult(data);
        setLoading(false);

        // Update statistics
        setStats((prev) => {
          const newTotal = prev.totalScanned + 1;
          const newFakes = data.result === "FAKE" ? prev.fakesBlocked + 1 : prev.fakesBlocked;
          const updated = { totalScanned: newTotal, fakesBlocked: newFakes };
          localStorage.setItem("fakeshield_stats", JSON.stringify(updated));
          return updated;
        });

        // Add to history
        const newHistoryItem = {
          id: Date.now().toString(),
          filename: selectedFile.name,
          time: "Just now",
          size: formatBytes(selectedFile.size),
          result: data.result,
          confidence: data.confidence,
          previewUrl: null
        };
        setHistory((prev) => {
          const updated = [newHistoryItem, ...prev];
          localStorage.setItem("fakeshield_history", JSON.stringify(updated));
          return updated;
        });
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
      alert("Error analyzing video: " + (err.response?.data?.detail || err.message));
      console.error(err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      analyzeVideo(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      analyzeVideo(selectedFile);
    }
  };

  const triggerFileSelect = () => {
    if (!loading) {
      fileInputRef.current.click();
    }
  };

  const startNewAnalysis = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("fakeshield_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Compute confidence gauge values
  const displayConfidence = result
    ? result.result === "FAKE"
      ? result.confidence * 100
      : (1 - result.confidence) * 100
    : 0;

  const isFake = result && result.result === "FAKE";
  const resultColorClass = isFake ? "text-error" : "text-emerald-400";
  const resultBorderClass = isFake ? "border-error/20 glow-error" : "border-emerald-500/20 glow-success";
  const resultIcon = isFake ? "warning" : "verified";
  
  const circumference = 364.4;
  const strokeDashoffset = circumference - (circumference * displayConfidence) / 100;

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container/60 backdrop-blur-xl border-r border-white/10 flex flex-col py-8 px-4 z-50">
        <div className="mb-10 px-2">
          <h1 className="font-headline-md text-xl font-bold text-primary">FakeShield AI</h1>
          <p className="font-body-sm text-xs text-on-surface-variant opacity-70">Vigilant Protection</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <a className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary border-l-4 border-primary transition-transform duration-200 ease-in-out font-body-sm text-sm" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-transform duration-200 ease-in-out font-body-sm text-sm" href="#" onClick={startNewAnalysis}>
            <span className="material-symbols-outlined">biotech</span>
            <span>Analyze Media</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-transform duration-200 ease-in-out font-body-sm text-sm" href="#recent-analyses">
            <span className="material-symbols-outlined">history</span>
            <span>History</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-transform duration-200 ease-in-out font-body-sm text-sm" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span>Analytics</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-transform duration-200 ease-in-out font-body-sm text-sm" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
        </nav>
        
        <div className="mt-auto px-2">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">JD</div>
            <div>
              <p className="font-body-sm text-sm font-bold">John Doe</p>
              <p className="text-[10px] uppercase tracking-wider text-primary">Pro Shield</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-sidebar-width flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-margin-desktop relative overflow-hidden">
          {/* Header */}
          <header className="flex justify-between items-end mb-10">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">System Overview</h2>
              <div className="flex items-center gap-2 text-primary">
                <span className="w-2 h-2 rounded-full bg-primary status-pulse"></span>
                <span className="font-label-caps text-label-caps">All nodes active • Real-time detection enabled</span>
              </div>
            </div>
            <button 
              onClick={startNewAnalysis}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Analysis
            </button>
          </header>

          {/* Top Grid: Upload & Current Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
            
            {/* Upload Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`lg:col-span-2 glass-panel rounded-xl p-8 flex flex-col items-center justify-center border-dashed border-2 transition-colors relative overflow-hidden min-h-[350px] ${
                dragActive ? "border-primary bg-primary/10" : "border-primary/30 hover:border-primary cursor-pointer group"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="video/*" 
                className="hidden" 
              />
              
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {loading ? (
                <div className="w-full max-w-md flex flex-col items-center z-10">
                  <div className="mb-6 relative">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-spin">
                      <span className="material-symbols-outlined text-[48px] text-primary">sync</span>
                    </div>
                  </div>
                  <h3 className="font-headline-md text-lg mb-2">Analyzing Media...</h3>
                  
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden mt-4">
                    <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  
                  <div className="mt-3 flex justify-between w-full font-mono-data text-xs text-on-surface-variant">
                    <span className="text-primary truncate max-w-[80%]">{file?.name}</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center z-10">
                  <div className="mb-6 relative">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[48px] text-primary">cloud_upload</span>
                    </div>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-2">Upload Content</h3>
                  <p className="text-on-surface-variant mb-6 text-sm max-w-sm">
                    Drag and drop video files here, or click to browse. Supports MP4, MOV, AVI, and MKV.
                  </p>
                  
                  {file && (
                    <div className="bg-surface-container-high/50 border border-white/5 rounded-lg px-4 py-2 mt-2 max-w-md flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">video_file</span>
                      <span className="font-mono-data text-xs text-primary truncate max-w-[250px]">{file.name}</span>
                      <span className="text-[10px] text-on-surface-variant">({formatBytes(file.size)})</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Analysis Result Card */}
            <div className={`glass-panel rounded-xl p-6 border transition-all ${result ? resultBorderClass : 'border-white/10'}`}>
              {!result ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 border border-primary/10">
                    <span className="material-symbols-outlined text-[32px] text-primary/40 animate-pulse">radar</span>
                  </div>
                  <h4 className="font-headline-md text-base text-on-surface mb-2">System Diagnostics</h4>
                  <p className="text-xs text-on-surface-variant max-w-[220px] leading-relaxed">
                    Upload a video to execute deepfake neural verification. Results will render here dynamically.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Live Analysis Result</span>
                      <span className={`material-symbols-outlined ${resultColorClass} ${isFake ? 'status-pulse' : ''}`}>
                        {resultIcon}
                      </span>
                    </div>
                    <div className="text-center mb-8">
                      <h4 className={`font-headline-xl text-headline-xl ${resultColorClass} mb-1`}>{result.result}</h4>
                      <p className="font-body-md text-xs text-on-surface-variant">
                        {isFake ? 'Deepfake Signature Detected' : 'Authentic Video Signature'}
                      </p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between font-mono-data text-xs mb-1">
                      <span>Confidence Level</span>
                      <span className={resultColorClass}>{displayConfidence.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isFake ? 'bg-error shadow-[0_0_10px_rgba(255,180,171,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]'}`}
                        style={{ width: `${displayConfidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Circular Gauge */}
                  <div className="flex justify-center relative py-4 mt-6">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                      <circle 
                        cx="64" 
                        cy="64" 
                        fill="transparent" 
                        r="58" 
                        stroke={isFake ? '#ffb4ab' : '#34d399'} 
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ strokeLinecap: "round", transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-headline-md text-lg">{Math.round(displayConfidence)}%</span>
                      <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Match</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Row: Recent Analyses & Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter" id="recent-analyses">
            
            {/* Recent Analyses */}
            <div className="lg:col-span-2 glass-panel rounded-xl p-6">
              <h3 className="font-headline-md text-lg mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Recent Analyses
              </h3>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 glass-card-hover group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                        {item.previewUrl ? (
                          <img 
                            alt="Analysis preview" 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                            src={item.previewUrl}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-primary text-xl">video_file</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-body-md font-bold text-sm truncate max-w-[200px] md:max-w-[320px]">{item.filename}</h5>
                        <p className="text-xs text-on-surface-variant">Processed {item.time} • {item.size}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full font-mono-data text-[10px] border ${
                        item.result === "FAKE"
                          ? "bg-error/10 text-error border-error/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {item.result} ({Math.round(item.result === "FAKE" ? item.confidence * 100 : (1 - item.confidence) * 100)}%)
                      </span>
                      <button 
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="material-symbols-outlined text-on-surface-variant hover:text-error cursor-pointer text-lg"
                        title="Delete from logs"
                      >
                        delete
                      </button>
                    </div>
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="text-center py-10 text-on-surface-variant">
                    No recent analyses logged.
                  </div>
                )}
              </div>
            </div>

            {/* Global Stats */}
            <div className="glass-panel rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-headline-md text-lg mb-6">Threat Intelligence</h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-surface-container-high">
                    <p className="text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">Total Scanned</p>
                    <p className="font-headline-md text-2xl text-primary font-bold">{stats.totalScanned.toLocaleString()}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-surface-container-high">
                    <p className="text-xs font-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">Fakes Blocked</p>
                    <p className="font-headline-md text-2xl text-error font-bold">{stats.fakesBlocked.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-surface-container-high border border-primary/10 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-widest">System Health</span>
                  <span className="text-xs text-primary font-mono-data font-bold">OPTIMAL</span>
                </div>
                <div className="flex gap-1">
                  <div className="h-1 flex-1 bg-primary rounded-full"></div>
                  <div className="h-1 flex-1 bg-primary rounded-full"></div>
                  <div className="h-1 flex-1 bg-primary rounded-full"></div>
                  <div className="h-1 flex-1 bg-primary rounded-full"></div>
                  <div className="h-1 flex-1 bg-primary/20 rounded-full"></div>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="bg-surface-container-lowest border-t border-white/5 w-full py-8 px-margin-desktop flex flex-col md:flex-row justify-between mt-auto">
          <div className="mb-4 md:mb-0">
            <h2 className="font-headline-sm text-base text-on-surface font-bold">FakeShield AI</h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1 opacity-60">© 2026 FakeShield AI. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-1">
              <span className="font-label-caps text-[10px] text-primary mb-1">Platform</span>
              <a className="font-body-sm text-xs text-on-surface-variant hover:text-secondary transition-colors" href="#">Security Architecture</a>
              <a className="font-body-sm text-xs text-on-surface-variant hover:text-secondary transition-colors" href="#">API Docs</a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-caps text-[10px] text-primary mb-1">Legal</span>
              <a className="font-body-sm text-xs text-on-surface-variant hover:text-secondary transition-colors" href="#">Privacy Policy</a>
              <a className="font-body-sm text-xs text-on-surface-variant hover:text-secondary transition-colors" href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Upload;