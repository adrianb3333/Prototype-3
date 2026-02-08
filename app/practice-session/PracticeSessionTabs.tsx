import React, { useState, useCallback } from 'react';
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

const tabsConfig: { key: PracticeTab; label: string; icon: React.ReactNode }[] = [
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

  const handleDrillActiveChange = useCallback((active: boolean) => {
    setIsDrillActive(active);
  }, []);

  const renderNonDrillContent = () => {
    switch (activeTab) {
      case 'my': return <MyTab />;
      case 'swing': return <SwingTab />;
      case 'flight': return <FlightTab />;
      case 'notes': return <NotesTab />;
      default: return null;
    }
  };

  const isDrillFullScreen = isDrillActive && activeTab === 'drills';

  return (
    <View style={styles.root}>
      {!isDrillFullScreen && (
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

          {activeTab !== 'drills' && (
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
              {renderNonDrillContent()}
            </ScrollView>
          )}
        </SafeAreaView>
      )}

      <View style={activeTab === 'drills' ? (isDrillFullScreen ? styles.fullScreenDrill : styles.drillInline) : styles.hidden}>
        <DrillsTab onDrillActiveChange={handleDrillActiveChange} />
      </View>

      {!isDrillFullScreen && (
        <View style={styles.tabBar}>
          {tabsConfig.map((tab) => (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fullScreenDrill: {
    flex: 1,
    backgroundColor: '#000',
  },
  drillInline: {
    flex: 1,
  },
  hidden: {
    width: 0,
    height: 0,
    overflow: 'hidden' as const,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  minimizeButton: {
    width: 44,
    height: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center' as const,
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
