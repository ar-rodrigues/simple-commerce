'use client'
import { useState, useEffect } from 'react';
import { Layout, Drawer } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  RiHomeLine,
  RiContactsLine,
  RiInformationLine,
  RiShoppingBagLine,
  RiMenuLine,
  RiCloseLine
} from 'react-icons/ri';

const { Header } = Layout;

const navItems = [
  { href: '/', label: 'Inicio', icon: <RiHomeLine /> },
  { href: '#productos', label: 'Productos', icon: <RiShoppingBagLine /> },
  { href: '#nosotros', label: 'Nosotros', icon: <RiInformationLine /> },
  { href: '#contacto', label: 'Contacto', icon: <RiContactsLine /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger animation when scrolled past 100px
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check initial size
    handleResize();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNavClick = (href) => {
    if (href === '/') {
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href.startsWith('#')) {
      // Scroll to section
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setDrawerOpen(false);
  };

  return (
    <Header className="bg-transparent fixed top-4 left-0 right-0 z-50 pb-4">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* White Pill-Shaped Navbar */}
        <div 
          onClick={(isScrolled || isMobile) && !drawerOpen ? () => setDrawerOpen(true) : undefined}
          className={`bg-white rounded-full shadow-lg border border-gray-100 py-3 flex items-center justify-center transition-all duration-500 ease-in-out ${
            (isScrolled || isMobile)
              ? 'w-14 h-14 cursor-pointer hover:shadow-2xl' 
              : 'w-full px-4 md:px-6'
          }`}
        >
          {/* Burger Icon - Shows when scrolled or on mobile, but not when drawer is open */}
          <div className={`transition-all duration-500 ${
            (isScrolled || isMobile) && !drawerOpen
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-0 absolute'
          }`}>
            <RiMenuLine className="text-2xl text-gray-600" />
          </div>

          {/* Full Navbar Content - Shows when not scrolled and not mobile */}
          <div className={`flex items-center justify-between w-full transition-all duration-500 ${
            (isScrolled || isMobile)
              ? 'opacity-0 scale-0 absolute pointer-events-none' 
              : 'opacity-100 scale-100'
          }`}>
            {/* Left Section - Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-green-700 hover:text-green-800 transition-colors whitespace-nowrap">
                  Catálogo Pro
                </span>
              </Link>
            </div>

            {/* Center Section - Navigation Links */}
            <nav className="flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'text-green-700 bg-green-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-base ${isActive ? 'text-green-700' : 'text-gray-500'}`}>{item.icon}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Drawer Menu */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-8">
            <span>Menú</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cerrar menú"
            >
              <RiCloseLine className="text-2xl text-gray-600" />
            </button>
          </div>
        }
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        closable={false}
        className="navbar-drawer"
      >
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className={`px-4 py-3 rounded-full text-base font-medium transition-all duration-200 flex items-center gap-3 ${
                  isActive
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className={`text-xl ${isActive ? 'text-green-700' : 'text-gray-500'}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </Drawer>
    </Header>
  );
}
