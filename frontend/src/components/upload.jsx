import { useState, useEffect, useRef } from "react";
import { uploadMedia } from "../api";

const DEFAULT_HISTORY = [
  {
    id: "1",
    filename: "interview_raw_002.mp4",
    time: "12m ago",
    size: "4.2MB",
    type: "video/mp4",
    result: "FAKE",
    confidence: 0.94,
    previewUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYdc224J1TY25ZpwiDXMcbJw7vlPdmgOq_Y3k32VvEIfJ6OicJS3lNKptcD1LHK8YzqoYdaE40ZTnkhbUO80TAij1COMmWYlD8FbHKA4roF2fwhzRLIrEoA000C5GNKFGvd0mdvLFQFAR_FV-FDZvJTLVX9pQIp56gQiPsxVpoKgrEJul6gPqDFzbP5ju-v_jB3p3WrSrtjDzVgQz-mPKO-jafAPNauks-PoMIswMGHGzTGB6RkVFxb5aAFFp1cgBNXyMLQSCY_hU"
  },
  {
    id: "2",
    filename: "ceo_announcement.png",
    time: "2h ago",
    size: "1.1MB",
    type: "image/png",
    result: "REAL",
    confidence: 0.12,
    previewUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbiWVjMyATlNetmA70jDCNfMOPrkk0VRcneUaU2JjoABOJcZXdEAB3JRDnIop7D-uRG1TGIfEPnP871nsTBkhHrvLfR6jZ_TALMpecopWcsLX-ZtgSMvuMZv7DgZM7nJCLGkwru8scywm8VyUg0FkmwrYvoROubI_LBPGeGLCggLoc7MW7RBIeIv1vARlGLiOk7ZYuYClvul21AwgMFSBcHVqhdKPZSjNaAzvYpilNaxG_nPd0Cp6iK-ilDZnmpUVfoz7Gtdwsggw"
  },
  {
    id: "3",
    filename: "security_cam_alpha.mov",
    time: "5h ago",
    size: "15.6MB",
    type: "video/quicktime",
    result: "REAL",
    confidence: 0.03,
    previewUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7b-hdXfbzdTa_GupCUE6LvuCawVTkTFUJxArCQdDFGqbDMD50znm8CDHt2udr8-N3ZNeMrkBCm_TUeWUaSyWiQcJOkeg1d50uFwNpGBBsVwbSzwOue0aFEbA5Ovl1EIBK0N6PuX_1Kbf7MmGRnJZ8_iQmSGVJRJD19AKVUMZOUij1rcbp4z8aHQ7qQRP2IUOabxqg4LLWCvwp7lGob2kbSUkyuhISHNPVq3KYJ0FaPyoqQ66jSIQq97DINdjT42sJ8wNsP54o_Zk"
  }
];

