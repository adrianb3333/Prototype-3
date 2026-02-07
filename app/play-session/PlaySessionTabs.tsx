import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { ChevronDown, Target, Navigation, Wind, Brain, Database } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';
import ScoreTab from './tabs/ScoreTab';
import GPSTab from './tabs/GPSTab';
import WindTab from './tabs/WindTab';
import MindTab from './tabs/MindTab';
import DataTab from './tabs/DataTab';

type PlayTab = 'score' | 'gps' | 'wind' | 'mind' | 'data';

const tabs: { key: PlayTab; label: string; icon: React.ReactNode }[] = [
  { key: 'score', label: 'Score', icon: <Target size={20} /> },
  { key: 'gps', label: 'GPS', icon: <Navigation size={20} /> },
  { key: 'wind', label: 'Wind', icon: <Wind size={20} /> },
  { key: 'mind', label: 'Mind', icon: <Brain size={20} /> },
  { key: 'data', label: 'Data', icon: <Database size={20} /> },
];

export default function PlaySessionTabs() {
  const [activeTab, setActiveTab] = useState<PlayTab>('score');
  const { minimizeSession } = useSession();

  const renderContent = () => {
    switch (activeTab) {
      case 'score': return <ScoreTab />;
      case 'gps': return <GPSTab />;
      case 'wind': return <WindTab />;
      case 'mind': return <MindTab />;
      case 'data': return <DataTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={minimizeSession} style={styles.minimizeButton}>
          <ChevronDown size={28} color={Colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Round in Progress</Text>
        <View style={styles.headerRight}>
          <Text style={styles.holeNum}>Hole 1/18</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderContent()}
      </ScrollView>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={activeTab === tab.key ? styles.iconActive : styles.iconInactive}>
              {React.cloneElement(tab.icon as React.ReactElement<{ color: string }>, {
                color: activeTab === tab.key ? Colors.primary : Colors.tabInactive,
              })}
            </View>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  minimizeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headerRight: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  holeNum: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabActive: {},
  iconActive: {},
  iconInactive: {
    opacity: 0.6,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    color: Colors.tabInactive,
    fontWeight: '500' as const,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
});
