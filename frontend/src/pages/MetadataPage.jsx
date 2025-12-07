import { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '../components/AnimatedPage';
import { MetadataCards } from '../components/MetadataCards';
import { Icons } from '../components/Icons';

export function MetadataPage({ parsedSequences }) {
    const [generatingReport, setGeneratingReport] = useState(false);
    const navigate = useNavigate();

    const handleGenerateReport = async () => {
        if (!parsedSequences || parsedSequences.length === 0) {
            toast.error('No sequences available to generate report');
            return;
        }

        setGeneratingReport(true);
        toast.loading('Generating comprehensive report...', { id: 'report-gen' });

        // Simulate report generation
        setTimeout(() => {
            setGeneratingReport(false);
            toast.success('Report generated successfully!', { id: 'report-gen' });
            navigate('/report');
        }, 1500);
    };

    console.log('MetadataPage rendered, parsedSequences:', parsedSequences);

    return (
        <AnimatedPage animation="slide-up">
            {/* Header with Generate Report Button */}
            <motion.div
                className="flex items-center justify-between mb-6 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'relative', zIndex: 10 }}
            >
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Sequence Metadata
                    </h2>
                    {parsedSequences && parsedSequences.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {parsedSequences.length} sequence{parsedSequences.length !== 1 ? 's' : ''} loaded
                        </p>
                    )}
                </div>

                {/* Generate Report Button - Always visible */}
                <motion.button
                    onClick={() => {
                        console.log('Generate Report clicked');
                        handleGenerateReport();
                    }}
                    disabled={generatingReport}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    whileHover={{ scale: generatingReport ? 1 : 1.05, y: generatingReport ? 0 : -2 }}
                    whileTap={{ scale: generatingReport ? 1 : 0.95 }}
                >
                    {generatingReport ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Icons.Loader className="w-4 h-4" />
                            </motion.div>
                            Generating...
                        </>
                    ) : (
                        <>
                            <Icons.FileText className="w-4 h-4" />
                            Generate Report
                        </>
                    )}
                </motion.button>
            </motion.div>

            {/* Metadata Cards */}
            <MetadataCards parsedSequences={parsedSequences || []} />
        </AnimatedPage>
    );
}
