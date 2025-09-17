
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { WorkTimeEntry } from '../types/WorkTime';
import Icon from './Icon';

interface WorkTimeCardProps {
  entry: WorkTimeEntry;
  onEdit?: (entry: WorkTimeEntry) => void;
  onDelete?: (id: string) => void;
}

const WorkTimeCard: React.FC<WorkTimeCardProps> = ({ entry, onEdit, onDelete }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}h`;
  };

  return (
    <View style={[commonStyles.card, styles.card]}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
          <Text style={styles.hours}>{formatHours(entry.totalHours)}</Text>
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(entry)}
            >
              <Icon name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(entry.id)}
            >
              <Icon name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>
          {entry.startTime} - {entry.endTime}
        </Text>
        {entry.hasBreak && (
          <View style={styles.breakBadge}>
            <Text style={styles.breakText}>30min Pause</Text>
          </View>
        )}
      </View>
      
      {entry.notes && (
        <Text style={styles.notes}>{entry.notes}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  hours: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  breakBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  breakText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default WorkTimeCard;
