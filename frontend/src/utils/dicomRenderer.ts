import * as daikon from 'daikon';

export const renderDicomToDataURL = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const arrayBuffer = reader.result as ArrayBuffer;
                const dataView = new DataView(arrayBuffer);
                const image = daikon.Series.parseImage(dataView);

                if (!image) {
                    reject(new Error('Could not parse DICOM image'));
                    return;
                }

                // Determine dimensions
                const width = image.getCols();
                const height = image.getRows();

                // Create a canvas to render
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                const imageData = ctx.createImageData(width, height);
                const data = image.getInterpretedData(); // Float32Array or similar
                const numPixels = width * height;
                
                // Find min/max for normalization
                let min = Infinity;
                let max = -Infinity;
                for (let i = 0; i < numPixels; i++) {
                    if (data[i] < min) min = data[i];
                    if (data[i] > max) max = data[i];
                }
                const range = max - min;

                // Render to imageData (Grayscale)
                // Daikon's getInterpretedData returns raw values (HU or similar)
                // We map to 0-255
                for (let i = 0; i < numPixels; i++) {
                    const val = data[i];
                    // Simple linear normalization
                    const normalized = range === 0 ? 0 : Math.floor(((val - min) / range) * 255);
                    
                    const p = i * 4;
                    imageData.data[p] = normalized;     // R
                    imageData.data[p + 1] = normalized; // G
                    imageData.data[p + 2] = normalized; // B
                    imageData.data[p + 3] = 255;        // Alpha
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL());

            } catch (error) {
                console.error('Error rendering DICOM:', error);
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
