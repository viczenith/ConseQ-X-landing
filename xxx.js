// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import './index.css';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
// } from 'recharts';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// const questions = [
//   {
//     id: 1,
//     question: 'How often do you rely on instinct over data?',
//     options: ['Always', 'Sometimes', 'Rarely', 'Never'],
//   },
//   {
//     id: 2,
//     question: 'How do you delegate decision-making in your company?',
//     options: [
//       'I rarely delegate',
//       'Only to top executives',
//       'Structured delegation',
//       'I empower all departments',
//     ],
//   },
//   {
//     id: 3,
//     question: 'When a decision fails, what do you do?',
//     options: [
//       'Blame the team',
//       'Move on quickly',
//       'Review and learn',
//       'Involve others in post-mortem',
//     ],
//   },
// ];

// export default function App() {
//   const [step, setStep] = useState(-1);
//   const [name, setName] = useState('');
//   const [answers, setAnswers] = useState([]);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleStart = () => {
//     if (name.trim()) setStep(0);
//   };

//   const handleAnswer = async (answer) => {
//     const next = [...answers, answer];
//     setAnswers(next);

//     if (step + 1 < questions.length) {
//       setStep(step + 1);
//     } else {
//       setStep('complete');
//       setLoading(true);

//       try {
//         const res = await fetch('http://127.0.0.1:8000/api/submit-assessment/', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ full_name: name, answers: next }),
//         });
//         const j = await res.json();
//         setResult(j);
//       } catch (e) {
//         setResult({
//           insight: '⚠️ Unable to generate insight at the moment. Please try again later.',
//         });
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const downloadPDF = () => {
//     const input = document.getElementById('result');
//     html2canvas(input).then((canvas) => {
//       const img = canvas.toDataURL('image/png');
//       const doc = new jsPDF('p', 'mm', 'a4');
//       const w = doc.internal.pageSize.getWidth();
//       const h = (canvas.height * w) / canvas.width;
//       doc.addImage(img, 'PNG', 0, 0, w, h);
//       const date = new Date().toISOString().split('T')[0];
//       doc.save(`CEO_Insight_${name}_${date}.pdf`);
//     });
//   };

//   const progress = Math.round((answers.length / questions.length) * 100);

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white shadow-xl rounded-xl max-w-xl w-full p-6 sm:p-10">
//         <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">
//           CEO Insight Assessment
//         </h1>

//         {step >= 0 && step !== 'complete' && (
//           <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
//             <div
//               className="h-full bg-blue-600 rounded-full transition-all"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//         )}

//         <AnimatePresence mode="wait">
//           {step === -1 && (
//             <motion.div
//               key="name"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//               className="space-y-4"
//             >
//               <p className="text-center text-gray-700">
//                 Please enter your full name to begin.
//               </p>
//               <input
//                 type="text"
//                 placeholder="Your full name"
//                 className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//               <button
//                 onClick={handleStart}
//                 className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//               >
//                 Start Assessment
//               </button>
//             </motion.div>
//           )}

//           {Number.isInteger(step) && questions[step] && (
//             <motion.div
//               key={step}
//               initial={{ opacity: 0, x: 30 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -30 }}
//               className="space-y-4"
//             >
//               <h2 className="text-xl font-semibold text-gray-800">
//                 {questions[step].question}
//               </h2>
//               <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
//                 {questions[step].options.map((opt, i) => (
//                   <button
//                     key={i}
//                     onClick={() => handleAnswer(opt)}
//                     className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition"
//                   >
//                     {opt}
//                   </button>
//                 ))}
//               </div>
//               <p className="text-sm text-gray-500 text-center">
//                 Question {step + 1} of {questions.length}
//               </p>
//             </motion.div>
//           )}

//           {step === 'complete' && (
//             <motion.div
//               id="result"
//               key="complete"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="space-y-6"
//             >
//               {loading ? (
//                 <p className="text-center text-gray-600">🧠 Generating your insight...</p>
//               ) : (
//                 <>
//                   <h2 className="text-center text-2xl font-bold text-green-700">
//                     🎉 Assessment Complete
//                   </h2>

//                   <div className="space-y-6">
//                     <section>
//                       <h3 className="text-lg font-semibold text-blue-800">Leadership Insight</h3>
//                       <p className="text-gray-800 whitespace-pre-wrap">{result.insight}</p>
//                     </section>

//                     {result.side_effects && (
//                       <section>
//                         <h3 className="text-lg font-semibold text-red-700">Potential Side‑Effects</h3>
//                         <p className="text-gray-700 whitespace-pre-wrap">{result.side_effects}</p>
//                       </section>
//                     )}

//                     {result.recommendations && (
//                       <section>
//                         <h3 className="text-lg font-semibold text-green-800">Recommendations</h3>
//                         <p className="text-gray-700 whitespace-pre-wrap">{result.recommendations}</p>
//                       </section>
//                     )}

//                     {result.chart_data?.length > 0 && (
//                       <section>
//                         <h3 className="text-lg font-semibold text-indigo-700 mb-2">Leadership Metrics</h3>
//                         <ResponsiveContainer width="100%" height={200}>
//                           <BarChart data={result.chart_data}>
//                             <XAxis dataKey="name" />
//                             <YAxis />
//                             <Tooltip />
//                             <Bar dataKey="value" fill="#2563eb" />
//                           </BarChart>
//                         </ResponsiveContainer>
//                       </section>
//                     )}

//                     {result.illustration && (
//                       <section className="text-center">
//                         <img
//                           src={result.illustration}
//                           alt="AI illustration"
//                           className="mx-auto rounded-md shadow-md max-w-full"
//                         />
//                       </section>
//                     )}

//                     <button
//                       onClick={downloadPDF}
//                       className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
//                     >
//                       📥 Download Report as PDF
//                     </button>
//                     <button
//                       onClick={() => {
//                         localStorage.setItem("ceo_report", JSON.stringify(result));
//                         window.open("/print.html", "_blank");
//                       }}
//                       className="w-full mt-2 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800"
//                     >
//                       🖨️ Open Printable Report
//                     </button>

//                   </div>
//                 </>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }
