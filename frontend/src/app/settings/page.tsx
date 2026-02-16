'use client';

import { useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import {
    Clock, Bell, Mail, Loader2, Save, Plus, Trash2, Info
} from 'lucide-react';

interface MeetingOverride {
    _id: string;
    date: string;
    meetingTime: string;
}

export default function SettingsPage() {
    const { user } = useAuth();


    const [defaultMeetingTime, setDefaultMeetingTime] = useState('15:30');
    const [savingMeeting, setSavingMeeting] = useState(false);


    const [overrides, setOverrides] = useState<MeetingOverride[]>([]);
    const [newOverrideDate, setNewOverrideDate] = useState('');
    const [newOverrideTime, setNewOverrideTime] = useState('15:30');
    const [addingOverride, setAddingOverride] = useState(false);


    const [remindersEnabled, setRemindersEnabled] = useState(false);
    const [reminderEmail, setReminderEmail] = useState('');
    const [reminderTimes, setReminderTimes] = useState<string[]>([]);
    const [newReminderTime, setNewReminderTime] = useState('');
    const [savingReminders, setSavingReminders] = useState(false);

    const [loading, setLoading] = useState(true);


    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour12 = parseInt(hours) % 12 || 12;
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    };

    const fetchSettings = useCallback(async () => {
        try {
            const [settingsRes, overridesRes] = await Promise.all([
                settingsAPI.getSettings(),
                settingsAPI.getMeetingOverrides()
            ]);

            setDefaultMeetingTime(settingsRes.data.defaultMeetingTime);
            setOverrides(overridesRes.data);

            const rs = settingsRes.data.reminderSettings;
            setRemindersEnabled(rs?.enabled || false);
            setReminderEmail(rs?.email || '');
            setReminderTimes(rs?.times || []);
        } catch {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);


    const handleSaveMeetingTime = async () => {
        setSavingMeeting(true);
        try {
            await settingsAPI.updateMeetingTime(defaultMeetingTime);
            toast.success('Default meeting time saved!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSavingMeeting(false);
        }
    };

    const handleAddOverride = async () => {
        if (!newOverrideDate || !newOverrideTime) {
            toast.error('Please select both a date and time');
            return;
        }
        setAddingOverride(true);
        try {
            await settingsAPI.setMeetingOverride(newOverrideDate, newOverrideTime);
            toast.success('Meeting override added!');
            setNewOverrideDate('');
            setNewOverrideTime('15:30');
            const res = await settingsAPI.getMeetingOverrides();
            setOverrides(res.data);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to add override');
        } finally {
            setAddingOverride(false);
        }
    };

    const handleDeleteOverride = async (date: string) => {
        try {
            await settingsAPI.deleteMeetingOverride(date);
            toast.success('Override removed');
            setOverrides(overrides.filter(o => o.date !== date));
        } catch {
            toast.error('Failed to remove override');
        }
    };


    const handleAddReminderTime = () => {
        if (!newReminderTime) {
            toast.error('Please select a time');
            return;
        }
        if (reminderTimes.length >= 3) {
            toast.error('Maximum 3 reminder times allowed');
            return;
        }
        if (reminderTimes.includes(newReminderTime)) {
            toast.error('This time is already added');
            return;
        }
        setReminderTimes([...reminderTimes, newReminderTime].sort());
        setNewReminderTime('');
    };

    const handleRemoveReminderTime = (time: string) => {
        setReminderTimes(reminderTimes.filter(t => t !== time));
    };

    const handleSaveReminders = async () => {
        setSavingReminders(true);
        try {
            await settingsAPI.updateReminders({
                enabled: remindersEnabled,
                email: reminderEmail,
                times: reminderTimes
            });
            toast.success('Reminder settings saved!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to save reminders');
        } finally {
            setSavingReminders(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-slate-950">
                    <Navbar />
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-emerald-500" />
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-950">
                <Navbar />

                <main className="max-w-3xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
                        <p className="text-slate-400">Configure your meeting time and email reminders</p>
                    </div>

                    {/* ====== SECTION 1: Default Meeting Time ====== */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                <Clock className="text-purple-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Default Meeting Time</h2>
                                <p className="text-sm text-slate-400">Your regular daily standup time</p>
                            </div>
                        </div>

                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Meeting time (24h format)
                                </label>
                                <input
                                    type="time"
                                    value={defaultMeetingTime}
                                    onChange={(e) => setDefaultMeetingTime(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Currently: <span className="text-purple-400">{formatTime(defaultMeetingTime)}</span>
                                </p>
                            </div>
                            <button
                                onClick={handleSaveMeetingTime}
                                disabled={savingMeeting}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm"
                            >
                                {savingMeeting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save
                            </button>
                        </div>
                    </div>

                    {/* ====== SECTION 2: Meeting Time Overrides ====== */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                <Clock className="text-amber-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Meeting Time Overrides</h2>
                                <p className="text-sm text-slate-400">Change meeting time for specific days</p>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4 flex items-start gap-2">
                            <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-400">
                                Use this if your meeting is at a different time on a specific day.
                                The override only applies to that one date. Your default time ({formatTime(defaultMeetingTime)}) is used for all other days.
                            </p>
                        </div>

                        {/* Add new override */}
                        <div className="flex items-end gap-3 mb-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={newOverrideDate}
                                    onChange={(e) => setNewOverrideDate(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Time</label>
                                <input
                                    type="time"
                                    value={newOverrideTime}
                                    onChange={(e) => setNewOverrideTime(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                />
                            </div>
                            <button
                                onClick={handleAddOverride}
                                disabled={addingOverride}
                                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                            >
                                {addingOverride ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Add
                            </button>
                        </div>

                        {/* List existing overrides */}
                        {overrides.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No overrides set</p>
                        ) : (
                            <div className="space-y-2">
                                {overrides.map((override) => (
                                    <div
                                        key={override._id}
                                        className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-white text-sm font-medium">
                                                {format(parseISO(override.date), 'EEE, MMM d, yyyy')}
                                            </span>
                                            <span className="text-amber-400 text-sm">
                                                {formatTime(override.meetingTime)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteOverride(override.date)}
                                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ====== SECTION 3: Email Reminders ====== */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                <Bell className="text-emerald-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Email Reminders</h2>
                                <p className="text-sm text-slate-400">Get reminded to log your standup entry</p>
                            </div>
                        </div>

                        {/* Enable/disable toggle */}
                        <div className="flex items-center justify-between mb-6 p-4 bg-slate-800/50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-white">Enable reminders</p>
                                <p className="text-xs text-slate-400">Receive email reminders to fill in your daily entry</p>
                            </div>
                            <button
                                onClick={() => setRemindersEnabled(!remindersEnabled)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${remindersEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                                    }`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${remindersEnabled ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>

                        {remindersEnabled && (
                            <div className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                                        <Mail size={16} />
                                        Reminder email
                                    </label>
                                    <input
                                        type="email"
                                        value={reminderEmail}
                                        onChange={(e) => setReminderEmail(e.target.value)}
                                        placeholder={user?.email || 'your@email.com'}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Leave empty to use your account email ({user?.email})
                                    </p>
                                </div>

                                {/* Reminder times */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                                        <Clock size={16} />
                                        Reminder times (max 3)
                                    </label>

                                    {/* Current times */}
                                    {reminderTimes.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {reminderTimes.map((time) => (
                                                <div
                                                    key={time}
                                                    className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5"
                                                >
                                                    <span className="text-sm text-emerald-400">{formatTime(time)}</span>
                                                    <button
                                                        onClick={() => handleRemoveReminderTime(time)}
                                                        className="text-emerald-400 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add new time */}
                                    {reminderTimes.length < 3 && (
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="time"
                                                value={newReminderTime}
                                                onChange={(e) => setNewReminderTime(e.target.value)}
                                                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                            />
                                            <button
                                                onClick={handleAddReminderTime}
                                                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                                            >
                                                <Plus size={16} />
                                                Add time
                                            </button>
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-500 mt-2">
                                        You&apos;ll receive a reminder at each of these times if you haven&apos;t logged your entry yet.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Save button */}
                        <button
                            onClick={handleSaveReminders}
                            disabled={savingReminders}
                            className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            {savingReminders ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Reminder Settings
                                </>
                            )}
                        </button>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}

