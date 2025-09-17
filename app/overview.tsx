
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useWorkTimeData } from '../hooks/useWorkTimeData';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { generatePDF } from '../utils/pdfGenerator';

export default function OverviewScreen() {
  const {
    userSettings,
    getYearlyData,
    getAvailableYears,
    getMonthlyData,
  } = useWorkTimeData();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const availableYears = getAvailableYears();
  const currentYear = availableYears.length > 0 ? availableYears[0] : selectedYear;
  const yearlyData = getYearlyData(currentYear);

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const handleGenerateYearlyPDF = async () => {
    try {
      console.log('Generating yearly PDF for:', currentYear);
      const allEntries = yearlyData.months.flatMap(month => month.entries);
      await generatePDF(
        allEntries,
        userSettings.userName,
        `Jahresübersicht ${currentYear}`
      );
    } catch (error) {
      console.error('Error generating yearly PDF:', error);
      Alert.alert('Fehler', 'PDF konnte nicht erstellt werden.');
    }
  };

  const handleGenerateMonthlyPDF = async (monthIndex: number) => {
    try {
      const monthData = getMonthlyData(currentYear, (monthIndex + 1).toString());
      if (monthData.entries.length === 0) {
        Alert.alert('Keine Daten', 'Für diesen Monat sind keine Einträge vorhanden.');
        return;
      }
      
      console.log('Generating monthly PDF for:', monthNames[monthIndex], currentYear);
      await generatePDF(
        monthData,
        userSettings.userName,
        `${monthNames[monthIndex]} ${currentYear}`
      );
    } catch (error) {
      console.error('Error generating monthly PDF:', error);
      Alert.alert('Fehler', 'PDF konnte nicht erstellt werden.');
    }
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}h`;
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </Link>
          <Text style={commonStyles.title}>Jahresübersicht</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.yearSelector}>
          <Text style={styles.yearTitle}>Jahr: {currentYear}</Text>
          <View style={styles.yearStats}>
            <Text style={styles.totalHours}>
              Gesamt: {formatHours(yearlyData.totalHours)}
            </Text>
            <Button
              text="Jahr als PDF"
              onPress={handleGenerateYearlyPDF}
              style={styles.pdfButton}
              textStyle={styles.pdfButtonText}
            />
          </View>
        </View>

        <View style={styles.monthsContainer}>
          {monthNames.map((monthName, index) => {
            const monthData = yearlyData.months[index];
            const hasEntries = monthData.entries.length > 0;
            
            return (
              <View key={index} style={[styles.monthCard, !hasEntries && styles.monthCardEmpty]}>
                <View style={styles.monthHeader}>
                  <Text style={[styles.monthName, !hasEntries && styles.monthNameEmpty]}>
                    {monthName}
                  </Text>
                  <Text style={[styles.monthHours, !hasEntries && styles.monthHoursEmpty]}>
                    {hasEntries ? formatHours(monthData.totalHours) : '0:00h'}
                  </Text>
                </View>
                
                <View style={styles.monthDetails}>
                  <Text style={[styles.monthEntries, !hasEntries && styles.monthEntriesEmpty]}>
                    {monthData.entries.length} Arbeitstage
                  </Text>
                  
                  {hasEntries && (
                    <TouchableOpacity
                      style={styles.monthPdfButton}
                      onPress={() => handleGenerateMonthlyPDF(index)}
                    >
                      <Icon name="document-text" size={16} color={colors.primary} />
                      <Text style={styles.monthPdfText}>PDF</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {availableYears.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Noch keine Arbeitszeiten erfasst.
            </Text>
            <Text style={styles.emptySubtext}>
              Erfassen Sie Ihre erste Arbeitszeit, um die Übersicht zu sehen.
            </Text>
            <Link href="/" asChild>
              <Button
                text="Arbeitszeit erfassen"
                onPress={() => {}}
                style={styles.emptyButton}
              />
            </Link>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  yearSelector: {
    padding: 20,
    backgroundColor: colors.backgroundAlt,
    marginBottom: 20,
  },
  yearTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  yearStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalHours: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  pdfButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pdfButtonText: {
    fontSize: 14,
  },
  monthsContainer: {
    paddingHorizontal: 20,
  },
  monthCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthCardEmpty: {
    backgroundColor: colors.backgroundAlt,
    opacity: 0.6,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  monthNameEmpty: {
    color: colors.textSecondary,
  },
  monthHours: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  monthHoursEmpty: {
    color: colors.textSecondary,
  },
  monthDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthEntries: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  monthEntriesEmpty: {
    color: colors.textSecondary,
  },
  monthPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 6,
  },
  monthPdfText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: colors.primary,
  },
});
