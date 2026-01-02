"use client";

import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { Settings, Printer, Download, Type, FileText } from 'lucide-react';

// --- Type Definitions ---
interface GeneratorState {
    name: string;
    fontSize: number;
    paperSize: 'letter' | 'a4';
    orientation: 'portrait' | 'landscape';
}

// --- Constants & Config ---
// USER: To add a custom font:
// 1. Place your .ttf file in `public/fonts/CustomFont.ttf`
// 2. Or paste the BASE64 string here CAREFULLY (must be one long line, no line breaks)
const customFontBase64 = "";

// Default font if custom is missing
const DEFAULT_FONT = "Courier";

const PAPER_DIMENSIONS = {
    letter: { width: 215.9, height: 279.4, name: 'US Letter' },
    a4: { width: 210, height: 297, name: 'A4' },
};

export default function NameTracingGenerator() {
    // --- State ---
    const [settings, setSettings] = useState<GeneratorState>({
        name: "Alex",
        fontSize: 40,
        paperSize: 'letter',
        orientation: 'portrait', // Default to portrait based on worksheet commonality
    });

    const [pdfUrl, setPdfUrl] = useState<string>("");
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // --- PDF Generation Engine ---
    // Re-implemented helper to be DRY
    const createDoc = () => {
        const { name, fontSize, paperSize, orientation } = settings;
        const isPortrait = orientation === 'portrait';
        const doc = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: paperSize,
        });

        if (customFontBase64) {
            doc.addFileToVFS('CustomFont.ttf', customFontBase64);
            doc.addFont('CustomFont.ttf', 'CustomFont', 'normal');
            doc.setFont('CustomFont');
        } else {
            doc.setFont(DEFAULT_FONT);
        }

        const dims = PAPER_DIMENSIONS[paperSize];
        const pageWidth = isPortrait ? dims.width : dims.height;
        const pageHeight = isPortrait ? dims.height : dims.width;
        const marginX = 20;

        // Header
        doc.setFontSize(24);
        doc.setTextColor(0, 0, 0);
        doc.text("Name Tracing Practice", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(14);
        if (!customFontBase64) doc.setFont(DEFAULT_FONT);
        doc.text(`Name: _______________________`, marginX, 32);
        doc.text(`Date: _______________________`, pageWidth - marginX, 32, { align: "right" });

        // Rows
        const marginTop = 40;
        const marginBottom = 15;
        const safeHeight = pageHeight - marginTop - marginBottom;
        const ptToMm = 0.352778;
        const fontHeightMm = fontSize * ptToMm;
        const rowTotalHeight = fontHeightMm * 2.5;
        const limitRows = Math.floor(safeHeight / rowTotalHeight);

        let drawY = marginTop + 10;

        for (let i = 0; i < limitRows; i++) {
            const topY = drawY;
            const midY = drawY + (fontHeightMm / 2);
            const baseY = drawY + fontHeightMm;

            doc.setDrawColor(180, 180, 180);
            doc.setLineWidth(0.3);
            doc.setLineDash([], 0);
            doc.line(marginX, topY, pageWidth - marginX, topY);

            doc.setLineDash([3, 1], 0);
            doc.line(marginX, midY, pageWidth - marginX, midY);

            doc.setDrawColor(0, 0, 0);
            doc.setLineDash([], 0);
            doc.setLineWidth(0.5);
            doc.line(marginX, baseY, pageWidth - marginX, baseY);

            doc.setTextColor(210, 210, 210); // Lighter gray
            doc.setFontSize(fontSize);

            if (name.trim()) {
                const textWidth = doc.getTextWidth(name + " ");
                const availableWidth = pageWidth - (marginX * 2);
                const repeatCount = Math.floor(availableWidth / textWidth);

                let xPos = marginX + 2;
                for (let r = 0; r < Math.max(1, repeatCount); r++) {
                    doc.text(name, xPos, baseY - 0.5);
                    xPos += textWidth;
                }
            }
            drawY += rowTotalHeight;
        }

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("© https://www.google.com/search?q=PrintableKits.com", pageWidth / 2, pageHeight - 10, { align: "center" });

        return doc;
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const doc = createDoc();
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            return () => URL.revokeObjectURL(url);
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [settings]);

    const onDownload = () => {
        const doc = createDoc();
        doc.save('worksheet.pdf');
    };


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* --- Navbar --- */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="text-xl font-bold text-blue-600 tracking-tight">PrintableKits</span>
                </div>
                <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                    <a href="#" className="hover:text-blue-600 transition-colors">Tools</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">About</a>
                </div>
            </nav>

            {/* --- Main Content --- */}
            <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">

                {/* --- Left Column: Controls --- */}
                <aside className="w-full md:w-80 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto z-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-500" />
                            Configuration
                        </h2>
                        <p className="text-sm text-gray-500">Customize your tracing sheet.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Type className="w-4 h-4" />
                                Student Name
                            </label>
                            <input
                                type="text"
                                value={settings.name}
                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="e.g. Alex"
                            />
                        </div>

                        {/* Font Size */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-gray-700">Font Size (pt)</label>
                                <span className="text-sm text-gray-500">{settings.fontSize}pt</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="100"
                                step="5"
                                value={settings.fontSize}
                                onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Paper Size */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Paper Format
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setSettings({ ...settings, paperSize: 'letter' })}
                                    className={`px-3 py-2 text-sm rounded-md border ${settings.paperSize === 'letter' ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    US Letter
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, paperSize: 'a4' })}
                                    className={`px-3 py-2 text-sm rounded-md border ${settings.paperSize === 'a4' ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    A4
                                </button>
                            </div>
                        </div>

                        {/* Orientation */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Printer className="w-4 h-4" />
                                Orientation
                            </label>
                            <select
                                value={settings.orientation}
                                onChange={(e) => setSettings({ ...settings, orientation: e.target.value as 'portrait' | 'landscape' })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <button
                            onClick={onDownload}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Download className="w-5 h-5" />
                            Download PDF
                        </button>
                    </div>
                </aside>

                {/* --- Right Column: Preview --- */}
                <section className="flex-1 bg-gray-100 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 pattern-grid-lg text-gray-200 opacity-50 pointer-events-none" />

                    {pdfUrl ? (
                        <div className="relative w-full h-full max-w-4xl shadow-2xl rounded-lg overflow-hidden border border-gray-300 bg-white">
                            <iframe
                                ref={iframeRef}
                                src={pdfUrl}
                                className="w-full h-full"
                                title="PDF Preview"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                            <p>Generating Preview...</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
