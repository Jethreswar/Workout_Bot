// frontend/src/components/MobileNav.js
import { useState } from 'react';

const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="mobile-nav-toggle" onClick={() => setIsOpen(!isOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
                <div className="mobile-nav-header">
                    <h2>Workout Tracker</h2>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                </div>
                <nav>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/profile">Profile</a></li>
                    </ul>
                </nav>
            </div>

            {isOpen && <div className="mobile-nav-overlay" onClick={() => setIsOpen(false)}></div>}
        </>
    );
};

export default MobileNav;