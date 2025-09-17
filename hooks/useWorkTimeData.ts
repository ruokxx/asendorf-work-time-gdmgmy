
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkTimeEntry, MonthlyData, YearlyData, UserSettings } from '../types/WorkTime';

const STORAGE_KEYS = {
  WORK_ENTRIES: 'work_entries',
  USER_SETTINGS: 'user_settings',
};

export const useWorkTimeData = () => {
  const [entries, setEntries] = useState<WorkTimeEntry[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    userName: '',
    defaultStartTime: '08:00',
    defaultEndTime: '16:30',
    defaultBreakDuration: 30,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading work time data...');
      const [entriesData, settingsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.WORK_ENTRIES),
        AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS),
      ]);

      if (entriesData) {
        setEntries(JSON.parse(entriesData));
      }

      if (settingsData) {
        setUserSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (entry: Omit<WorkTimeEntry, 'id' | 'totalHours'>) => {
    try {
      console.log('Saving work entry:', entry);
      const totalHours = calculateHours(entry.startTime, entry.endTime, entry.hasBreak);
      const newEntry: WorkTimeEntry = {
        ...entry,
        id: Date.now().toString(),
        totalHours,
      };

      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      await AsyncStorage.setItem(STORAGE_KEYS.WORK_ENTRIES, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const updateEntry = async (id: string, updatedEntry: Partial<WorkTimeEntry>) => {
    try {
      console.log('Updating work entry:', id, updatedEntry);
      const updatedEntries = entries.map(entry => {
        if (entry.id === id) {
          const updated = { ...entry, ...updatedEntry };
          if (updatedEntry.startTime || updatedEntry.endTime || updatedEntry.hasBreak !== undefined) {
            updated.totalHours = calculateHours(updated.startTime, updated.endTime, updated.hasBreak);
          }
          return updated;
        }
        return entry;
      });

      setEntries(updatedEntries);
      await AsyncStorage.setItem(STORAGE_KEYS.WORK_ENTRIES, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      console.log('Deleting work entry:', id);
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      await AsyncStorage.setItem(STORAGE_KEYS.WORK_ENTRIES, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const saveUserSettings = async (settings: UserSettings) => {
    try {
      console.log('Saving user settings:', settings);
      setUserSettings(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  };

  const calculateHours = (startTime: string, endTime: string, hasBreak: boolean): number => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    let totalMinutes = endMinutes - startMinutes;
    if (hasBreak) {
      totalMinutes -= userSettings.defaultBreakDuration;
    }
    
    return Math.max(0, totalMinutes / 60);
  };

  const getMonthlyData = (year: string, month: string): MonthlyData => {
    const monthKey = `${year}-${month.padStart(2, '0')}`;
    const monthEntries = entries.filter(entry => entry.date.startsWith(monthKey));
    const totalHours = monthEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    
    return {
      month: monthKey,
      entries: monthEntries.sort((a, b) => a.date.localeCompare(b.date)),
      totalHours,
    };
  };

  const getYearlyData = (year: string): YearlyData => {
    const months: MonthlyData[] = [];
    let totalHours = 0;

    for (let month = 1; month <= 12; month++) {
      const monthData = getMonthlyData(year, month.toString());
      months.push(monthData);
      totalHours += monthData.totalHours;
    }

    return {
      year,
      months,
      totalHours,
    };
  };

  const getAvailableYears = (): string[] => {
    const years = new Set<string>();
    entries.forEach(entry => {
      years.add(entry.date.split('-')[0]);
    });
    return Array.from(years).sort().reverse();
  };

  return {
    entries,
    userSettings,
    loading,
    saveEntry,
    updateEntry,
    deleteEntry,
    saveUserSettings,
    getMonthlyData,
    getYearlyData,
    getAvailableYears,
    calculateHours,
  };
};
