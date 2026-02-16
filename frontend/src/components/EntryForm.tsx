'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

interface EntryData {
    tasks: string;
    nextTasks: string;
    blockers: string;
    questions: string;
    notes: string;
}

interface EntryFormProps {
    initialData?: EntryData;
    onSubmit: (data: EntryData) => Promise<void>;
    isLoading?: boolean;
}

export default function EntryForm({ initialData, onSubmit, isLoading }: EntryFormProps) {
    const [tasks, setTasks] = useState(initialData?.tasks || '');
    const [nextTasks, setNextTasks] = useState(initialData?.nextTasks || '');
    const [blockers, setBlockers] = useState(initialData?.blockers || '');
    const [questions, setQuestions] = useState(initialData?.questions || '');
    const [notes, setNotes] = useState(initialData?.notes || '');

    useEffect(() => {
        if (initialData) {
            setTasks(initialData.tasks || '');
            setNextTasks(initialData.nextTasks || '');
            setBlockers(initialData.blockers || '');
            setQuestions(initialData.questions || '');
            setNotes(initialData.notes || '');
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ tasks, nextTasks, blockers, questions, notes });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tasks */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-emerald-400 mb-2">
                    <span className="text-lg">✅</span> What did I work on today?
                </label>
                <textarea
                    value={tasks}
                    onChange={(e) => setTasks(e.target.value)}
                    placeholder="- Fixed login bug&#10;- Implemented dashboard API&#10;- Code review for PR #42"
                    rows={5}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                />
            </div>

            {/* Next Tasks */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-cyan-400 mb-2">
                    <span className="text-lg">🔜</span> What am I going to work on next?
                </label>
                <textarea
                    value={nextTasks}
                    onChange={(e) => setNextTasks(e.target.value)}
                    placeholder="- Work on pagination&#10;- Refactor service layer&#10;- Start integration tests"
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-sm"
                />
            </div>

            {/* Blockers */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-red-400 mb-2">
                    <span className="text-lg">⛔</span> Any blockers?
                </label>
                <textarea
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    placeholder="- Waiting for API spec from backend team&#10;- CI pipeline broken"
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                />
            </div>

            {/* Questions */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-amber-400 mb-2">
                    <span className="text-lg">❓</span> Questions for the team
                </label>
                <textarea
                    value={questions}
                    onChange={(e) => setQuestions(e.target.value)}
                    placeholder="- Should we use REST or GraphQL for the new service?&#10;- When is the next sprint planning?"
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
                />
            </div>

            {/* Notes */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-blue-400 mb-2">
                    <span className="text-lg">📝</span> Additional notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any extra context or reminders..."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
                {isLoading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save size={20} />
                        Save Entry
                    </>
                )}
            </button>
        </form>
    );
}