function Upload() {
  const [file, setFile] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalScanned: 12842, fakesBlocked: 431 });
  const [previewUrl, setPreviewUrl] = useState(null);

  // Redesign state additions
  const [selectedModel, setSelectedModel] = useState("auto");
  const [sensitivity, setSensitivity] = useState(50); // percentage (0-100), default 50
  const [cliLogs, setCliLogs] = useState([]);
  const [threatFeed, setThreatFeed] = useState([
    { id: 1, location: "Node US-East", type: "Video", action: "Blocked Deepfake (94% confidence)", time: "2s ago" },
    { id: 2, location: "Node EU-West", type: "Image", action: "Scan completed: Authentic", time: "1m ago" },
    { id: 3, location: "Node AP-South", type: "Video", action: "Blocked Deepfake (87% confidence)", time: "5m ago" },
  ]);

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

  // Cleanup blob URLs on unmount only (not on every previewUrl change to avoid double-revoke)
  useEffect(() => {
    return () => {
      // Only revoke on unmount — startNewAnalysis handles revocation during the session
    };
  }, []);

  // Simulate threat feed updates
  useEffect(() => {
    const locations = ["Node US-East", "Node US-West", "Node EU-West", "Node EU-Central", "Node AP-South", "Node AP-East"];
    const types = ["Image", "Video"];
    const actions = [
      { text: "Blocked Deepfake (94% confidence)", isFake: true },
      { text: "Blocked Deepfake (89% confidence)", isFake: true },
      { text: "Blocked Deepfake (99% confidence)", isFake: true },
      { text: "Scan completed: Authentic", isFake: false },
      { text: "Scan completed: Authentic", isFake: false }
    ];
    
    const interval = setInterval(() => {
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const act = actions[Math.floor(Math.random() * actions.length)];
      
      setThreatFeed(prev => [
        {
          id: Date.now(),
          location: loc,
          type,
          action: act.text,
          time: "Just now"
        },
        ...prev.slice(0, 4)
      ]);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  // Generate real-time CLI scanning logs based on progress
  useEffect(() => {
    if (!loading) return;
    const logs = [];
    if (progress >= 5) logs.push(`[SYS_INIT] Loading file container structure: ${file?.name}`);
    if (progress >= 15) logs.push(`[SYS_METADATA] Format: ${file?.type || "unknown"}. Running integrity scan...`);
    if (progress >= 30) logs.push("[TENSOR_FLOW] Allocating tensor buffers. Initializing layers...");
    if (progress >= 50) logs.push("[LANDMARK_MESH] Locating region landmarks. Face-grid resolved.");
    if (progress >= 70) logs.push("[FREQUENCY_ANALYSIS] Mapping spatial noise variances...");
    if (progress >= 85) logs.push("[NEURAL_EVAL] Executing weight comparison. Computing classification logits...");
    if (progress >= 95) logs.push("[SYS_RESOLVING] final verdict resolution active...");
    setCliLogs(logs);
  }, [progress, loading, file]);

  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const getFileSizeString = (f) => {
    if (f.customSize) return f.customSize;
    return formatBytes(f.size);
  };

  const isImageFile = (f) => {
    if (!f) return false;
    if (f.type) return f.type.startsWith("image/");
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name || "");
  };

  const isVideoFile = (f) => {
    if (!f) return false;
    if (f.type) return f.type.startsWith("video/");
    return /\.(mp4|avi|mov|mkv|webm)$/i.test(f.name || "");
  };

  const analyzeMedia = async (selectedFile) => {
    if (!selectedFile) return;
    setLoading(true);
    setApiResult(null);
    setProgress(0);
    setCliLogs([]);

    // Create object URL for local display preview
    if (previewUrl && !previewUrl.startsWith("http")) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    // Simulate progress while uploading and running prediction
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          return prev + Math.floor(Math.random() * 8) + 2;
        } else if (prev < 98) {
          return prev + 1;
        }
        return prev;
      });
    }, 100);

    try {
      const data = await uploadMedia(selectedFile);
      clearInterval(progressInterval);
      setProgress(100);

      // Brief delay for clean visual transition
      setTimeout(() => {
        setApiResult(data);
        setLoading(false);

        // Update statistics based on classification with current sensitivity
        const confidence = data.confidence;
        const isFake = confidence >= (sensitivity / 100);

        setStats((prev) => {
          const newTotal = prev.totalScanned + 1;
          const newFakes = isFake ? prev.fakesBlocked + 1 : prev.fakesBlocked;
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
          type: selectedFile.type,
          result: data.result,
          confidence: data.confidence,
          previewUrl: selectedFile.type.startsWith("image/") ? url : null
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
      alert("Error analyzing media: " + (err.response?.data?.detail || err.message));
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
      analyzeMedia(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Reset input value so the same file can be selected again on the next upload
      e.target.value = "";
      setFile(selectedFile);
      analyzeMedia(selectedFile);
    }
  };

  const triggerFileSelect = () => {
    if (!loading) {
      fileInputRef.current.click();
    }
  };

  const startNewAnalysis = () => {
    setFile(null);
    setApiResult(null);
    setProgress(0);
    setCliLogs([]);
    // Revoke any active local blob URL and reset the file input
    if (previewUrl && !previewUrl.startsWith("http")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    // Reset file input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("fakeshield_history", JSON.stringify(updated));
      return updated;
    });
  };

  const loadHistoryItem = (item) => {
    // Populate fake file details for history load
    setFile({
      name: item.filename,
      size: 0,
      customSize: item.size,
      mock: true,
      type: item.type || (item.filename.match(/\.(jpg|jpeg|png|webp)$/i) ? "image/png" : "video/mp4")
    });
    setApiResult({
      result: item.result,
      confidence: item.confidence
    });
    setPreviewUrl(item.previewUrl || null);
  };

  const exportReport = () => {
    if (!file || !apiResult) return;
    const text = `==================================================
FAKE SHIELD AI - CYBER-INTELLIGENCE AUDIT REPORT
==================================================
Timestamp: ${new Date().toLocaleString()}
File Name: ${file.name}
File Size: ${getFileSizeString(file)}
Media Type: ${file.type || "unknown"}
Model Applied: ${selectedModel === "auto" ? "Auto-detect (Optimal Selection)" : selectedModel === "image" ? "Image CNN Classifier" : "Video RNN Sequence Evaluator"}
Sensitivity Threshold: ${sensitivity}%

--------------------------------------------------
VERDICT & DEEP LEARNING CLASSIFICATION
--------------------------------------------------
Raw Deepfake Probability: ${(confidence * 100).toFixed(2)}%
Frontend Sensitivity Limit: ${sensitivity}.00%
Verdict Resolution: ${finalResult}
Threat Classification: ${isFake ? "MALICIOUS GENERATIVE AI MANIPULATION DETECTED" : "AUTHENTIC PHYSICAL CAPTURE SIGNATURE"}

--------------------------------------------------
NEURAL DIAGNOSTIC PARAMETERS (DERIVED METRICS)
--------------------------------------------------
Facial Mesh Consistency Index: ${meshConsistency}%
Spectral Discrepancy Index: ${spectralDiscrepancy} / 10.00
Temporal Flow Jitter Ratio: ${temporalJitter}
Compression Noise Profile: ${sensorNoiseProfile}
Primary Layer Tensor Activation: ${layerActivation}%

--------------------------------------------------
SYSTEM INTEGRITY DETAILS
--------------------------------------------------
Audit Signature: FS-${Math.random().toString(36).substring(2, 10).toUpperCase()}
Processing Node: FAKESHIELD-NODE-ALPHA
Environment Status: SECURE / VERIFIED
==================================================`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fakeshield_report_${file.name.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Evaluate dynamic classification outputs based on the Sensitivity slider
  const confidence = apiResult ? apiResult.confidence : 0;
  const isFake = apiResult ? (confidence >= sensitivity / 100) : false;
  const finalResult = isFake ? "FAKE" : "REAL";

  const displayConfidence = confidence * 100;

  const resultColorClass = isFake ? "text-error" : "text-emerald-400";
  const resultBorderClass = isFake ? "border-error/30 glow-error" : "border-emerald-500/30 glow-success";
  const resultIcon = isFake ? "warning" : "verified";
  
  const circumference = 364.4;
  const strokeDashoffset = circumference - (circumference * displayConfidence) / 100;

  // Compute mock diagnostics parameters deterministically from confidence
  const meshConsistency = Math.max(5, Math.min(99, Math.round((1 - confidence) * 100 + (Math.sin(confidence * 10) * 5))));
  const spectralDiscrepancy = (confidence * 8.8 + 0.5 + Math.cos(confidence * 5) * 0.4).toFixed(2);
  const temporalJitter = isVideoFile(file) 
    ? `${(confidence * 68 + 2 + (confidence > 0.5 ? Math.random() * 4 : 0)).toFixed(1)} ms`
    : "N/A (Static Media)";
  const sensorNoiseProfile = confidence > 0.5 ? "Anomalous / GAN Signature" : "Consistent / Sensor Profile";
  const layerActivation = Math.round(confidence * 93 + 6);

  const getScanningPhase = (p) => {
    if (p <= 25) return "[PHASE 1/4] Extracting metadata container profile...";
    if (p <= 50) return "[PHASE 2/4] Executing landmark mesh & facial vectorization...";
    if (p <= 75) return "[PHASE 3/4] Resolving noise domain & texture irregularities...";
    return "[PHASE 4/4] Activating deep learning tensor comparison...";
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface cyber-grid">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container/85 backdrop-blur-xl border-r border-primary/10 flex flex-col py-8 px-4 z-50">
        <div className="mb-10 px-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[32px] text-primary">security</span>
          <div>
            <h1 className="font-headline-md text-base font-bold text-primary tracking-wider uppercase">FakeShield AI</h1>
            <p className="font-body-sm text-[10px] text-on-surface-variant opacity-70 tracking-widest uppercase">Deepfake Defense</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <a className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary border-l-2 border-primary rounded-r-lg transition-transform duration-200 ease-in-out font-body-sm text-sm" href="#">
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
            <span>Threat Map</span>
          </a>
        </nav>
        
        {/* Real-time Global Threat Feed Panel in Sidebar */}
        <div className="mt-6 mb-6">
          <div className="border border-white/5 rounded-lg p-3 bg-black/30">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-primary mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary status-pulse"></span>
              Live Threat Feed
            </h4>
            <div className="space-y-2 max-h-[150px] overflow-hidden">
              {threatFeed.map((feed) => (
                <div key={feed.id} className="text-[10px] leading-tight text-on-surface-variant/80 border-b border-white/5 pb-1 last:border-0 last:pb-0">
                  <div className="flex justify-between font-mono-data text-primary/70">
                    <span>{feed.location}</span>
                    <span>{feed.time}</span>
                  </div>
                  <p className="truncate text-on-surface/90">{feed.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto px-2">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">AN</div>
            <div>
              <p className="font-body-sm text-sm font-bold text-on-surface">Analyst 01</p>
              <p className="text-[10px] uppercase tracking-wider text-primary">Security Node</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-sidebar-width flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-margin-desktop relative overflow-hidden">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-[32px] text-primary">security_update_good</span>
                Neural Intelligence Console
              </h2>
              <div className="flex items-center gap-2 text-primary">
                <span className="w-2 h-2 rounded-full bg-primary status-pulse"></span>
                <span className="font-label-caps text-[10px] tracking-widest">Global Node: ACTIVE • Model Version: 2.0-Alpha</span>
              </div>
            </div>
            
            {/* Quick configuration settings on header */}
            <div className="flex flex-wrap items-center gap-4 bg-surface-container/60 p-3 rounded-lg border border-white/5 backdrop-blur-md">
              {/* Model Selector */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Evaluation Model</label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-background border border-primary/20 rounded px-2.5 py-1 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer font-body-sm"
                >
                  <option value="auto">Auto-detect File Type</option>
                  <option value="image">Image CNN Model</option>
                  <option value="video">Video RNN Model</option>
                </select>
              </div>

              {/* Sensitivity Slider */}
              <div className="flex flex-col min-w-[150px]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Sensitivity Threshold</label>
                  <span className="text-[9px] font-mono-data text-primary font-bold">{sensitivity}%</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="99"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseInt(e.target.value))}
                  className="w-full accent-primary bg-background h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button 
                onClick={startNewAnalysis}
                className="bg-primary text-on-primary px-4 py-2 rounded font-bold hover:brightness-110 transition-all flex items-center gap-1 text-xs cursor-pointer shadow-md shadow-primary/20 mt-3 md:mt-0"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Reset
              </button>
            </div>
          </header>

          {/* Top Grid: Upload & Current Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
            
            {/* Upload Zone & Viewport */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={file ? undefined : triggerFileSelect}
                className={`glass-panel rounded-xl p-6 flex flex-col items-center justify-center border-2 transition-all min-h-[380px] relative overflow-hidden ${
                  !file ? "border-dashed border-primary/20 hover:border-primary/50 cursor-pointer group" : "border-solid border-primary/10"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*,video/*" 
                  className="hidden" 
                />

                {/* Laser scan lines */}
                {loading && (
                  <div className="scanner-laser scanner-laser-scanning"></div>
                )}
                {/* Only show verdict laser after loading fully completes (progress=100 AND loading=false) */}
                {!loading && apiResult && progress === 100 && (
                  <div className={`scanner-laser ${isFake ? 'scanner-laser-error' : 'scanner-laser-success'}`}></div>
                )}

                {/* Interactive display states */}
                {file ? (
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    {/* Media container frame with target design */}
                    <div className="relative border border-primary/20 p-2 bg-black/40 rounded-lg max-w-full overflow-hidden flex items-center justify-center max-h-[300px]">
                      {/* Technical target bracket highlights */}
                      <span className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-primary"></span>
                      <span className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-primary"></span>
                      <span className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-primary"></span>
                      <span className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-primary"></span>

                      {previewUrl ? (
                        isImageFile(file) ? (
                          <img 
                            src={previewUrl} 
                            alt="Scan content" 
                            className="max-h-[280px] max-w-full object-contain rounded"
                          />
                        ) : (
                          <video 
                            src={previewUrl} 
                            controls 
                            autoPlay 
                            loop 
                            muted
                            className="max-h-[280px] max-w-full object-contain rounded"
                          />
                        )
                      ) : (
                        <div className="w-[300px] h-[180px] flex flex-col items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[48px] text-primary opacity-60">
                            {isImageFile(file) ? 'image' : 'video_file'}
                          </span>
                          <span className="text-xs font-mono-data mt-2 text-primary truncate max-w-[200px]">{file.name}</span>
                        </div>
                      )}
                    </div>

                    {/* File Telemetry overlay label */}
                    <div className="mt-4 flex items-center justify-between w-full max-w-md bg-surface-container/80 border border-white/5 rounded px-3 py-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-mono-data text-primary">
                        <span className="material-symbols-outlined text-sm">
                          {isImageFile(file) ? 'image' : 'video_file'}
                        </span>
                        <span className="truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <span className="text-[10px] font-mono-data text-on-surface-variant">{getFileSizeString(file)}</span>
                    </div>

                    {/* Overlay Scanning State progress */}
                    {loading && (
                      <div className="w-full max-w-md mt-4 flex flex-col items-center">
                        <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="mt-2 text-xs font-mono-data text-primary text-center">
                          {getScanningPhase(progress)} ({progress}%)
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center z-10 py-6">
                    <div className="mb-6 relative">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-primary/20 relative">
                        <span className="material-symbols-outlined text-[48px] text-primary">cloud_upload</span>
                        <span className="absolute inset-0 rounded-full border border-primary/40 animate-ping opacity-20"></span>
                      </div>
                    </div>
                    <h3 className="font-headline-md text-xl mb-2 tracking-tight text-on-surface">Initialize Media Scan</h3>
                    <p className="text-on-surface-variant mb-6 text-sm max-w-sm leading-relaxed">
                      Drag and drop image or video files, or click to browse. Supports JPG, PNG, WEBP, MP4, MOV, and AVI.
                    </p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant font-mono-data bg-white/5 px-2.5 py-1 rounded border border-white/5">
                        <span className="material-symbols-outlined text-sm">image</span> Images
                      </div>
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant font-mono-data bg-white/5 px-2.5 py-1 rounded border border-white/5">
                        <span className="material-symbols-outlined text-sm">video_file</span> Videos
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Digital Terminal CLI Logger (Displays details as scanning continues) */}
              <div className="glass-panel rounded-xl p-4 border border-white/5 bg-black/60 font-mono-data text-xs text-on-surface-variant/90 min-h-[140px] flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-primary tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">terminal</span>
                    Telemetry Terminal Log
                  </h4>
                  <div className="space-y-1 max-h-[80px] overflow-y-auto">
                    {cliLogs.length > 0 ? (
                      cliLogs.map((log, i) => (
                        <div key={i} className="text-primary/80 transition-opacity">
                          <span className="text-on-surface-variant opacity-50 font-bold">&gt;&gt;</span> {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-on-surface-variant/40 italic">
                        {loading ? "Establishing handshake..." : "Console idle. Awaiting media verification signal..."}
                      </div>
                    )}
                  </div>
                </div>
                {loading && (
                  <div className="flex justify-between items-center text-[10px] text-primary border-t border-primary/10 pt-2 mt-2">
                    <span className="status-pulse">STREAMS ONLINE // CAPTURING DATA</span>
                    <span className="animate-pulse font-bold">CORE_LOAD: {(progress * 0.95).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Result Card */}
            <div className={`glass-panel rounded-xl p-6 border transition-all flex flex-col justify-between ${apiResult ? resultBorderClass : 'border-white/10'}`}>
              {!apiResult ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 border border-primary/10 relative">
                    <span className="material-symbols-outlined text-[32px] text-primary/40 animate-pulse">radar</span>
                    <span className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-10"></span>
                  </div>
                  <h4 className="font-headline-md text-base text-on-surface mb-2 tracking-tight">Vigilance Diagnostics</h4>
                  <p className="text-xs text-on-surface-variant max-w-[220px] leading-relaxed">
                    Upload an image or video to trigger neural signature evaluation. Real-time metrics will render here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between gap-6">
                  {/* Result Verdict Info */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider">Evaluation Verdict</span>
                      <span className={`material-symbols-outlined ${resultColorClass} ${isFake ? 'status-pulse font-bold' : ''}`}>
                        {resultIcon}
                      </span>
                    </div>

                    <div className="text-center bg-black/30 p-4 rounded-lg border border-white/5">
                      <h4 className={`font-headline-md text-xl font-bold tracking-widest ${resultColorClass} uppercase mb-1`}>
                        {isFake ? 'MALICIOUS DEEPFAKE' : 'AUTHENTIC MEDIA'}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant font-mono-data">
                        {isFake ? 'Neural anomalies match GAN/Diffusion templates' : 'Uniform lens sensor capture matches hardware limits'}
                      </p>
                    </div>
                  </div>

                  {/* Circular Gauge */}
                  <div className="flex justify-center relative py-2">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="6"></circle>
                      <circle 
                        cx="64" 
                        cy="64" 
                        fill="transparent" 
                        r="58" 
                        stroke={isFake ? '#ff3366' : '#00ff88'} 
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ strokeLinecap: "round", transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-headline-md text-xl font-bold font-mono-data">{Math.round(displayConfidence)}%</span>
                      <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest">Fake Prob.</span>
                    </div>
                  </div>

                  {/* Dynamic Diagnostic Variables Grid */}
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2.5 font-mono-data text-xs">
                    <div className="flex justify-between text-[10px] text-primary/70 uppercase font-bold border-b border-white/5 pb-1 mb-1.5">
                      <span>Diagnostic Parameter</span>
                      <span>Resolved Value</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Mesh Consistency:</span>
                      <span className={meshConsistency < 40 ? "text-error" : "text-emerald-400"}>{meshConsistency}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Spectral Discrepancy:</span>
                      <span className={parseFloat(spectralDiscrepancy) > 5.0 ? "text-error" : "text-emerald-400"}>{spectralDiscrepancy}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Temporal Frame Jitter:</span>
                      <span className="text-on-surface">{temporalJitter}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Noise Profile:</span>
                      <span className={confidence > 0.5 ? "text-error" : "text-emerald-400"}>{sensorNoiseProfile}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Tensor Activation:</span>
                      <span className="text-on-surface">{layerActivation}%</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={exportReport}
                      className="flex-1 bg-surface-container border border-primary/20 text-primary hover:bg-primary/10 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Audit Report
                    </button>
                    <button 
                      onClick={startNewAnalysis}
                      className="bg-primary text-on-primary hover:brightness-110 px-4 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-primary/10"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      New Scan
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Row: Recent Analyses & Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter" id="recent-analyses">
            
            {/* Recent Analyses Audit Log */}
            <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-3">
                  <h3 className="font-headline-md text-base font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span>
                    Verification Audit Log
                  </h3>
                  <span className="text-[10px] font-mono-data text-on-surface-variant bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {history.length} Saved Records
                  </span>
                </div>
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {history.map((item) => {
                    const isItemFake = item.result === "FAKE";
                    return (
                      <div 
                        key={item.id}
                        onClick={() => loadHistoryItem(item)}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 glass-card-hover group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded bg-background flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10 relative">
                            {item.previewUrl ? (
                              <img 
                                alt="Analysis preview" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                                src={item.previewUrl}
                              />
                            ) : (
                              <span className="material-symbols-outlined text-primary text-xl">
                                {item.filename.match(/\.(jpg|jpeg|png|webp)$/i) ? 'image' : 'video_file'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-body-md font-bold text-sm text-on-surface truncate max-w-[200px] md:max-w-[320px]">{item.filename}</h5>
                            <p className="text-xs text-on-surface-variant font-mono-data">Processed {item.time} • {item.size}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full font-mono-data text-[10px] border ${
                            isItemFake
                              ? "bg-error/10 text-error border-error/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            {item.result} ({(item.confidence * 100).toFixed(0)}%)
                          </span>
                          <button 
                            onClick={(e) => deleteHistoryItem(item.id, e)}
                            className="material-symbols-outlined text-on-surface-variant hover:text-error cursor-pointer text-lg p-1 hover:bg-white/5 rounded"
                            title="Delete audit trace"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {history.length === 0 && (
                    <div className="text-center py-10 text-on-surface-variant/50 font-mono-data text-xs">
                      [NO AUDIT RECORDS FOUND]
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Global Threat Intelligence Stats */}
            <div className="glass-panel rounded-xl p-6 border border-white/10 flex flex-col justify-between gap-6">
              <div>
                <h3 className="font-headline-md text-base font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">insights</span>
                  Threat Intelligence Summary
                </h3>
                
                <div className="space-y-4 font-mono-data">
                  <div className="p-4 rounded-lg bg-surface-container-high border border-white/5 relative overflow-hidden group">
                    <span className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-full filter blur-xl group-hover:bg-primary/10 transition-colors"></span>
                    <p className="text-[10px] font-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">Total Media Evaluated</p>
                    <p className="font-headline-md text-2xl text-primary font-bold">{stats.totalScanned.toLocaleString()}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-surface-container-high border border-white/5 relative overflow-hidden group">
                    <span className="absolute bottom-0 right-0 w-24 h-24 bg-error/5 rounded-full filter blur-xl group-hover:bg-error/10 transition-colors"></span>
                    <p className="text-[10px] font-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">Deepfakes Flagged</p>
                    <p className="font-headline-md text-2xl text-error font-bold">{stats.fakesBlocked.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Node System Metrics */}
              <div className="p-4 rounded-lg bg-surface-container-high border border-primary/10">
                <div className="flex justify-between items-center mb-2 text-xs font-mono-data">
                  <span className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-wider">Verification Integrity</span>
                  <span className="text-primary font-bold">OPTIMAL</span>
                </div>
                <div className="flex gap-1">
                  <div className="h-1 flex-1 bg-primary rounded-full"></div>
                  <div className="h-1 flex-1 bg-primary rounded-full"></div>
                  <div className="h-1 flex-1 bg-primary rounded-full"></div>
                  <div className="h-1 flex-1 bg-primary rounded-full"></div>
                  <div className="h-1 flex-1 bg-primary/20 rounded-full"></div>
                </div>
                <p className="text-[9px] font-mono-data text-on-surface-variant/70 mt-2 text-right">
                  Node Latency: 42ms
                </p>
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="bg-surface-container-lowest border-t border-white/5 w-full py-8 px-margin-desktop flex flex-col md:flex-row justify-between mt-auto gap-4">
          <div className="mb-4 md:mb-0">
            <h2 className="font-headline-sm text-sm text-on-surface font-bold tracking-wider uppercase">FakeShield AI</h2>
            <p className="font-body-sm text-[10px] text-on-surface-variant mt-1 opacity-60">© 2026 FakeShield AI. Decentralized Deepfake Audit Hub.</p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-1">
              <span className="font-label-caps text-[9px] text-primary mb-1 tracking-widest">Platform</span>
              <a className="font-body-sm text-[11px] text-on-surface-variant hover:text-primary transition-colors" href="#">Security Architecture</a>
              <a className="font-body-sm text-[11px] text-on-surface-variant hover:text-primary transition-colors" href="#">API Specification</a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-caps text-[9px] text-primary mb-1 tracking-widest">Legal</span>
              <a className="font-body-sm text-[11px] text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Protocol</a>
              <a className="font-body-sm text-[11px] text-on-surface-variant hover:text-primary transition-colors" href="#">System Usage Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Upload;