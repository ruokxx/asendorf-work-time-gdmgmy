
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useWorkTimeData } from '../hooks/useWorkTimeData';
import WorkTimeForm, { WorkTimeFormRef } from '../components/WorkTimeForm';
import Button from '../components/Button';

export default function AddEntryScreen() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const {
    entries,
    userSettings,
    loading,
    saveEntry,
    updateEntry,
  } = useWorkTimeData();

  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<WorkTimeFormRef>(null);

  // Find existing entry if editing
  const existingEntry = entryId ? entries.find(entry => entry.id === entryId) : undefined;
  const isEditing = !!existingEntry;

  const handleSaveEntry = async (entryData: any) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      if (isEditing && existingEntry) {
        console.log('Updating existing entry:', entryId, entryData);
        await updateEntry(existingEntry.id, entryData);
        Alert.alert('Erfolg', 'Arbeitszeit wurde erfolgreich aktualisiert.');
      } else {
        console.log('Creating new entry:', entryData);
        await saveEntry(entryData);
        Alert.alert('Erfolg', 'Arbeitszeit wurde erfolgreich gespeichert.');
      }
      router.back();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Fehler', 'Arbeitszeit konnte nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleSaveButtonPress = () => {
    if (formRef.current) {
      formRef.current.save();
    }
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

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <Button
          text="Schließen"
          onPress={handleClose}
          style={styles.closeButton}
          textStyle={styles.closeButtonText}
        />
        <Text style={styles.headerTitle}>
          {isEditing ? 'Arbeitszeit bearbeiten' : 'Arbeitszeit erfassen'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <WorkTimeForm
          ref={formRef}
          onSave={handleSaveEntry}
          initialData={existingEntry}
          defaultStartTime={userSettings.defaultStartTime}
          defaultEndTime={userSettings.defaultEndTime}
          showSaveButton={false}
        />
        
        <View style={styles.buttonContainer}>
          <Button
            text={isSaving ? 'Speichert...' : (isEditing ? 'Änderungen speichern' : 'Arbeitszeit speichern')}
            onPress={handleSaveButtonPress}
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          />
        </View>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  closeButton: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 80,
  },
  content: {
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
});
