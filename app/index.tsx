
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import { useWorkTimeData } from '../hooks/useWorkTimeData';
import WorkTimeCard from '../components/WorkTimeCard';
import Button from '../components/Button';
import { Link, router } from 'expo-router';

export default function MainScreen() {
  const {
    entries,
    userSettings,
    loading,
    deleteEntry,
  } = useWorkTimeData();

  const handleDeleteEntry = (id: string) => {
    Alert.alert(
      'Eintrag löschen',
      'Möchten Sie diesen Eintrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Löschen', 
          style: 'destructive',
          onPress: () => deleteEntry(id)
        },
      ]
    );
  };

  const handleEditEntry = (entryId: string) => {
    console.log('Editing entry:', entryId);
    router.push(`/add-entry?entryId=${entryId}`);
  };

  const handleAddEntry = () => {
    console.log('Adding new entry');
    router.push('/add-entry');
  };

  const getTodaysEntries = () => {
    const today = new Date().toISOString().split('T')[0];
    return entries.filter(entry => entry.date === today);
  };

  const getRecentEntries = () => {
    return entries
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  };

  const getTotalHoursThisMonth = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return entries
      .filter(entry => entry.date.startsWith(currentMonth))
      .reduce((sum, entry) => sum + entry.totalHours, 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={commonStyles.text}>Lade Daten...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const todaysEntries = getTodaysEntries();
  const recentEntries = getRecentEntries();
  const monthlyHours = getTotalHoursThisMonth();

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>Asendorf Elektrotechnik</Text>
          <Text style={styles.subtitle}>Work Time</Text>
          
          {userSettings.userName && (
            <Text style={styles.welcomeText}>
              Willkommen, {userSettings.userName}
            </Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{monthlyHours.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Diesen Monat</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todaysEntries.length}</Text>
            <Text style={styles.statLabel}>Heute erfasst</Text>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Button
            text="+ Arbeitszeit erfassen"
            onPress={handleAddEntry}
            style={styles.primaryButton}
          />
        </View>

        <View style={styles.navigationButtons}>
          <Link href="/overview" asChild>
            <Button
              text="Jahresübersicht"
              onPress={() => {}}
              style={styles.navButton}
            />
          </Link>
          <Link href="/settings" asChild>
            <Button
              text="Einstellungen"
              onPress={() => {}}
              style={styles.navButton}
            />
          </Link>
        </View>

        {recentEntries.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Letzte Einträge</Text>
            {recentEntries.map(entry => (
              <WorkTimeCard
                key={entry.id}
                entry={entry}
                onEdit={() => handleEditEntry(entry.id)}
                onDelete={handleDeleteEntry}
              />
            ))}
          </View>
        )}

        {recentEntries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Noch keine Arbeitszeiten erfasst.
            </Text>
            <Text style={styles.emptySubtext}>
              Tippen Sie auf "Arbeitszeit erfassen" um zu beginnen.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: colors.backgroundAlt,
  },
  recentSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  },
});
