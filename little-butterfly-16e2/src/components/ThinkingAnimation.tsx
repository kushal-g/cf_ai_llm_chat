import { useEffect, useState } from 'react';
import './ThinkingAnimation.css';

export default function ThinkingAnimation() {
    return (
        <div className="thinking-container">
            <div className="thinking-bubble">
                <div className="thinking-dots">
                    <span className="dot dot-1"></span>
                    <span className="dot dot-2"></span>
                    <span className="dot dot-3"></span>
                </div>
            </div>
        </div>
    );
}
