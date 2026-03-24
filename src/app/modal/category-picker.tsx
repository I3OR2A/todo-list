import React from 'react';

import { PlaceholderScreen } from '@/components/app/placeholder-screen';

export default function CategoryPickerModalScreen() {
  return (
    <PlaceholderScreen
      title="Category Picker"
      description="Reserved modal route for category selection."
      highlights={[
        'Select category during task editing',
        'Support uncategorized tasks as a first-class option',
      ]}
      milestoneNote="Category query data and selection actions will be implemented with the category module."
      statusLabel="Milestone 4"
    />
  );
}
