
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useWorkTimeData } from '../hooks/useWorkTimeData';
import Button from '../components/Button';
import Icon from '../components/Icon';
import TimeInput from '../components/TimeInput';

export default function SettingsScreen() {
  const { userSettings, saveUserSettings } = useWorkTimeData();
  
  const [userName, setUserName] = useState(userSettings.userName);
  const [defaultStartTime, setDefaultStartTime] = useState(userSettings.defaultStartTime);
  const [defaultEndTime, setDefaultEndTime] = useState(userSettings.defaultEndTime);
  const [defaultBreakDuration, setDefaultBreakDuration] = useState(userSettings.defaultBreakDuration.toString());

  const handleSave = async () => {
    try {
      console.log('Saving user settings...');
      await saveUserSettings({
        userName: userName.trim(),
        defaultStartTime,
        defaultEndTime,
        defaultBreakDuration: parseInt(defaultBreakDuration) || 30,
      });
      Alert.alert('Erfolg', 'Einstellungen wurden gespeichert.');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Fehler', 'Einstellungen konnten nicht gespeichert werden.');
    }
  };

  const validateTimes = (): boolean => {
    const startMinutes = timeToMinutes(defaultStartTime);
    const endMinutes = timeToMinutes(defaultEndTime);
    return endMinutes > startMinutes;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isFormValid = (): boolean => {
    return userName.trim().length > 0 && validateTimes();
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
          <Text style={commonStyles.title}>Einstellungen</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Persönliche Daten</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={commonStyles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="Ihr vollständiger Name"
              autoCapitalize="words"
            />
            <Text style={styles.helpText}>
              Dieser Name wird in den PDF-Berichten angezeigt.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Standard Arbeitszeiten</Text>
          
          <View style={styles.timeRow}>
            <TimeInput
              label="Standard Startzeit"
              value={defaultStartTime}
              onChange={setDefaultStartTime}
              style={styles.timeInput}
            />
            <TimeInput
              label="Standard Endzeit"
              value={defaultEndTime}
              onChange={setDefaultEndTime}
              style={styles.timeInput}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pausendauer (Minuten)</Text>
            <TextInput
              style={commonStyles.input}
              value={defaultBreakDuration}
              onChangeText={setDefaultBreakDuration}
              placeholder="30"
              keyboardType="numeric"
            />
            <Text style={styles.helpText}>
              Diese Pausendauer wird automatisch abgezogen, wenn Sie eine Pause auswählen.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Asendorf Elektrotechnik Work Time</Text>
            <Text style={styles.infoText}>Version 1.0.0</Text>
            <Text style={styles.infoText}>
              Diese App hilft Ihnen dabei, Ihre Arbeitszeiten zu erfassen und 
              übersichtliche Berichte zu erstellen.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Einstellungen speichern"
            onPress={handleSave}
            style={[
              styles.saveButton,
              !isFormValid() && styles.saveButtonDisabled
            ]}
            textStyle={!isFormValid() ? styles.saveButtonTextDisabled : undefined}
          />
        </View>

        {!validateTimes() && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Die Endzeit muss nach der Startzeit liegen.
            </Text>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  infoCard: {
    backgroundColor: colors.backgroundAlt,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.grey,
  },
  saveButtonTextDisabled: {
    color: colors.textSecondary,
  },
  errorContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
  },
});
