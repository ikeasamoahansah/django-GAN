import AddDicomData from './AddDicomData';
import ImageViewer from './ImageViewer';
import DicomData from './DicomData';
import Reports from './Reports';

interface MainContentProps {
    selectedItem: string;
}

function MainContent({ selectedItem }: MainContentProps) {
    switch (selectedItem) {
        case 'add-dicom':
            return <AddDicomData />;
        case 'image-viewer':
            return <ImageViewer />;
        case 'dicom-data':
            return <DicomData />;
        case 'reports':
            return <Reports />;
        default:
            return <AddDicomData />;
    }
}

export default MainContent;
