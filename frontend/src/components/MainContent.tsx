import AddDicomData from './AddDicomData';

interface MainContentProps {
    selectedItem: string;
}

function MainContent({ selectedItem }: MainContentProps) {
    switch (selectedItem) {
        case 'add-dicom':
            return <AddDicomData />;
        case 'image-viewer':
            return (
                <div className="h-full p-8 overflow-auto">
                    <h1 className="text-2xl font-semibold text-white mb-2">Image Viewer</h1>
                    <p className="text-gray-400">Image viewer content will go here</p>
                </div>
            );
        case 'dicom-data':
            return (
                <div className="h-full p-8 overflow-auto">
                    <h1 className="text-2xl font-semibold text-white mb-2">DICOM Data</h1>
                    <p className="text-gray-400">DICOM data content will go here</p>
                </div>
            );
        case 'reports':
            return (
                <div className="h-full p-8 overflow-auto">
                    <h1 className="text-2xl font-semibold text-white mb-2">Reports</h1>
                    <p className="text-gray-400">Reports content will go here</p>
                </div>
            );
        default:
            return <AddDicomData />;
    }
}

export default MainContent;
