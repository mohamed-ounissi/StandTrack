'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight, CheckCircle2, Clock, Shield, Zap } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-32">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">ST</span>
            </div>
            <h1 className="text-4xl font-bold text-white">StandTrack</h1>
          </div>

          <p className="text-xl text-slate-400 mb-4 max-w-2xl mx-auto">
            Track your work. Deliver better standups.
          </p>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto">
            A lightweight tool to help developers prepare structured daily standup updates
            in under 2 minutes. No more scrambling at 3:30 PM.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 py-3 rounded-lg transition-colors text-lg"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-8 py-3 rounded-lg transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">Structured Entries</h3>
            <p className="text-slate-400 text-sm">
              Log tasks, blockers, and questions in a clean, organized format.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-amber-400" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">Quick Summary</h3>
            <p className="text-slate-400 text-sm">
              Generate a formatted standup summary ready to present in one click.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="text-blue-400" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">History View</h3>
            <p className="text-slate-400 text-sm">
              Browse past entries by date. Never lose track of what you did.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="text-purple-400" size={24} />
            </div>
            <h3 className="text-white font-semibold mb-2">Private & Secure</h3>
            <p className="text-slate-400 text-sm">
              Your data is yours. JWT-authenticated and only you see your entries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
