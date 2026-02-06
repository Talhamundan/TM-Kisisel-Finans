import { useState } from 'react';
import { BiCommentDetail } from 'react-icons/bi'; // Comment Icon

const FeedbackButton = ({ onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const buttonStyle = {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#ed8936', // Project accent color
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '26px', // Slightly larger icon
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: isHovered ? 'translateY(-5px) scale(1.1)' : 'translateY(0) scale(1)', // More pronounced bounce
    };

    return (
        <button
            style={buttonStyle}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title="Geliştiriciye Not Bırak"
        >
            <BiCommentDetail />
        </button>
    );
};

export default FeedbackButton;
