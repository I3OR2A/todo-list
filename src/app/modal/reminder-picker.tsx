import React from 'react';

import { PlaceholderScreen } from '@/components/app/placeholder-screen';

export default function ReminderPickerModalScreen() {
  return (
    <PlaceholderScreen
      title="Reminder Picker"
      description="Reserved modal route for reminder editing."
      highlights={[
        'Manage multiple reminder timestamps per task',
        'Prepare the values later used by notification scheduling',
      ]}
      milestoneNote="Reminder form behavior and local notification scheduling are handled in a later milestone, so this modal remains a styled placeholder."
      statusLabel="Milestone 5"
    />
  );
}
