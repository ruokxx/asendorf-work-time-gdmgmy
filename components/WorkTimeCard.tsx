
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import { WorkTimeEntry } from '../types/WorkTime';

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
    return `${hours.toFixed(1)}h`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.dateSection}>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
          <Text style={styles.hours}>{formatHours(entry.totalHours)}</Text>
        </View>
        
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>
            {entry.startTime} - {entry.endTime}
          </Text>
          {entry.hasBreak && (
            <Text style={styles.breakText}>30 Min Pause</Text>
          )}
        </View>
        
        {entry.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesText} numberOfLines={2}>
              {entry.notes}
            </Text>
          </View>
        )}
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
            <Icon name="trash" size={20} color={colors.error || '#ff4444'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  hours: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  timeSection: {
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  breakText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default WorkTimeCard;
