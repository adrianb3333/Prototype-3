import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback } from 'react';
import { router } from 'expo-router';

export type SessionType = 'play' | 'practice' | null;
export type SessionState = 'idle' | 'setup' | 'active' | 'minimized';

interface SessionContextValue {
  sessionType: SessionType;
  sessionState: SessionState;
  setupStep: number;
  startSetup: (type: 'play' | 'practice') => void;
  nextSetupStep: () => void;
  prevSetupStep: () => void;
  startSession: () => void;
  minimizeSession: () => void;
  expandSession: () => void;
  finishSession: () => void;
  quitSession: () => void;
}

export const [SessionProvider, useSession] = createContextHook<SessionContextValue>(() => {
  const [sessionType, setSessionType] = useState<SessionType>(null);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [setupStep, setSetupStep] = useState(1);

  const startSetup = useCallback((type: 'play' | 'practice') => {
    console.log('Starting setup for:', type);
    setSessionType(type);
    setSessionState('setup');
    setSetupStep(1);
    if (type === 'play') {
      router.push('/play-setup/step1');
    } else {
      router.push('/practice-setup/step1');
    }
  }, []);

  const nextSetupStep = useCallback(() => {
    console.log('Next setup step');
    setSetupStep(prev => Math.min(prev + 1, 3));
  }, []);

  const prevSetupStep = useCallback(() => {
    console.log('Prev setup step');
    setSetupStep(prev => Math.max(prev - 1, 1));
  }, []);

  const startSession = useCallback(() => {
    console.log('Starting session');
    setSessionState('active');
    setSetupStep(1);
  }, []);

  const minimizeSession = useCallback(() => {
    console.log('Minimizing session');
    setSessionState('minimized');
  }, []);

  const expandSession = useCallback(() => {
    console.log('Expanding session');
    setSessionState('active');
  }, []);

  const finishSession = useCallback(() => {
    console.log('Finishing session');
    setSessionType(null);
    setSessionState('idle');
    setSetupStep(1);
    router.replace('/(tabs)/profile');
  }, []);

  const quitSession = useCallback(() => {
    console.log('Quitting session');
    setSessionType(null);
    setSessionState('idle');
    setSetupStep(1);
    router.replace('/(tabs)/profile');
  }, []);

  return {
    sessionType,
    sessionState,
    setupStep,
    startSetup,
    nextSetupStep,
    prevSetupStep,
    startSession,
    minimizeSession,
    expandSession,
    finishSession,
    quitSession,
  };
});
