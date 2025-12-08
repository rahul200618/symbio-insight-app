import { AnimatedPage } from '../components/AnimatedPage';
import { ReportViewer } from '../components/ReportViewer';
import { useState, useEffect } from 'react';
import { getSequences } from '../utils/sequenceApi';
import { toast } from 'sonner';

export function ReportPage({ parsedSequences }) {
    const [sequences, setSequences] = useState(parsedSequences || []);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-load most recent upload if no sequences are provided
    useEffect(() => {
        const loadRecentSequence = async () => {
            // Only auto-load if no sequences are provided
            if (!sequences || sequences.length === 0) {
                setIsLoading(true);
                try {
                    console.log('No sequences provided, attempting to load most recent upload...');
                    const response = await getSequences({ page: 1, limit: 1, sort: '-createdAt' });

                    if (response.data && response.data.length > 0) {
                        const recentSeq = response.data[0];

                        // Transform backend data to parsedSequences format
                        const transformedSeq = {
                            id: recentSeq.id,
                            name: recentSeq.name || recentSeq.filename,
                            header: recentSeq.header,
                            sequence: recentSeq.sequence,
                            length: recentSeq.length,
                            sequenceLength: recentSeq.length,
                            gcPercentage: recentSeq.gcPercent || recentSeq.gcContent,
                            gcContent: recentSeq.gcPercent || recentSeq.gcContent,
                            nucleotideCounts: recentSeq.nucleotideCounts || {
                                A: recentSeq.aCount || 0,
                                T: recentSeq.tCount || 0,
                                G: recentSeq.gCount || 0,
                                C: recentSeq.cCount || 0
                            },
                            orfCount: recentSeq.orfCount || 0,
                            orfs: recentSeq.orfs || []
                        };

                        setSequences([transformedSeq]);
                        toast.success('Loaded most recent upload');
                        console.log('Auto-loaded sequence:', transformedSeq);
                    } else {
                        console.log('No recent uploads found');
                    }
                } catch (error) {
                    console.error('Failed to auto-load recent upload:', error);
                    // Silently fail - user will see empty state
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadRecentSequence();
    }, []);

    // Update sequences when prop changes
    useEffect(() => {
        if (parsedSequences && parsedSequences.length > 0) {
            setSequences(parsedSequences);
        }
    }, [parsedSequences]);

    return (
        <AnimatedPage animation="slide-up">
            <ReportViewer parsedSequences={sequences} isLoading={isLoading} />
        </AnimatedPage>
    );
}
