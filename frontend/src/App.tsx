import { useState } from 'react'

// css import
import './App.css'

// components import
import Nav from './components/Nav';
import Side from './components/Side';
import Status from './components/Status';
import MainContent from './components/MainContent';
import { AuthProvider } from "./auth/AuthContext";
import { DicomProvider } from "./context/DicomContext";

function App() {
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('add-dicom');

  return (
    <AuthProvider>
      <DicomProvider>
        <div className="h-dvh w-screen flex flex-col bg-[#1e1e1e] text-gray-300 overflow-hidden ">
          <Nav/>
          <div className="flex flex-1 overflow-hidden">
            <Side selectedItem={selectedSidebarItem} onItemSelect={setSelectedSidebarItem}/>
            <MainContent selectedItem={selectedSidebarItem} onNavigate={setSelectedSidebarItem} />
          </div>
          <Status/>
        </div>
      </DicomProvider>
    </AuthProvider>
  )
}

export default App
