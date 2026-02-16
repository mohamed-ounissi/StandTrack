'use client';

import { useState, useEffect, useCallback } from 'react';
import { entriesAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format } from 'date-fns';
import { Copy, Check, Loader2, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface Entry {
    _id: string;
    date: string;
    tasks: string;
    nextTasks: string;
    blockers: string;
    questions: string;
    notes: string;
}

export default function SummaryPage() {
    const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const fetchEntry = useCallback(async () => {
        setLoading(true);
        try {
            const response = await entriesAPI.getByDate(selectedDate);
            setTodayEntry(response.data);
        } catch {
            setTodayEntry(null);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchEntry();
    }, [fetchEntry]);

    const generateSummary = () => {
        if (!todayEntry) return '';

        const lines: string[] = [];
        const dateLabel = format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d');

        lines.push(`📅 Standup Update — ${dateLabel}`);
        lines.push('');

        if (todayEntry.tasks) {
            lines.push('✅ What I worked on:');
            todayEntry.tasks.split('\n').forEach((line) => {
                const trimmed = line.trim();
                if (trimmed) {
                    lines.push(trimmed.startsWith('-') ? trimmed : `- ${trimmed}`);
                }
            });
            lines.push('');
        }

        if (todayEntry.nextTasks) {
            lines.push('🔜 What I\'m working on next:');
            todayEntry.nextTasks.split('\n').forEach((line) => {
                const trimmed = line.trim();
                if (trimmed) {
                    lines.push(trimmed.startsWith('-') ? trimmed : `- ${trimmed}`);
                }
            });
            lines.push('');
        }

        if (todayEntry.blockers) {
            lines.push('⛔ Blockers:');
            todayEntry.blockers.split('\n').forEach((line) => {
                const trimmed = line.trim();
                if (trimmed) {
                    lines.push(trimmed.startsWith('-') ? trimmed : `- ${trimmed}`);
                }
            });
            lines.push('');
        }

        if (todayEntry.questions) {
            lines.push('❓ Questions:');
            todayEntry.questions.split('\n').forEach((line) => {
                const trimmed = line.trim();
                if (trimmed) {
                    lines.push(trimmed.startsWith('-') ? trimmed : `- ${trimmed}`);
                }
            });
            lines.push('');
        }

        if (todayEntry.notes) {
            lines.push('📝 Notes:');
            lines.push(todayEntry.notes);
            lines.push('');
        }

        return lines.join('\n').trim();
    };

    const handleCopy = async () => {
        const summary = generateSummary();
        if (!summary) return;

        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            toast.success('Summary copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    const summary = generateSummary();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-950">
                <Navbar />

                <main className="max-w-3xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-1">Standup Summary</h1>
                        <p className="text-slate-400">Your formatted update, ready to present or copy-paste</p>
                    </div>

                    {/* Date picker */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                            <Calendar size={16} />
                            Select date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-emerald-500" />
                        </div>
                    ) : !todayEntry ? (
                        <div className="text-center py-20">
                            <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                            <h3 className="text-lg font-medium text-slate-400 mb-2">No entry for this date</h3>
                            <p className="text-slate-500">
                                Go to the dashboard and create an entry first.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-800">
                                <h2 className="text-lg font-semibold text-white">
                                    Generated Summary
                                </h2>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${copied
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                        }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check size={16} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            Copy to Clipboard
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Summary content */}
                            <div className="p-6">
                                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                    {summary}
                                </pre>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
