import {FolderOpen, Eye, Trash} from 'lucide-react';
import React, {useRef} from 'react';

function DicomData() {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            console.log(event.target.files);
            // We can now handle the files upload
        }
    };

    const handleImportClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="flex-1 flex flex-col bg-[#1E1E1E]">
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white/90">DICOM Studies</h2>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={inputRef}
                            onChange={handleFileChange}
                            style={{display: 'none'}}
                            // @ts-expect-error webkitdirectory is a non-standard attribute
                            webkitdirectory="true"
                            multiple
                        />
                        <button
                            onClick={handleImportClick}
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 bg-[#2B2B2B] border-[#3E3E42] text-white/80 hover:bg-[#3E3E42]">
                            <FolderOpen className="h-4 w-4 mr-2" size={24}/>
                            Import Study
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-[#2B2B2B] border border-[#3E3E42] rounded-lg overflow-hidden">
                    <div className="relative w-full overflow-x-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className='[&_tr]:border-b'>
                                <tr className="data-[state=selected]:bg-muted border-b transition-colors border-[#3E3E42] hover:bg-[#3E3E42]">
                                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/70">Patient Name</th>
                                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/70">Patient ID</th>
                                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/70">Study Date</th>
                                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/70">Modality</th>
                                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/70">Description</th>
                                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/70">Series</th>
                                    <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/70">Actions</th>
                                </tr>
                            </thead>
                            <tbody className='[&_tr:last-child]:border-0'>
                                {/* Example hardcoded data for demonstration */}
                                <tr className="data-[state=selected]:bg-muted border-b transition-colors border-[#3E3E42] hover:bg-[#3E3E42]">
                                    <td className='p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/80'>
                                        {/* Patient Name */}
                                        John Doe
                                    </td>
                                    <td className='p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/80'>
                                        {/* Patient ID */}
                                        123456
                                    </td>
                                    <td className='p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/80'>
                                        {/* Study Date */}
                                        2023-10-10
                                    </td>
                                    <td className='p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/80'>
                                        {/* Modality */}
                                        CT
                                    </td>
                                    <td className='p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/80'>
                                        {/* Description */}
                                        CT Abdomen
                                    </td>
                                    <td className='p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/80'>
                                        {/* Series */}
                                        3
                                    </td>
                                    <td className='p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-white/80'>
                                        {/* Actions */}
                                        <div className="flex gap-1">
                                            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 size-9 rounded-md h-7 w-7 text-white/60 hover:text-white hover:bg-[#3E3E42]">
                                                <Eye className="h-4 w-4 mr-2" size={24}/>
                                            </button>
                                            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 size-9 rounded-md h-7 w-7 text-white/60 hover:text-red-500 hover:bg-[#3E3E42]">
                                                <Trash className="h-4 w-4 mr-2" size={24}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="mt-4 text-xs text-white/50"></div>
            </div>
        </div>
    );
}

export default DicomData;