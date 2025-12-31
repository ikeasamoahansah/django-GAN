import { Users, Search, Hand, Target, Ruler, User } from 'lucide-react';

const menuItems = [
    { name: 'File', icon: Users },
    { name: 'Edit', icon: Search },
    { name: 'View', icon: Hand },
    { name: 'Tools', icon: Target },
    { name: 'Window', icon: Ruler },
    { name: 'Help', icon: User },
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
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            className="p-1 hover:bg-[#3E3E42] transition-colors flex items-center justify-center border-0 outline-none focus:outline-none"
                            aria-label={item.name}
                        >
                            <Icon className="w-4 h-4" size={20}/>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

export default Nav;