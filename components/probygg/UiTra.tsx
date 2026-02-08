import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

interface ProfileData {
  avatar_url: string | null;
  display_name: string | null;
}

interface DrillData {
  drill_name: string;
  score: number | null;
  created_at: string;
  profiles: ProfileData | null;
}

const UiTra = () => {
  const [loading, setLoading] = useState(true);
  const [drillCount, setDrillCount] = useState<number>(0);
  const [latestDrill, setLatestDrill] = useState<DrillData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPracticeData = async () => {
    try {
      setErrorMsg(null);

      const { count, error: countError } = await supabase
        .from('golf_drills')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Count query failed:', countError.message, countError.details, countError.hint);
        throw countError;
      }
      setDrillCount(count || 0);

      if ((count ?? 0) === 0) {
        console.log('No drills found, skipping latest drill fetch.');
        setLatestDrill(null);
        return;
      }

      const { data, error: drillError } = await supabase
        .from('golf_drills')
        .select(`
          drill_name,
          score,
          created_at,
          profiles!golf_drills_user_id_fkey (
            avatar_url,
            display_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (drillError) {
        if (drillError.code === 'PGRST116') {
          console.log('No rows returned for latest drill (PGRST116).');
          setLatestDrill(null);
          return;
        }
        console.error('Drill query failed:', drillError.message, drillError.details, drillError.hint);
        throw drillError;
      }

      const formatted: DrillData = {
        drill_name: data?.drill_name ?? '',
        score: data?.score ?? null,
        created_at: data?.created_at ?? '',
        profiles: Array.isArray(data?.profiles) ? data.profiles[0] ?? null : data?.profiles ?? null,
      };
      setLatestDrill(formatted);

    } catch (error: unknown) {
      const err = error as { message?: string; details?: string };
      const msg = err?.message ?? 'Unknown error';
      console.error('fetchPracticeData error message:', msg);
      console.error('fetchPracticeData error details:', err?.details ?? 'none');
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeData();

    // Listen for new drills being added to update the UI instantly
    const subscription = supabase
      .channel('drill-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'golf_drills' }, () => {
        fetchPracticeData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  const formatDate = (raw: string): string => {
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return d.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return raw;
    }
  };

  const dateString = latestDrill?.created_at ? formatDate(latestDrill.created_at) : '';

  return (
    <View style={styles.container}>
      {/* Header with Count */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Latest Practice</Text>
        <Text style={styles.countText}>({drillCount})</Text>
      </View>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {latestDrill ? (
        <View style={styles.card}>
          <View style={styles.leftColumn}>
            <Text style={styles.drillName}>{latestDrill.drill_name}</Text>
            <Text style={styles.dateText}>{dateString}</Text>
            
            <View style={styles.profileBox}>
              <Image 
                source={{ uri: latestDrill.profiles?.avatar_url || 'https://via.placeholder.com/150' }} 
                style={styles.avatar} 
              />
              <Text style={styles.displayName}>{latestDrill.profiles?.display_name || 'Player'}</Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <Text style={styles.scoreText}>{latestDrill.score}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>No drills recorded yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 0,
  },
  errorBox: {
    backgroundColor: '#3A1A1A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
  },
  center: {
    paddingVertical: 30,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  countText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1DB954',
    padding: 16,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    minHeight: 120,
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'space-between' as const,
  },
  rightColumn: {
    justifyContent: 'center' as const,
    alignItems: 'flex-end' as const,
  },
  drillName: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 13,
    color: '#888',
    marginVertical: 4,
  },
  profileBox: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#2A2A2A',
  },
  displayName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#B0B0B0',
  },
  scoreText: {
    fontSize: 44,
    fontWeight: '900' as const,
    color: '#1DB954',
  },
  emptyText: {
    textAlign: 'center' as const,
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
});

export default UiTra;