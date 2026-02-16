'use client';

import { useState, useEffect, useCallback } from 'react';
import { entriesAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format, parseISO } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Loader2, Trash2, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Entry {
  _id: string;
  date: string;
  tasks: string;
  nextTasks: string;
  blockers: string;
  questions: string;
  notes: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const fetchEntries = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await entriesAPI.getAll({ page, limit: 10 });
      setEntries(response.data.entries);
      setPagination(response.data.pagination);
    } catch {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await entriesAPI.delete(id);
      toast.success('Entry deleted');
      setSelectedEntry(null);
      fetchEntries(pagination.page);
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  const formatEntryDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const getPreview = (text: string) => {
    if (!text) return 'No content';
    const firstLine = text.split('\n')[0];
    return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Entry History</h1>
            <p className="text-slate-400">Browse all your past standup entries</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">No entries yet</h3>
              <p className="text-slate-500">Start by creating your first daily entry on the dashboard.</p>
            </div>
          ) : (
            <>
              {/* Entries list */}
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry._id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={16} className="text-emerald-400" />
                          <h3 className="text-white font-medium">
                            {formatEntryDate(entry.date)}
                          </h3>
                        </div>
                        <p className="text-slate-400 text-sm">{getPreview(entry.tasks)}</p>
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          {entry.nextTasks && (
                            <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                              Has next tasks
                            </span>
                          )}
                          {entry.blockers && (
                            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                              Has blockers
                            </span>
                          )}
                          {entry.questions && (
                            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                              Has questions
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="View entry"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => fetchEntries(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-colors text-sm"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <span className="text-slate-400 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => fetchEntries(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-colors text-sm"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Entry Detail Modal */}
          {selectedEntry && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-xl">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {formatEntryDate(selectedEntry.date)}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {selectedEntry.tasks && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-medium text-emerald-400 mb-2">
                        <span>✅</span> What I worked on
                      </h3>
                      <div className="bg-slate-800 rounded-lg p-4 text-slate-300 text-sm whitespace-pre-wrap">
                        {selectedEntry.tasks}
                      </div>
                    </div>
                  )}

                  {selectedEntry.nextTasks && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-medium text-cyan-400 mb-2">
                        <span>🔜</span> What I&apos;m working on next
                      </h3>
                      <div className="bg-slate-800 rounded-lg p-4 text-slate-300 text-sm whitespace-pre-wrap">
                        {selectedEntry.nextTasks}
                      </div>
                    </div>
                  )}

                  {selectedEntry.blockers && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-medium text-red-400 mb-2">
                        <span>⛔</span> Blockers
                      </h3>
                      <div className="bg-slate-800 rounded-lg p-4 text-slate-300 text-sm whitespace-pre-wrap">
                        {selectedEntry.blockers}
                      </div>
                    </div>
                  )}

                  {selectedEntry.questions && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-medium text-amber-400 mb-2">
                        <span>❓</span> Questions
                      </h3>
                      <div className="bg-slate-800 rounded-lg p-4 text-slate-300 text-sm whitespace-pre-wrap">
                        {selectedEntry.questions}
                      </div>
                    </div>
                  )}

                  {selectedEntry.notes && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-medium text-blue-400 mb-2">
                        <span>📝</span> Notes
                      </h3>
                      <div className="bg-slate-800 rounded-lg p-4 text-slate-300 text-sm whitespace-pre-wrap">
                        {selectedEntry.notes}
                      </div>
                    </div>
                  )}

                  {!selectedEntry.tasks && !selectedEntry.nextTasks && !selectedEntry.blockers && !selectedEntry.questions && !selectedEntry.notes && (
                    <p className="text-slate-500 text-center py-8">This entry is empty.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
