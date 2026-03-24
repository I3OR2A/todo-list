import { useSQLiteContext } from 'expo-sqlite';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text, TextInput } from 'react-native-paper';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { InfoCard } from '@/components/app/info-card';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { Spacing } from '@/constants/theme';
import { exportTasks } from '@/modules/export/usecases/export-tasks';
import { type ExportType } from '@/modules/export/domain/export.types';
import { shareExportFile } from '@/modules/export/usecases/share-export-file';
import { combineDateAndTime } from '@/shared/utils/datetime';

const EXPORT_TYPES: ExportType[] = ['all', 'range', 'completed_only'];

export default function ExportScreen() {
  const database = useSQLiteContext();
  const [exportType, setExportType] = useState<ExportType>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [lastExportUri, setLastExportUri] = useState<string | null>(null);
  const [lastExportSummary, setLastExportSummary] = useState<{
    categories: number;
    reminders: number;
    subTasks: number;
    tasks: number;
  } | null>(null);

  const exportDescription = useMemo(() => {
    switch (exportType) {
      case 'completed_only':
        return 'Export only completed tasks and their related subtasks/reminders.';
      case 'range':
        return 'Export tasks whose due date falls inside the selected date range.';
      case 'all':
      default:
        return 'Export all tasks, including trashed items, plus categories and app settings.';
    }
  }, [exportType]);

  async function handleExport() {
    const rangeFrom =
      exportType === 'range' && dateFrom ? combineDateAndTime(dateFrom, '00:00') : undefined;
    const rangeTo =
      exportType === 'range' && dateTo ? combineDateAndTime(dateTo, '23:59') : undefined;

    if (exportType === 'range' && (!rangeFrom || !rangeTo)) {
      setError('Range export requires valid start and end dates in YYYY-MM-DD format.');
      return;
    }

    try {
      setError(null);
      setIsExporting(true);
      const result = await exportTasks(database, {
        dateFrom: rangeFrom ?? undefined,
        dateTo: rangeTo ?? undefined,
        exportType,
      });
      setLastExportUri(result.fileUri);
      setLastExportSummary({
        categories: result.payload.categories.length,
        reminders: result.payload.task_reminders.length,
        subTasks: result.payload.task_sub_items.length,
        tasks: result.payload.tasks.length,
      });
    } catch (exportError) {
      const message = exportError instanceof Error ? exportError.message : 'Failed to export tasks.';
      setError(message);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleShareLastExport() {
    if (!lastExportUri) {
      return;
    }

    try {
      setError(null);
      setIsSharing(true);
      await shareExportFile(lastExportUri);
    } catch (shareError) {
      const message = shareError instanceof Error ? shareError.message : 'Failed to open the share sheet.';
      setError(message);
    } finally {
      setIsSharing(false);
    }
  }

  if (error && !lastExportUri) {
    return (
      <ErrorStateScreen
        title="Unable to export data"
        message={error}
        retryLabel="Retry export"
        onRetry={handleExport}
      />
    );
  }

  return (
    <ScreenShell
      title="Export"
      subtitle="Generate a stable JSON payload with schema version and write it to the app document directory.">
      {error ? (
        <InfoCard>
          <Text variant="bodyLarge">{error}</Text>
        </InfoCard>
      ) : null}

      <InfoCard>
        <Text variant="titleMedium">Export scope</Text>
        <View style={styles.chipGroup}>
          {EXPORT_TYPES.map((option) => (
            <Chip
              key={option}
              mode={exportType === option ? 'flat' : 'outlined'}
              onPress={() => setExportType(option)}>
              {option}
            </Chip>
          ))}
        </View>
        <Text variant="bodyLarge">{exportDescription}</Text>
      </InfoCard>

      {exportType === 'range' ? (
        <InfoCard>
          <Text variant="titleMedium">Date range</Text>
          <View style={styles.inlineRow}>
            <TextInput
              autoCapitalize="none"
              label="Date from"
              mode="outlined"
              placeholder="2026-03-21"
              style={styles.flexField}
              value={dateFrom}
              onChangeText={setDateFrom}
            />
            <TextInput
              autoCapitalize="none"
              label="Date to"
              mode="outlined"
              placeholder="2026-03-21"
              style={styles.flexField}
              value={dateTo}
              onChangeText={setDateTo}
            />
          </View>
        </InfoCard>
      ) : null}

      <InfoCard>
        <Text variant="titleMedium">Payload format</Text>
        <Text variant="bodyLarge">schema_version: 1.0.0</Text>
        <Text variant="bodyLarge">top-level keys: tasks, task_sub_items, task_reminders, categories, app_settings</Text>
      </InfoCard>

      {lastExportSummary ? (
        <InfoCard>
          <Text variant="titleMedium">Last export</Text>
          <Text variant="bodyLarge">Tasks: {lastExportSummary.tasks}</Text>
          <Text variant="bodyLarge">Subtasks: {lastExportSummary.subTasks}</Text>
          <Text variant="bodyLarge">Reminders: {lastExportSummary.reminders}</Text>
          <Text variant="bodyLarge">Categories: {lastExportSummary.categories}</Text>
          <Text variant="bodyLarge">File: {lastExportUri}</Text>
        </InfoCard>
      ) : null}

      <PrimaryButton
        label={isExporting ? 'Exporting...' : 'Export JSON'}
        disabled={isExporting}
        onPress={handleExport}
      />
      {lastExportUri ? (
        <PrimaryButton
          label={isSharing ? 'Opening Share Sheet...' : 'Share Last Export'}
          disabled={isExporting || isSharing}
          onPress={handleShareLastExport}
          variant="secondary"
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  flexField: {
    flex: 1,
    minWidth: 0,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
