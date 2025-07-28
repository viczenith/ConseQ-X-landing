import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { generateSystemReport } from './utils/aiPromptGenerator';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function AssessmentResults({
  isOpen,
  onClose,
  scores,
  userInfo,
  selectedSystems,
  darkMode
}) {
  const [analysisContent, setAnalysisContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const analysisRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      (async () => {
        try {
          const report = await generateSystemReport({ scores, userInfo, selectedSystems });
          setAnalysisContent(report);
        } catch (err) {
          setAnalysisContent('Error generating report. Please try again.');
        } finally {
          setLoading(false);
          setPdfReady(true);
        }
      })();
    } else {
      // cleanup
      setAnalysisContent('');
      setLoading(false);
      setPdfReady(false);
    }
  }, [isOpen, scores, userInfo, selectedSystems]);

  const downloadPDF = () => {
    if (!analysisRef.current) return;
    html2canvas(analysisRef.current, {
      scale: 2,
      backgroundColor: darkMode ? '#1f2937' : '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${userInfo.organization || 'assessment'}_report.pdf`);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className={`relative w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl flex flex-col ${
              darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <FaTimes />
            </button>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {loading ? (
                <p className="text-center text-lg">
                  Generating AI Analysis...
                </p>
              ) : (
                <div ref={analysisRef} className="prose prose-lg dark:prose-invert max-w-none">
                  {analysisContent.split('\n').map((line, idx) =>
                    line.trim() ? <p key={idx}>{line}</p> : <br key={`br-${idx}`} />
                  )}
                </div>
              )}
            </div>

            {!loading && (
              <div className="flex justify-end items-center space-x-4 p-4 border-t">
                <button
                  onClick={downloadPDF}
                  className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaDownload className="mr-2" /> Download PDF
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
