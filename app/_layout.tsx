import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import PlaySessionTabs from "@/app/play-session/PlaySessionTabs";
import PracticeSessionTabs from "@/app/practice-session/PracticeSessionTabs";
import ProfileContent from "@/components/ProfileContent";
import MiniSessionModal from "@/components/MiniSessionModal";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore splash screen errors
});

const queryClient = new QueryClient();

function AppContent() {
  const { sessionState, sessionType } = useSession();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Supabase auth timeout, continuing anyway');
      setLoading(false);
    }, 3000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        console.log('Supabase session loaded:', !!session);
        clearTimeout(timeout);
        setSession(session);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Supabase error:', error);
        clearTimeout(timeout);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', !!session);
      setSession(session);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, segments, loading]);

  if (loading) {
    return <View style={styles.container} />;
  }

  if (sessionState === 'active') {
    if (sessionType === 'play') {
      return <PlaySessionTabs />;
    }
    if (sessionType === 'practice') {
      return <PracticeSessionTabs />;
    }
  }

  if (sessionState === 'minimized') {
    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <ProfileContent />
        </View>
        <MiniSessionModal />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="play-setup" 
          options={{ 
            headerShown: false, 
            presentation: "fullScreenModal",
            animation: "slide_from_bottom"
          }} 
        />
        <Stack.Screen 
          name="practice-setup" 
          options={{ 
            headerShown: false, 
            presentation: "fullScreenModal",
            animation: "slide_from_bottom"
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            headerShown: false, 
            presentation: "fullScreenModal",
            animation: "slide_from_right"
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
}

function RootLayoutNav() {
  return <AppContent />;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.container}>
        <SessionProvider>
          <RootLayoutNav />
        </SessionProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    flex: 1,
    paddingTop: 50,
  },
});

