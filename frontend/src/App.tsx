import { useState } from 'react'

// css import
import './App.css'

// components import
import Nav from './components/Nav';
import Side from './components/Side';
import Status from './components/Status';
import MainContent from './components/MainContent';
import { AuthProvider } from "./auth/AuthContext";

function App() {
  const [selectedSidebarItem, setSelectedSidebarItem] = useState('add-dicom');

  return (
    <AuthProvider>
      <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-gray-300 overflow-hidden ">
        <Nav/>
        <div className="flex flex-1 overflow-hidden">
          <Side selectedItem={selectedSidebarItem} onItemSelect={setSelectedSidebarItem}/>
          <MainContent selectedItem={selectedSidebarItem} />
        </div>
        <Status/>
      </div>
    </AuthProvider>
  )
}

export default App
