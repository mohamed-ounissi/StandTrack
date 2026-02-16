'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { entriesAPI, settingsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import EntryForm from '@/components/EntryForm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Calendar, Clock, Loader2, Pencil, X, Check } from 'lucide-react';

interface Entry {
  _id: string;
  date: string;
  tasks: string;
  nextTasks: string;
  blockers: string;
  questions: string;
  notes: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meetingTime, setMeetingTime] = useState('15:30');
  const [isOverride, setIsOverride] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(false);
  const [tempMeetingTime, setTempMeetingTime] = useState('15:30');

  const today = format(new Date(), 'yyyy-MM-dd');
  const displayDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const fetchTodayEntry = useCallback(async () => {
    try {
      const response = await entriesAPI.getByDate(today);
      setTodayEntry(response.data);
    } catch {
      setTodayEntry(null);
    } finally {
      setLoading(false);
    }
  }, [today]);

  const fetchMeetingTime = useCallback(async () => {
    try {
      const response = await settingsAPI.getMeetingTimeForDate(today);
      setMeetingTime(response.data.meetingTime);
      setIsOverride(response.data.isOverride);
      setTempMeetingTime(response.data.meetingTime);
    } catch {
    }
  }, [today]);

  useEffect(() => {
    fetchTodayEntry();
    fetchMeetingTime();
  }, [fetchTodayEntry, fetchMeetingTime]);

  const handleSubmit = async (data: { tasks: string; nextTasks: string; blockers: string; questions: string; notes: string }) => {
    setSaving(true);
    try {
      if (todayEntry) {
        const response = await entriesAPI.update(todayEntry._id, data);
        setTodayEntry(response.data);
        toast.success('Entry updated!');
      } else {
        const response = await entriesAPI.create({ date: today, ...data });
        setTodayEntry(response.data);
        toast.success('Entry saved!');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleMeetingTimeOverride = async () => {
    try {
      await settingsAPI.setMeetingOverride(today, tempMeetingTime);
      setMeetingTime(tempMeetingTime);
      setIsOverride(true);
      setEditingMeeting(false);
      toast.success('Meeting time updated for today!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update meeting time');
    }
  };

  const handleRemoveOverride = async () => {
    try {
      await settingsAPI.deleteMeetingOverride(today);
      await fetchMeetingTime();
      setEditingMeeting(false);
      toast.success('Override removed, back to default time');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove override');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">
              Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{displayDate}</span>
              </div>
            </div>
          </div>

          {/* Meeting Time Card */}
          <div className="mb-6 p-4 rounded-lg border bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Today&apos;s meeting</p>
                  <p className="text-lg font-semibold text-white">{formatTime(meetingTime)}</p>
                </div>
                {isOverride && (
                  <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                    Override
                  </span>
                )}
              </div>

              {editingMeeting ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={tempMeetingTime}
                    onChange={(e) => setTempMeetingTime(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleMeetingTimeOverride}
                    className="p-2 text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Save"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => { setEditingMeeting(false); setTempMeetingTime(meetingTime); }}
                    className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                  {isOverride && (
                    <button
                      onClick={handleRemoveOverride}
                      className="text-xs text-red-400 hover:text-red-300 ml-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setEditingMeeting(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Pencil size={14} />
                  Change for today
                </button>
              )}
            </div>
          </div>

          {/* Status indicator */}
          <div className={`mb-6 p-4 rounded-lg border ${todayEntry
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-amber-500/5 border-amber-500/20'
            }`}>
            <p className={`text-sm font-medium ${todayEntry ? 'text-emerald-400' : 'text-amber-400'
              }`}>
              {todayEntry
                ? `✅ You've logged today's entry. You can still update it before ${formatTime(meetingTime)}.`
                : `📝 You haven't logged today's entry yet. Fill it in before ${formatTime(meetingTime)}!`
              }
            </p>
          </div>

          {/* Entry Form */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-semibold text-white mb-6">
                {todayEntry ? 'Update Today\'s Entry' : 'Create Today\'s Entry'}
              </h2>
              <EntryForm
                initialData={todayEntry || undefined}
                onSubmit={handleSubmit}
                isLoading={saving}
              />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
