import {FolderOpen} from 'lucide-react';

function ImageTranslation() {
    
    return (
        <div className="flex-1 flex flex-col p-8 bg-[#1E1E1E] overflow-hidden">
            <div>
                <h1 className="text-white/90 text-3xl font-semibold">Cycle GAN Image Translation</h1>
                <p className="text-white/60 text-sm mt-2">Upload an image and select the translation direction</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 mt-6">
                <div className="flex-1 bg-[#2B2B2B] border border-dashed border-[#3E3E42] rounded-lg">
                    <p className="text-sm m-2 text-white/60">Input Image</p>
                    <div className="h-72 flex flex-col items-center justify-center p-8">
                        <FolderOpen className="h-12 w-12 text-white/60 mb-4" />
                        <span className="text-white/80 font-medium text-lg mb-1">Upload Image</span>
                        <span className="text-white/50 text-xs mb-4 text-center">
                            Drag & drop, or click to select a file
                        </span>
                    </div>
                </div>
                <div className="flex-1 bg-[#2B2B2B] border border-dashed border-[#3E3E42] rounded-lg">
                    <p className="text-sm m-2 text-white/60">Generated Image</p>
                    <div className="h-72 flex flex-col items-center justify-center p-8">
                        {/* Placeholder for generated image */}
                        <div className="w-full h-full bg-[#232323] rounded flex items-center justify-center border border-[#444] border-dashed">
                            <span className="text-white/40 text-sm">No image generated yet</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Controls section */}
            <div className="mt-6 max-w-md flex flex-col gap-4">
                <div className="border border-[#3E3E42] rounded-lg p-2 bg-[#2B2B2B]">
                    <label className="block text-sm text-white/90 mb-2">Translation Direction</label>
                    <select className="w-full bg-[#2B2B2B] border border-[#3E3E42] rounded-md px-4 py-2 focus:ring-[#00A9E0] focus:ring-2">
                        <option>A_to_B</option>
                        <option>B_to_A</option>
                    </select>
                </div>

                <button className="bg-[#00A9E0] hover:bg-[#0066AA] py-3 rounded-md font-semibold transition">
                    Generate
                </button>
            </div>
            <div></div>
        </div>
    );
}

export default ImageTranslation;