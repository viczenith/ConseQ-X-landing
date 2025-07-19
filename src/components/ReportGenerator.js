import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';

export default function ReportGenerator({ analysis, userInfo }) {
  return (
    <div className="text-center p-4 bg-gray-100 rounded-lg">
      <PDFDownloadLink 
        document={<ReportPDF analysis={analysis} userInfo={userInfo} />}
        fileName={`${userInfo.organization}_assessment_report.pdf`}
      >
        {({ loading }) => (
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Preparing PDF...' : 'Download Full Report (PDF)'}
          </button>
        )}
      </PDFDownloadLink>
    </div>
  );
}