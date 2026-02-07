import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from '@/constants/colors';
import StatCard from "@/components/reusables/StatCard";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.45;
const CARD_MARGIN = 12;

const categories = [
  { 
    header: "Putting", 
    cards: ["The Gate", "The Clock", "27 Challenge", "The Ladder"] 
  },
  { 
    header: "Wedges", 
    cards: ["Bunker", "Cirkel", "5-30m", "Area Towel"] 
  },
  { 
    header: "Irons", 
    cards: ["9 box", "Mr Routine", "Distance control", "Pause"] 
  },
  { 
    header: "Woods", 
    cards: ["Power Line", "Fade", "Accuracy", "Draw"] 
  },
];

interface DrillsTabProps {
  onDrillActiveChange?: (active: boolean) => void;
}

export default function DrillsTab({ onDrillActiveChange }: DrillsTabProps) {
  const [selectedDrill, setSelectedDrill] = useState<{ category: string, card: string } | null>(null);

  // List of cards that should trigger a dedicated full-screen component
  const dedicatedComponents = [
    "The Clock", 
    "The Gate", 
    "The Ladder", 
    "27 Challenge", 
    "Bunker", 
    "Cirkel", 
    "5-30m", 
    "Area Towel",
    "9 box",           
    "Mr Routine",      
    "Distance control",
    "Pause",
    "Power Line",
    "Fade",
    "Accuracy",
    "Draw"
  ];

  const handleCardPress = (category: string, card: string) => {
    setSelectedDrill({ category, card });
    onDrillActiveChange?.(true);
  };

  const handleBack = () => {
    setSelectedDrill(null);
    onDrillActiveChange?.(false);
  };

  const renderDrillComponent = () => {
    if (!selectedDrill) return null;

    const drillMap: Record<string, () => JSX.Element> = {
      "The Clock": () => {
        const Clock = require("@/components/ovningar/Clock").default;
        return <Clock onBack={handleBack} drillName="The Clock" />;
      },
      "The Gate": () => {
        const Gate = require("@/components/ovningar/Gate").default;
        return <Gate onBack={handleBack} drillName="The Gate" />;
      },
      "The Ladder": () => {
        const Ladder = require("@/components/ovningar/Ladder").default;
        return <Ladder onBack={handleBack} drillName="The Ladder" />;
      },
      "27 Challenge": () => {
        const Challenge27 = require("@/components/ovningar/Challange27").default;
        return <Challenge27 onBack={handleBack} />;
      },
      "Bunker": () => {
        const Bunker = require("@/components/ovningar/Bunker").default;
        return <Bunker onBack={handleBack} drillName="Bunker Pro" />;
      },
      "Cirkel": () => {
        const Cirkel = require("@/components/ovningar/Cirkel").default;
        return <Cirkel onBack={handleBack} drillName="The Cirkel" />;
      },
      "5-30m": () => {
        const W5_30m = require("@/components/ovningar/W5-30m").default;
        return <W5_30m onBack={handleBack} drillName="Wedge 5-30m" />;
      },
      "Area Towel": () => {
        const AreaTowel = require("@/components/ovningar/AreaTowel").default;
        return <AreaTowel onBack={handleBack} drillName="Area Towel Drill" />;
      },
      "9 box": () => {
        const Box9 = require("@/components/ovningar/Box9").default;
        return <Box9 onBack={handleBack} drillName="9 Box" />;
      },
      "Mr Routine": () => {
        const MrRoutine = require("@/components/ovningar/MrRoutine").default;
        return <MrRoutine onBack={handleBack} drillName="My Routine" />;
      },
      "Distance control": () => {
        const DistanceControl = require("@/components/ovningar/DistanceControl").default;
        return <DistanceControl onBack={handleBack} drillName="Distance Control" />;
      },
      "Pause": () => {
        const Pause = require("@/components/ovningar/Pause").default;
        return <Pause onBack={handleBack} drillName="Pause Drill" />;
      },
      "Power Line": () => {
        const PowerLine = require("@/components/ovningar/PowerLine").default;
        return <PowerLine onBack={handleBack} drillName="Power Line" />;
      },
      "Fade": () => {
        const Fade = require("@/components/ovningar/Fade").default;
        return <Fade onBack={handleBack} drillName="The Fade" />;
      },
      "Accuracy": () => {
        const Accuracy = require("@/components/ovningar/Accuracy").default;
        return <Accuracy onBack={handleBack} drillName="Accuracy" />;
      },
      "Draw": () => {
        const Draw = require("@/components/ovningar/Draw").default;
        return <Draw onBack={handleBack} drillName="The Draw" />;
      },
    };

    const renderer = drillMap[selectedDrill.card];
    return renderer ? renderer() : null;
  };

  // Improved Boolean check
  const isDedicated = !!selectedDrill && dedicatedComponents.includes(selectedDrill.card);

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* 1. Main Drill List - Only shows when nothing is selected */}
        {!selectedDrill && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Drills 🏋️</Text>
            <Text style={styles.subtitle}>Improve Your Game</Text>
            
            {categories.map((category) => (
              <View key={category.header} style={styles.categoryContainer}>
                <Text style={styles.categoryHeader}>{category.header}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                  {category.cards.map((card, index) => (
                    <View key={card} style={{ width: CARD_WIDTH, marginRight: index === category.cards.length - 1 ? 0 : CARD_MARGIN }}>
                      <TouchableOpacity activeOpacity={0.7} onPress={() => handleCardPress(category.header, card)}>
                        <View style={styles.glassPlaceholder}>
                          <Text style={styles.cardTitle}>{card}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        )}

        {/* 2. Fallback Detail View - Only shows if selected but NOT dedicated */}
        {selectedDrill && !isDedicated && (
          <View style={styles.detailContainer}>
            <View style={styles.statCardWrapper}>
              <StatCard label="Drill Name" value={selectedDrill.card} />
            </View>
            <ScrollView contentContainerStyle={styles.overlayContent} showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={handleBack} style={styles.backButtonInline}>
                <Text style={styles.backText}>← Back to drills</Text>
              </TouchableOpacity>
              <Text style={styles.detailCategory}>{selectedDrill.category}</Text>
            </ScrollView>
          </View>
        )}
      </SafeAreaView>

      {selectedDrill && isDedicated && (
        <View style={styles.drillWrapper}>
          {renderDrillComponent()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FDFCF8" },
  container: { flex: 1 },
  scrollContent: { paddingVertical: 20 },
  title: { fontSize: 32, fontWeight: "700", color: "#1a1a1a", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8, textAlign: "center", marginBottom: 20 },
  categoryContainer: { marginBottom: 24 },
  categoryHeader: { fontSize: 22, fontWeight: "600", color: "#2d5a27", marginBottom: 12, paddingLeft: 16 },
  cardTitle: { color: "#1a1a1a", fontSize: 16, fontWeight: "600", textAlign: "center" },
  glassPlaceholder: { 
    height: 140, 
    justifyContent: "center", 
    padding: 20, 
    backgroundColor: 'rgba(0,0,0,0.04)', 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.08)',
    borderLeftWidth: 5, 
    borderLeftColor: '#E63946', 
  },
  backText: { color: "#2d5a27", fontSize: 14, fontWeight: "600" },
  drillWrapper: { 
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    backgroundColor: '#000' 
  },
  detailContainer: { flex: 1 },
  statCardWrapper: { position: "absolute", top: -height * 0.25, left: -width * 0.1, width: width * 1.2, height: height * 1.5, zIndex: 0 },
  overlayContent: { paddingHorizontal: 16, paddingTop: 20, alignItems: "center", zIndex: 1 },
  backButtonInline: { alignSelf: "flex-start", marginBottom: 20 },
  detailCategory: { color: "#666", fontSize: 18, marginTop: 60, textAlign: "center" },
});