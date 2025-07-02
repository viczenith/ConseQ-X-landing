// src/Layout.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Logo3D from './assets/ConseQ-X-3d.png';

export default function Layout({ children, darkMode }) {
  return (
    <>
      {/* Main content */}
      <main className="min-h-[calc(100vh-200px)]">{children}</main>

      {/* Footer with Attribution */}
      <footer className={`py-12 bg-gray-900`}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center">
                  {/* Footer Logo with enhanced glow */}
                  <motion.img 
                    src={Logo3D} 
                    alt="ConseQ-X Logo" 
                    className="h-20 w-auto mr-3 transition-all duration-500"
                    animate={{
                      filter: darkMode 
                        ? "drop-shadow(0 0 8px rgba(234, 179, 8, 0.8))" 
                        : "drop-shadow(0 0 6px rgba(234, 179, 8, 0.6))"
                    }}
                  />
                </div>
                <p className="mt-4 text-sm max-w-xs text-gray-400">
                  Engineering Healthier, Aligned, and More Effective Organizations
                  <br />
                  <span>Email Us: </span>
                  <a href="mailto:osd@conseq-x.com" className="text-yellow-500 hover:underline">
                    osd@conseq-x.com
                  </a>
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {/** Company Links **/}
                <div>
                  <h3 className="text-white font-medium mb-4">Company</h3>
                  <ul className="space-y-2">
                    {['vision','mission','services','approach'].map(item => (
                      <li key={item}>
                        <a href={`#${item}`} className="text-gray-400 hover:text-yellow-500 transition-colors">
                          {item.charAt(0).toUpperCase()+item.slice(1)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/** Connect Links **/}
                <div>
                  <h3 className="text-white font-medium mb-4">Connect</h3>
                  <ul className="space-y-2">
                    {['LinkedIn','Twitter','Instagram'].map(social => (
                      <li key={social}>
                        <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                          {social}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/** Legal Links **/}
                <div>
                  <h3 className="text-white font-medium mb-4">Legal</h3>
                  <ul className="space-y-2">
                    {['Privacy Policy','Terms of Service'].map(text => (
                      <li key={text}>
                        <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                          {text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center text-gray-500">
              © {new Date().getFullYear()} ConseQ-X. All rights reserved.
              <div className="mt-2 text-gray-600">
                Designed and Developed by{' '}
                <a className="text-yellow-500" href="https://www.fescode.com" target="_blank" rel="noopener">
                  <em>FesCode Limited</em>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
