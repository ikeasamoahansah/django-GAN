import { Users, Search, Hand, Target, Ruler, User } from 'lucide-react';

// import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from "../auth/AuthContext";
import LoginModal from "./LoginModal";

interface User {
    id: number;
    username: string;
    email?: string;
}

const menuItems = [
    { name: 'File', icon: Users },
    { name: 'Edit', icon: Search },
    { name: 'View', icon: Hand },
    { name: 'Tools', icon: Target },
    { name: 'Window', icon: Ruler },
];

function Nav() {

    const { user, login, logout } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    return (
        <nav className="h-15 bg-[#2B2B2B] border-b border-[#3E3E42] flex items-center justify-between px-3">
            {/* Left side - Text menu items */}
            <div className="flex items-center space-x-4">
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        className="px-2 py-0 hover:bg-[#3E3E42] transition-colors whitespace-nowrap border-0 outline-none focus:outline-none"
                    >
                        {item.name}
                    </button>
                ))}
            </div>
            {/* Right side - Icons aligned with text items */}
            <div className="flex items-center space-x-4">
                {menuItems.map((item, index) => {
                    const Icon = item.icon ? item.icon : null;
                    return (
                        <button
                            key={index}
                            className="p-1 hover:bg-[#3E3E42] transition-colors flex items-center justify-center border-0 outline-none focus:outline-none"
                            aria-label={item.name}
                        >
                            {Icon && <Icon className="w-4 h-4" size={20}/>}
                        </button>
                    );
                })}

                {/* User icon with dropdown */}
                <div className="relative group">
                    <button
                        className="p-1 hover:bg-[#3E3E42] transition-colors flex items-center justify-center border-0 outline-none focus:outline-none"
                        aria-label="User menu"
                        tabIndex={0}
                    >
                        <User className="w-4 h-4" size={20} />
                    </button>
                    {/* <button className="text-white px-3 py-2">
                        {user ? user.username : "Account"}
                    </button> */}

                    <div className="absolute right-0 mt-2 w-44 bg-[#232323] rounded shadow-lg py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">

                        {!user && (
                            <button
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-[#3E3E42]"
                                onClick={() => setShowLogin(true)}
                            >
                                Sign In
                            </button>
                        )}

                        {user && (
                            <>
                                <div className="px-4 py-2 text-sm text-white border-b border-[#444]">
                                    Signed in as <b>{user.username}</b>
                                </div>

                                <button
                                    onClick={logout}
                                    className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#3E3E42]"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>

                    <LoginModal
                        show={showLogin}
                        onClose={() => setShowLogin(false)}
                        onLoginSuccess={login}
                    />
                </div>
            </div>
        </nav>
    );
}

export default Nav;