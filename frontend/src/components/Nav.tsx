import { Users, Search, Hand, Target, Ruler, User } from 'lucide-react';

const menuItems = [
    { name: 'File', icon: Users },
    { name: 'Edit', icon: Search },
    { name: 'View', icon: Hand },
    { name: 'Tools', icon: Target },
    { name: 'Window', icon: Ruler },
];

function Nav() {
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
                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-36 bg-[#232323] border border-[#444] rounded shadow-lg py-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 pointer-events-none group-focus-within:pointer-events-auto group-hover:pointer-events-auto transition-opacity z-20">
                        <button
                            className="block w-full text-left px-4 py-2 hover:bg-[#3E3E42] text-white/90 text-sm"
                            // placeholder onClick for sign-in
                            onClick={() => alert('Sign in')}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
                {/* <button className="p-1 hover:bg-[#3E3E42] transition-colors flex items-center justify-center border-0 outline-none focus:outline-none">
                    <User className="w-4 h-4" size={20} />
                </button> */}
            </div>
        </nav>
    );
}

export default Nav;