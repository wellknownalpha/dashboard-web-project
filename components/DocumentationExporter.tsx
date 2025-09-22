import React from 'react';
import { exportDocumentationToPDF, exportDocumentationToWord } from '../utils/documentationExport';

/**
 * Documentation Exporter Component
 * Provides buttons to export documentation in PDF and Word formats
 */
const DocumentationExporter: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📚 Export Documentation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Download the complete application documentation in your preferred format.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
                {/* PDF Export Button */}
                <button
                    onClick={exportDocumentationToPDF}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                >
                    <span className="text-lg">📄</span>
                    <span>Export as PDF</span>
                </button>

                {/* Word Export Button */}
                <button
                    onClick={exportDocumentationToWord}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                    <span className="text-lg">📝</span>
                    <span>Export as Word Document</span>
                </button>
            </div>

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p><strong>PDF:</strong> Professional format suitable for printing and sharing</p>
                <p><strong>Word:</strong> Editable HTML format that opens in Microsoft Word</p>
            </div>
        </div>
    );
};

export default DocumentationExporter;