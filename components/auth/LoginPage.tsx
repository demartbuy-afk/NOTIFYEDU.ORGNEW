import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import HomePage from '../common/HomePage';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    // The modal is open by default when this component renders
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleClose = () => {
        setIsModalOpen(false);
        // Navigate back to the homepage when the modal is closed
        navigate('/');
    };

    return (
        <>
            <HomePage />
            <LoginModal isOpen={isModalOpen} onClose={handleClose} />
        </>
    );
};

export default LoginPage;
