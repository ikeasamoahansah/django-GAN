import { useState } from 'react';
import { Folder, Upload, HardDrive } from 'lucide-react';

function AddDicomData() {
    const [importSource, setImportSource] = useState<'local' | 'dicomdir'>('local');
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    const handleFileSelect = () => {
        // File selection logic will go here
        setSelectedFiles(['file1.dcm', 'file2.dcm']);
    };

    const handleFolderSelect = () => {
        // Folder selection logic will go here
        setSelectedFiles(['folder1']);
    };

    return (
        <div className="flex flex-col gap-2 w-full max-w-4xl px-6">
            <div className="mb-6">
                <h2 className="text-white/90 mb-2">Add DICOM Data</h2>
                <p className="text-white/60 text-sm">Import medical imaging data from various sources</p>
            </div>

            {/* Import Source Selection */}
            <div className="text-muted-foreground h-9 items-center justify-around rounded-xl p-[3px] flex bg-[#2B2B2B] border border-[#3E3E42] w-full">
                <button
                    onClick={() => setImportSource('local')}
                    className={`dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:text-muted-foreground inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-white/70 data-[state=active]:bg-[#00A9E0] data-[state=active]:text-white flex-1" ${
                        importSource === 'local'
                            ? 'bg-[#00A9E0] border-[#00A9E0] text-white'
                            : 'bg-[#2d2d2d] border-gray-600 text-gray-300 hover:bg-[#3d3d3d]'
                    }`}
                >
                    <HardDrive size={20} />
                    <span className="font-medium">Local Files</span>
                </button>
                <button
                    onClick={() => setImportSource('dicomdir')}
                    className={`dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:text-muted-foreground inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-white/70 data-[state=active]:bg-[#00A9E0] data-[state=active]:text-white flex-1" ${
                        importSource === 'dicomdir'
                            ? 'bg-[#00A9E0] border-[#00A9E0] text-white'
                            : 'bg-[#2d2d2d] border-gray-600 text-gray-300 hover:bg-[#3d3d3d]'
                    }`}
                >
                    <Folder size={20} />
                    <span className="font-medium">DICOMDIR</span>
                </button>
            </div>

            {/* Import from Local Storage Section */}
            {importSource === 'local' && (
                <div className="flex-1 outline-none mt-6">
                    <div className='bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6'>
                        <h3 className="text-white/80 mb-4">Import from Local Storage</h3>
                        <p className="text-white/60 text-sm mb-6">
                            Select DICOM files (.dcm, .dicom) or folders containing DICOM images. Only valid DICOM medical imaging files will be accepted.
                        </p>

                        {/* Import Method Buttons */}
                        <div className="space-y-4">
                            <div>
                                <label className="items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-white/70 mb-2 block">Import Method</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={handleFolderSelect}
                                        className="h-32 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-[#1E1E1E] border-[#3E3E42] hover:bg-[#3E3E42] hover:border-[#00A9E0]/50"
                                    >
                                        <Folder className="text-[#007ACC]" size={32} />
                                        <div className="text-center">
                                            <div className="font-medium text-white mb-1">Select Folder</div>
                                            <div className="text-sm text-gray-400">Browse directories</div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={handleFileSelect}
                                        className="h-32 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-[#1E1E1E] border-[#3E3E42] hover:bg-[#3E3E42] hover:border-[#00A9E0]/50"
                                    >
                                        <Upload className="text-[#007ACC]" size={32} />
                                        <div className="text-center">
                                            <div className="font-medium text-white mb-1">Select Files</div>
                                            <div className="text-sm text-gray-400">Choose individual files</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px bg-[#3E3E42]'></div>
                            <div className="flex items-center justify-between pt-4">
                                {/* Status Text */}
                                <div className="text-xs text-white/60">
                                    {selectedFiles.length > 0 ? (
                                        <span>{selectedFiles.length} file(s) selected</span>
                                    ) : (
                                        <span>No files selected</span>
                                    )}
                                </div>
                                {/* Import Button */}
                                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 px-4 py-2 has-[&gt;svg]:px-3 bg-[#00A9E0] hover:bg-[#0090C0] text-white disabled:opacity-50 disabled:cursor-not-allowed">
                                    Import
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DICOMDIR Section */}
            {importSource === 'dicomdir' && (
                <div className="bg-[#2d2d2d] p-6 border border-gray-600">
                    <h2 className="text-xl font-semibold text-white mb-2">Import from DICOMDIR</h2>
                    <p className="text-gray-400 mb-6">
                        Select a DICOMDIR file to import medical imaging data.
                    </p>
                    {/* DICOMDIR import UI will go here */}
                </div>
            )}
        </div>
    );
}

export default AddDicomData;
