import { AnimatedPage } from '../components/AnimatedPage';
import { ReportViewer } from '../components/ReportViewer';

export function ReportPage({ parsedSequences }) {
    return (
        <AnimatedPage animation="slide-up">
            <ReportViewer parsedSequences={parsedSequences || []} />
        </AnimatedPage>
    );
}
