import type { Permission } from 'react-native-health-connect';

export const STEP_READ_PERMISSION: Permission = {
  accessType: 'read',
  recordType: 'Steps',
};

export const hasStepReadPermission = (
  permissions: ReadonlyArray<Permission | { accessType: string; recordType: string }>
): boolean =>
  permissions.some(
    (permission) =>
      permission.accessType === STEP_READ_PERMISSION.accessType &&
      permission.recordType === STEP_READ_PERMISSION.recordType
  );
