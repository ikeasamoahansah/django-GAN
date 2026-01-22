import dicomParser from 'dicom-parser';

export interface ParsedDicom {
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

export const parseDicomFile = async (file: File): Promise<ParsedDicom> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (fileEvent) => {
            try {
                const arrayBuffer = fileEvent.target?.result as ArrayBuffer;
                const byteArray = new Uint8Array(arrayBuffer);
                const dataSet = dicomParser.parseDicom(byteArray);

                // Helper to format date YYYYMMDD -> YYYY-MM-DD
                const formatDate = (dateStr?: string) => {
                    if (!dateStr || dateStr.length !== 8) return dateStr || 'Unknown';
                    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
                };

                const patientName = dataSet.string('x00100010') || 'Unknown';
                const patientId = dataSet.string('x00100020') || 'Unknown';
                const studyDate = formatDate(dataSet.string('x00080020'));
                const modality = dataSet.string('x00080060') || 'Unknown';
                const description = dataSet.string('x00081030') || 'Unknown';
                const seriesNumber = dataSet.string('x00200011') || '0';
                const instanceNumber = dataSet.string('x00200013') || '0';

                resolve({
                    id: crypto.randomUUID(),
                    file,
                    patientName,
                    patientId,
                    studyDate,
                    modality,
                    description,
                    seriesNumber,
                    instanceNumber
                });
            } catch (error) {
                console.warn('Error parsing DICOM:', error);
                // Fallback for non-DICOM files or parse errors
                resolve({
                    id: crypto.randomUUID(),
                    file,
                    patientName: 'Unknown',
                    patientId: 'Unknown',
                    studyDate: new Date().toISOString().split('T')[0],
                    modality: 'Unknown',
                    description: file.name,
                    seriesNumber: '0',
                    instanceNumber: '0'
                });
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
