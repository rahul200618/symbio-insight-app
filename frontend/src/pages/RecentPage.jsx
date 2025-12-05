import { motion } from 'motion/react';
import { AnimatedPage } from '../components/AnimatedPage';
import { RecentUploads } from '../components/RecentUploads';
import { useNavigate } from 'react-router-dom';

export function RecentPage({ onFileSelect }) {
    const navigate = useNavigate();

    const handleFileSelect = (file) => {
        if (onFileSelect) {
            onFileSelect(file);
        }
        // Navigate to report page when file is selected
        navigate('/report');
    };

    return (
        <AnimatedPage animation="slide-up">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                <RecentUploads onFileSelect={handleFileSelect} />
            </motion.div>
        </AnimatedPage>
    );
}
