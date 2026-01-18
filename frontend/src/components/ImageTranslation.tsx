import { useState } from 'react';
import { FolderOpen, ArrowRight, Loader } from 'lucide-react';
import api from '../api/calls';

function ImageTranslation() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [direction, setDirection] = useState('A_to_B');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setGeneratedImageUrl(null);
            setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        // Map direction to target modality
        // Assumption: A=CT, B=MRI
        // A_to_B -> Target: MRI
        // B_to_A -> Target: CT
        const targetModality = direction === 'A_to_B' ? 'MRI' : 'CT';
        formData.append('target_modality', targetModality);

        try {
            const response = await api.post('/api/translate/gan/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob', // Important for image response
            });

            const url = URL.createObjectURL(response.data);
            setGeneratedImageUrl(url);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Translation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-8 bg-[#1E1E1E] overflow-hidden">
            <div>
                <h1 className="text-white/90 text-3xl font-semibold">DeCGAN Image Translation</h1>
                <p className="text-white/60 text-sm mt-2">Upload an image and select the translation direction</p>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 mt-6">
                <div className="flex-1 bg-[#2B2B2B] border border-dashed border-[#3E3E42] rounded-lg relative">
                    <p className="text-sm m-2 text-white/60 absolute top-0 left-0">Input Image</p>
                    <div className="h-96 flex flex-col items-center justify-center p-4">
                        {previewUrl ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={previewUrl}
                                    alt="Input"
                                    className="w-full h-full object-contain rounded-lg"
                                />
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
                                        setGeneratedImageUrl(null);
                                    }}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <label
                                htmlFor="image-upload"
                                className="flex flex-col items-center justify-center cursor-pointer transition hover:bg-[#35393F]/30 rounded-lg w-full h-full"
                            >
                                <FolderOpen className="h-12 w-12 text-white/60 mb-4" />
                                <span className="text-white/80 font-medium text-lg mb-1">Upload Image</span>
                                <span className="text-white/50 text-xs mb-4 text-center">
                                    Drag &amp; drop, or click to select a file
                                </span>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-center lg:rotate-0 rotate-90">
                    <ArrowRight className="text-white/20 h-8 w-8" />
                </div>

                <div className="flex-1 bg-[#2B2B2B] border border-dashed border-[#3E3E42] rounded-lg relative">
                    <p className="text-sm m-2 text-white/60 absolute top-0 left-0">Generated Image</p>
                    <div className="h-96 flex flex-col items-center justify-center p-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader className="animate-spin text-[#00A9E0] h-8 w-8" />
                                <span className="text-white/60 text-sm">Translating...</span>
                            </div>
                        ) : generatedImageUrl ? (
                            <img
                                src={generatedImageUrl}
                                alt="Generated"
                                className="w-full h-full object-contain rounded-lg"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-white/30">
                                <span className="text-sm">No image generated yet</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls section */}
            <div className="mt-6 max-w-md flex flex-col gap-4">
                <div className="border border-[#3E3E42] rounded-lg p-2 bg-[#2B2B2B]">
                    <label className="block text-sm text-white/90 mb-2">Translation Direction</label>
                    <select
                        value={direction}
                        onChange={(e) => setDirection(e.target.value)}
                        className="w-full bg-[#2B2B2B] border border-[#3E3E42] rounded-md px-4 py-2 focus:ring-[#00A9E0] focus:ring-2 text-white outline-none"
                    >
                        <option value="A_to_B">CT to MRI (A to B)</option>
                        <option value="B_to_A">MRI to CT (B to A)</option>
                    </select>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!selectedFile || isLoading}
                    className={`
                        py-3 rounded-md font-semibold transition flex items-center justify-center gap-2
                        ${!selectedFile || isLoading
                            ? 'bg-[#3E3E42] text-white/30 cursor-not-allowed'
                            : 'bg-[#00A9E0] hover:bg-[#0066AA] text-white'}
                    `}
                >
                    {isLoading ? 'Generating...' : 'Generate Translation'}
                </button>
            </div>
            <div></div>
        </div>
    );
}

export default ImageTranslation;