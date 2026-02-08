import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

const UiTra = () => {
  const [loading, setLoading] = useState(true);
  const [drillCount, setDrillCount] = useState(0);
  const [latestDrill, setLatestDrill] = useState<any>(null);

  const fetchPracticeData = async () => {
    try {
      // 1. Get the total count of drills for the header
      const { count, error: countError } = await supabase
        .from('golf_drills')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setDrillCount(count || 0);

      // 2. Get the latest drill + the user's profile info
      const { data, error: drillError } = await supabase
        .from('golf_drills')
        .select(`
          drill_name,
          score,
          created_at,
          profiles (
            avatar_url,
            display_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (drillError && drillError.code !== 'PGRST116') throw drillError; // PGRST116 is "no rows returned"
      setLatestDrill(data);

    } catch (error) {
      console.error('Error fetching UI data:', error);
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

  // Format the timestamp (2025-10-13 style)
  const dateString = latestDrill?.created_at 
    ? new Date(latestDrill.created_at).toISOString().split('T')[0] 
    : '';

  return (
    <View style={styles.container}>
      {/* Header with Count */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Latest Practice</Text>
        <Text style={styles.countText}>({drillCount})</Text>
      </View>

      {/* Main Practice Card */}
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
    color: '#EFEFEF',
  },
  countText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#1A2E1A',
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
    color: '#EFEFEF',
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