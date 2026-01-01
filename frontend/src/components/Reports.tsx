import { Printer, Download, Search, FileText, Calendar, User } from "lucide-react";

function Reports() {
    return (
        <div className="flex-1 flex flex-col bg-[#1E1E1E] overflow-hidden">
            <div className="border-b border-[#3E3E42] p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl text-white/90">Radiology Reports</h1>
                        <p className="text-sm text-white/60 mt-2">
                            2 reports available
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 bg-[#2B2B2B] border-[#3E3E42] text-white/80 hover:bg-[#3E3E42] hover:text-white">
                            <Printer className="h-4 w-4 mr-2" size={24}/>
                            Print All
                        </button>
                        <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 bg-[#2B2B2B] border-[#3E3E42] text-white/80 hover:bg-[#3E3E42] hover:text-white">
                            <Download className="h-4 w-4 mr-2" size={24}/>
                            Export All
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" size={24}/>
                    <input type="text" placeholder="Search by patient name, MRN, or study description..." className="w-full bg-[#2B2B2B] border border-[#3E3E42] rounded px-10 py-2 text-white/90 placeholder:text-white/40 focus:outline-none focus:border-[#00A9E0]" />
                </div>
            </div>
            <div className="relative flex-1">
                <div className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1">
                    <div style={{minWidth: '100%', display: 'table'}}>
                        <div className="p-4 space-y-3">
                            <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-4 hover:border-[#00A9E0] transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5" size={24}/>
                                        <div>
                                            <h3 className="text-white/90">Johnson, Emily</h3>
                                            <p className="text-sm text-white/60">MRN: MRN-987654</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 rounded text-xs capitalize bg-purple-500/20 text-purple-400">
                                            Brief
                                        </div>
                                        <div className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Finalized</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4" size={24}/>
                                        <span className="text-white/60">Study Date: </span>
                                        <span className="text-white/90">2026-01-01</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-white/60">Modality: </span>
                                        <span className="text-white/90">CT</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-white/60">Body Part: </span>
                                        <span className="text-white/90">Head</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4" size={24}/>
                                        <span className="text-white/60">Radiologist: </span>
                                        <span className="text-white/90">Dr. Matthew Cobbinah</span>
                                    </div>
                                </div>
                                <div className="text-sm mb-2">
                                    <span className="text-white/60">Description: </span>
                                    <span className="text-white/90">CT Head - Routine follow-up</span>
                                </div>
                                <div className="text-sm bg-[#1E1E1E] border border-[#3E3E42] rounded p-3 mb-3">
                                    <span className="text-white/60">Impression: </span>
                                    <span className="text-white/80">Stable right frontal lesion. No acute intracranial abnormality. Recommend continued clinical follow-up.</span>
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-[#3E3E42]">
                                    <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 bg-[#00A9E0] hover:bg-[#0090c0] text-white">
                                        <FileText className="h-4 w-4 mr-2" size={24}/>
                                        View Report
                                    </button>
                                    <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 bg-transparent border-[#3E3E42] text-white/80 hover:bg-[#3E3E42] hover:text-white">
                                        <Download className="h-4 w-4 mr-2" size={24}/>
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                            <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-4 hover:border-[#00A9E0] transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5" size={24}/>
                                        <div>
                                            <h3 className="text-white/90">Smith, John</h3>
                                            <p className="text-sm text-white/60">MRN: MRN-123456</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 rounded text-xs capitalize bg-blue-500/20 text-blue-400">
                                            Detailed
                                        </div>
                                        <div className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Finalized</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4" size={24}/>
                                        <span className="text-white/60">Study Date: </span>
                                        <span className="text-white/90">2025-12-31</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-white/60">Modality: </span>
                                        <span className="text-white/90">CT/MRI</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-white/60">Body Part: </span>
                                        <span className="text-white/90">Head</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4" size={24}/>
                                        <span className="text-white/60">Radiologist: </span>
                                        <span className="text-white/90">Dr. Matthew Cobbinah</span>
                                    </div>
                                </div>
                                <div className="text-sm mb-2">
                                    <span className="text-white/60">Description: </span>
                                    <span className="text-white/90">CT and MRI Brain comparison study</span>
                                </div>
                                <div className="text-sm bg-[#1E1E1E] border border-[#3E3E42] rounded p-3 mb-3">
                                    <span className="text-white/60">Impression: </span>
                                    <span className="text-white/80">Acute ischemic stroke involving the left middle cerebral artery territory with early mass effect and midline shift. No hemorrhagic conversion identified</span>
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-[#3E3E42]">
                                    <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 bg-[#00A9E0] hover:bg-[#0090c0] text-white">
                                        <FileText className="h-4 w-4 mr-2" size={24}/>
                                        View Report
                                    </button>
                                    <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 bg-transparent border-[#3E3E42] text-white/80 hover:bg-[#3E3E42] hover:text-white">
                                        <Download className="h-4 w-4 mr-2" size={24}/>
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reports;