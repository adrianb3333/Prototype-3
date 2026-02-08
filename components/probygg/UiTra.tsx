import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase'; // Ensure this path is correct for your project

const UiTra = () => {
  const [loading, setLoading] = useState(true);
  const [drillCount, setDrillCount] = useState(0);
  const [latestDrill, setLatestDrill] = useState<any>(null);

  const fetchPracticeData = async () => {
    try {
      setLoading(true);

      // 1. Get the total count of all drills
      const { count, error: countError } = await supabase
        .from('golf_drills')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setDrillCount(count || 0);

      // 2. Fetch the latest drill (NO JOIN)
      const { data: drillData, error: drillError } = await supabase
        .from('golf_drills')
        .select('drill_name, score, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (drillError) {
        if (drillError.code === 'PGRST116') {
          setLatestDrill(null);
          return;
        }
        throw drillError;
      }

      // 3. Fetch the profile separately using the user_id from the drill
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', drillData.user_id)
        .single();

      // Combine them into one state object
      setLatestDrill({
        ...drillData,
        profiles: profileData // Structured to match your UI's expectation
      });

    } catch (error: any) {
      console.error('Error details:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeData();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} color="#2e7d32" />;

  const dateString = latestDrill?.created_at 
    ? new Date(latestDrill.created_at).toISOString().split('T')[0] 
    : '';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Latest Practice</Text>
        <Text style={styles.countText}>({drillCount})</Text>
      </View>

      {latestDrill ? (
        <View style={styles.card}>
          <View style={styles.leftColumn}>
            <Text style={styles.drillName}>{latestDrill.drill_name}</Text>
            <Text style={styles.dateText}>{dateString}</Text>
            
            <View style={styles.profileBox}>
              <Image 
                source={{ uri: latestDrill.profiles?.avatar_url || 'https://via.placeholder.com/100' }} 
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
        <View style={styles.emptyCard}>
          <Text style={{ color: '#888' }}>No practice sessions yet.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#000' }, // Dark theme container
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  countText: { fontSize: 18, color: '#666', marginLeft: 8 },
  card: {
    backgroundColor: '#1a1a1a', 
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#2e7d32', // Subtle green border for the dark theme
    justifyContent: 'space-between',
  },
  leftColumn: { flex: 1 },
  rightColumn: { justifyContent: 'center', alignItems: 'flex-end' },
  drillName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  dateText: { fontSize: 14, color: '#aaa', marginVertical: 4 },
  profileBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, backgroundColor: '#333' },
  displayName: { fontSize: 14, color: '#eee' },
  scoreText: { fontSize: 42, fontWeight: '900', color: '#ff4444' },
  emptyCard: { padding: 40, alignItems: 'center' }
});

export default UiTra;