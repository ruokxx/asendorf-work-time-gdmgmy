
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, commonStyles } from '../styles/commonStyles';
import TimeInput from './TimeInput';
import Button from './Button';
import { WorkTimeEntry } from '../types/WorkTime';

interface WorkTimeFormProps {
  onSave: (entry: Omit<WorkTimeEntry, 'id' | 'totalHours'>) => void;
  initialData?: Partial<WorkTimeEntry>;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

const WorkTimeForm: React.FC<WorkTimeFormProps> = ({
  onSave,
  initialData,
  defaultStartTime = '08:00',
  defaultEndTime = '16:30',
}) => {
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialData?.startTime || defaultStartTime);
  const [endTime, setEndTime] = useState(initialData?.endTime || defaultEndTime);
  const [hasBreak, setHasBreak] = useState(initialData?.hasBreak || false);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleSave = () => {
    if (!date || !startTime || !endTime) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      Alert.alert('Fehler', 'Die Endzeit muss nach der Startzeit liegen.');
      return;
    }

    console.log('Saving work time entry:', { date, startTime, endTime, hasBreak, notes });

    onSave({
      date,
      startTime,
      endTime,
      hasBreak,
      notes,
    });

    // Reset form
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime(defaultStartTime);
    setEndTime(defaultEndTime);
    setHasBreak(false);
    setNotes('');
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={commonStyles.subtitle}>Arbeitszeit erfassen</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Datum</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={new Date(date + 'T00:00:00')}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.timeRow}>
          <TimeInput
            label="Startzeit"
            value={startTime}
            onChange={setStartTime}
            style={styles.timeInput}
          />
          <TimeInput
            label="Endzeit"
            value={endTime}
            onChange={setEndTime}
            style={styles.timeInput}
          />
        </View>

        <TouchableOpacity
          style={styles.breakToggle}
          onPress={() => setHasBreak(!hasBreak)}
        >
          <View style={[styles.checkbox, hasBreak && styles.checkboxChecked]}>
            {hasBreak && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.breakText}>30 Minuten Pause</Text>
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notizen (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Zusätzliche Informationen..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Button
          text="Arbeitszeit speichern"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    padding: 20,
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
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
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
  breakToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  breakText: {
    fontSize: 16,
    color: colors.text,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
    minHeight: 80,
  },
  saveButton: {
    marginTop: 10,
  },
});

export default WorkTimeForm;
