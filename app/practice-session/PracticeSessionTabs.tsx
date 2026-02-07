import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { ChevronDown, User, Activity, Plane, FileText, Dumbbell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';
import MyTab from './tabs/MyTab';
import SwingTab from './tabs/SwingTab';
import FlightTab from './tabs/FlightTab';
import NotesTab from './tabs/NotesTab';
import DrillsTab from './tabs/DrillsTab';

type PracticeTab = 'my' | 'swing' | 'flight' | 'notes' | 'drills';

const tabs: { key: PracticeTab; label: string; icon: React.ReactNode }[] = [
  { key: 'my', label: 'My', icon: <User size={20} /> },
  { key: 'swing', label: 'Swing', icon: <Activity size={20} /> },
  { key: 'flight', label: 'Flight', icon: <Plane size={20} /> },
  { key: 'notes', label: 'Notes', icon: <FileText size={20} /> },
  { key: 'drills', label: 'Drills', icon: <Dumbbell size={20} /> },
];

export default function PracticeSessionTabs() {
  const [activeTab, setActiveTab] = useState<PracticeTab>('my');
  const [isDrillActive, setIsDrillActive] = useState(false);
  const { minimizeSession } = useSession();

  const renderContent = () => {
    switch (activeTab) {
      case 'my': return <MyTab />;
      case 'swing': return <SwingTab />;
      case 'flight': return <FlightTab />;
      case 'notes': return <NotesTab />;
      case 'drills': return <DrillsTab onDrillActiveChange={setIsDrillActive} />;
    }
  };

  if (isDrillActive) {
    return (
      <View style={styles.fullScreenContainer}>
        {renderContent()}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={minimizeSession} style={styles.minimizeButton}>
          <ChevronDown size={28} color={Colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Session</Text>
        <View style={styles.headerRight}>
          <Text style={styles.duration}>45:12</Text>
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
                color: activeTab === tab.key ? Colors.accent : Colors.tabInactive,
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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  duration: {
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
    color: Colors.accent,
    fontWeight: '600' as const,
  },
});
