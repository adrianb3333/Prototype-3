import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

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
    padding: 20,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  countText: {
    fontSize: 18,
    color: '#666',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#b8e3cc', // Matching the light green tint
    borderRadius: 20,
    borderWidth: 6,
    borderColor: '#228b22', // Forest green border
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 150,
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rightColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  drillName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  dateText: {
    fontSize: 14,
    color: '#444',
    marginVertical: 4,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ddd',
  },
  displayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  scoreText: {
    fontSize: 52,
    fontWeight: '900',
    color: '#a00', // Deep red for the score
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  }
});

export default UiTra;