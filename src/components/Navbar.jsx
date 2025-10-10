import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
    const [open, setOpen] = useState(false); // mobile menu
    const [subOpen, setSubOpen] = useState(false); // mobile submenu
    const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false); // desktop dropdown
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDesktopDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="bg-gray-900 text-white p-4 shadow-lg">
            <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <img src="/logo192.png" alt="Logo" className="w-12 h-12" />
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold">Άκrος</h1>
                        <span className="text-sm text-gray-300">Consultancy Services</span>
                    </div>
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden text-3xl"
                    onClick={() => setOpen(!open)}
                >
                    ☰
                </button>

                {/* Desktop Menu */}
                <ul className="hidden md:flex gap-6 items-center">
                    <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
                    <li><Link to="/about" className="hover:text-yellow-400">About</Link></li>
                    <li><Link to="/services" className="hover:text-yellow-400">Services</Link></li>
                    <li><Link to="/projects" className="hover:text-yellow-400">Projects</Link></li>
                    <li><Link to="/certificates" className="hover:text-yellow-400">Certificates</Link></li>

                    {/* Desktop Dropdown */}
                    <li className="relative" ref={dropdownRef}>
                        <button
                            className="hover:text-yellow-400 cursor-pointer flex items-center gap-1"
                            onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                        >
                            Cost Intelligence ▾
                        </button>
                        {desktopDropdownOpen && (
                            <ul className="absolute left-0 bg-gray-800 text-white rounded-lg mt-2 p-2 shadow-lg min-w-[220px] flex flex-col gap-2 z-50">
                                <li>
                                    <Link
                                        to="/admin"
                                        className="block px-2 py-1 hover:text-yellow-400"
                                        onClick={() => setDesktopDropdownOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/prices"
                                        className="block px-2 py-1 hover:text-yellow-400"
                                        onClick={() => setDesktopDropdownOpen(false)}
                                    >
                                        Overview
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/input"
                                        className="block px-2 py-1 hover:text-yellow-400"
                                        onClick={() => setDesktopDropdownOpen(false)}
                                    >
                                        Input Page
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/rateinput"
                                        className="block px-2 py-1 hover:text-yellow-400"
                                        onClick={() => setDesktopDropdownOpen(false)}
                                    >
                                        Rate Input Page
                                    </Link>
                                </li>

                                {/* NEW ROUTES */}
                                <li>
                                    <Link
                                        to="/materials"
                                        className="block px-2 py-1 hover:text-yellow-400"
                                        onClick={() => setDesktopDropdownOpen(false)}
                                    >
                                        Material Page
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/suppliers"
                                        className="block px-2 py-1 hover:text-yellow-400"
                                        onClick={() => setDesktopDropdownOpen(false)}
                                    >
                                        Supplier Registration
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/supplier-prices"
                                        className="block px-2 py-1 hover:text-yellow-400"
                                        onClick={() => setDesktopDropdownOpen(false)}
                                    >
                                        Supplier Enter Price
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    <li><Link to="/contact" className="hover:text-yellow-400">Contact</Link></li>
                </ul>
            </div>

            {/* Mobile Menu */}
            {open && (
                <ul className="flex flex-col gap-4 mt-4 md:hidden">
                    <li><Link to="/" onClick={() => setOpen(false)}>Home</Link></li>
                    <li><Link to="/about" onClick={() => setOpen(false)}>About</Link></li>
                    <li><Link to="/services" onClick={() => setOpen(false)}>Services</Link></li>
                    <li><Link to="/projects" onClick={() => setOpen(false)}>Projects</Link></li>
                    <li><Link to="/certificates" onClick={() => setOpen(false)}>Certificates</Link></li>

                    {/* Mobile Dropdown */}
                    <li>
                        <button
                            className="w-full text-left"
                            onClick={() => setSubOpen(!subOpen)}
                        >
                            Cost Intelligence ▾
                        </button>
                        {subOpen && (
                            <ul className="ml-4 mt-2 flex flex-col gap-2">
                                <li><Link to="/prices" onClick={() => setOpen(false)}>Overview</Link></li>
                                <li><Link to="/input" onClick={() => setOpen(false)}>Input Page</Link></li>
                                <li><Link to="/rateinput" onClick={() => setOpen(false)}>Rate Input Page</Link></li>

                                {/* NEW ROUTES in Mobile */}
                                <li><Link to="/materials" onClick={() => setOpen(false)}>Material Page</Link></li>
                                <li><Link to="/suppliers" onClick={() => setOpen(false)}>Supplier Registration</Link></li>
                                <li><Link to="/supplier-prices" onClick={() => setOpen(false)}>Supplier Enter Price</Link></li>
                            </ul>
                        )}
                    </li>

                    <li><Link to="/contact" onClick={() => setOpen(false)}>Contact</Link></li>
                </ul>
            )}
        </nav>
    );
};

export default Navbar;
