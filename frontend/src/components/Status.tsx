function Status() {
    return (
        <div className="bg-[#1e1e1e] px-2 py-1 flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center space-x-6">
                <span>Patient: John Smith</span>
                <span>PID: 123456789</span>
                <span>DOB: 01-Jan-1960</span>
                <span>Study: CT Abdomen/Pelvis</span>
            </div>
            <div className="flex items-center space-x-6">
                <span>Status: Ready</span>
                <span className="flex items-center space-x-2">
                    <span>Connection:</span>
                    <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>Connected</span>
                    </span>
                </span>
                <span>Server: PACS_PROD</span>
            </div>
        </div>
    );
}

export default Status;