import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function AccessDenied() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Πρόσβαση Απορρίφθηκε
                </h1>
                <p className="text-gray-600 mb-6">
                    Δεν έχετε δικαίωμα πρόσβασης σε αυτή τη σελίδα.
                    Εάν πιστεύετε ότι αυτό είναι λάθος, επικοινωνήστε με τον διαχειριστή του συστήματος.
                </p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Home className="h-4 w-4" />
                    Επιστροφή στην Αρχική
                </Link>
            </div>
        </div>
    );
}
