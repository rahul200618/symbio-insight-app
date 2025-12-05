import { motion } from 'motion/react';
import { AnimatedPage } from '../components/AnimatedPage';
import { UploadSection } from '../components/UploadSection';
import { useNavigate } from 'react-router-dom';

export function DashboardPage({ onUploadComplete }) {
    const navigate = useNavigate();

    const handleUpload = (sequences) => {
        if (onUploadComplete) {
            onUploadComplete(sequences);
        }
        // Navigate to metadata after upload
        navigate('/metadata');
    };

    return (
        <AnimatedPage animation="slide-up">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                <UploadSection onUploadComplete={handleUpload} />
            </motion.div>
        </AnimatedPage>
    );
}
