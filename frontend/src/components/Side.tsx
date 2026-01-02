import { Database, Eye, FileText, BarChart3, ArrowRightLeft } from 'lucide-react';

interface SideProps {
    selectedItem: string;
    onItemSelect: (item: string) => void;
}

const sidebarItems = [
    { id: 'add-dicom', label: 'Add DICOM Data', icon: Database },
    { id: 'image-viewer', label: 'Image Viewer', icon: Eye },
    { id: 'dicom-data', label: 'DICOM Data', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'translation', label: 'Image Translation', icon: ArrowRightLeft}
];

function Side({ selectedItem, onItemSelect }: SideProps) {
    return (
        <div className="w-64 bg-[#2b2b2b] border-r border-[#3e3e42] flex flex-col">
            <div className="relative flex-1" style={{position: 'relative'}}>
                <div
                    style={{ overflow: 'hidden scroll' }}
                    className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
                >
                    <div style={{ minWidth: '100%', display: 'table' }}>
                        <div className="p-4">
                            <div className="space-y-2">
                                {sidebarItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const isSelected = selectedItem === item.id;
                                    // const isFirst = index === 0;
                                    
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => onItemSelect(item.id)}
                                            className={`${
                                                isSelected
                                                    ? 'bg-[#00A9E0] text-white hover:bg-[#0066AA]'
                                                    : 'bg-[#2b2b2b] text-gray-300 hover:bg-[#3E3E42]'
                                            } flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-white`}
                                        >
                                            <Icon size={15} />
                                            <span className="text-sm">{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Side;