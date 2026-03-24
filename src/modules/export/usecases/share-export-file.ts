import * as Sharing from 'expo-sharing';

export async function shareExportFile(fileUri: string) {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    throw new Error('Share sheet is not available on this device.');
  }

  await Sharing.shareAsync(fileUri, {
    dialogTitle: 'Share Todo Export',
    mimeType: 'application/json',
    UTI: 'public.json',
  });
}
