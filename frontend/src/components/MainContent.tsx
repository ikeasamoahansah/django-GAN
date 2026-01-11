import AddDicomData from './AddDicomData';
import ImageViewerContainer from './ImageViewer';
import DicomData from './DicomData';
import Reports from './Reports';
import ImageTranslation from './ImageTranslation';

interface MainContentProps {
    selectedItem: string;
}

function MainContent({ selectedItem }: MainContentProps) {
    switch (selectedItem) {
        case 'add-dicom':
            return <AddDicomData />;
        case 'image-viewer':
            return <ImageViewerContainer />;
        case 'dicom-data':
            return <DicomData />;
        case 'reports':
            return <Reports />;
        case 'translation':
            return <ImageTranslation/>
        default:
            return <AddDicomData />;
    }
}

export default MainContent;
