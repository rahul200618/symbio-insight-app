import { Icons } from '../components/Icons';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { RightPanel } from '../components/RightPanel';

export function UploadSlide() {
  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeView="upload" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
              <h1 className="text-gray-900 mb-2">Upload FASTA Files</h1>
              <p className="text-gray-600">Analyze DNA sequences and generate insights</p>
            </div>

            {/* Upload Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="relative border-2 border-dashed rounded-xl p-12 text-center transition-all border-gray-200 bg-gray-50/30">
                  <div className="pointer-events-none">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-sm">
                      <Icons.Upload className="w-10 h-10 text-white" />
                    </div>
                    
                    <h3 className="text-gray-900 mb-2">Drag & drop your FASTA file</h3>
                    <p className="text-gray-500 mb-4">or click to browse</p>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                      <Icons.File className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Accepts .fasta or .fa files</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center mb-4 shadow-sm">
                  <Icons.Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-900 mb-1">Recent Files</p>
                <p className="text-xs text-gray-500">24 sequences</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-400 flex items-center justify-center mb-4 shadow-sm">
                  <Icons.BarChart className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-900 mb-1">Metadata</p>
                <p className="text-xs text-gray-500">View analytics</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center mb-4 shadow-sm">
                  <Icons.FileText className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-900 mb-1">Reports</p>
                <p className="text-xs text-gray-500">Generate new</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center mb-4 shadow-sm">
                  <Icons.DNA className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-900 mb-1">DNA Analysis</p>
                <p className="text-xs text-gray-500">Quick tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel selectedFile={null} />
    </div>
  );
}

