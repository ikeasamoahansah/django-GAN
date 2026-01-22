import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DicomMetadata {
    id: string;
    file: File;
    patientName: string;
    patientId: string;
    studyDate: string;
    modality: string;
    description: string;
    seriesNumber: string;
    instanceNumber: string;
}

interface DicomContextType {
    dicomFiles: DicomMetadata[];
    addDicomFiles: (files: DicomMetadata[]) => void;
    removeDicomFile: (id: string) => void;
    selectedDicom: DicomMetadata | null;
    selectDicom: (dicom: DicomMetadata | null) => void;
}

const DicomContext = createContext<DicomContextType | undefined>(undefined);

export const DicomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dicomFiles, setDicomFiles] = useState<DicomMetadata[]>([]);
    const [selectedDicom, setSelectedDicom] = useState<DicomMetadata | null>(null);

    const addDicomFiles = (files: DicomMetadata[]) => {
        setDicomFiles(prev => [...prev, ...files]);
    };

    const removeDicomFile = (id: string) => {
        setDicomFiles(prev => prev.filter(f => f.id !== id));
        if (selectedDicom?.id === id) {
            setSelectedDicom(null);
        }
    };

    const selectDicom = (dicom: DicomMetadata | null) => {
        setSelectedDicom(dicom);
    };

    return (
        <DicomContext.Provider value={{
            dicomFiles,
            addDicomFiles,
            removeDicomFile,
            selectedDicom,
            selectDicom
        }}>
            {children}
        </DicomContext.Provider>
    );
};

export const useDicom = () => {
    const context = useContext(DicomContext);
    if (context === undefined) {
        throw new Error('useDicom must be used within a DicomProvider');
    }
    return context;
};
