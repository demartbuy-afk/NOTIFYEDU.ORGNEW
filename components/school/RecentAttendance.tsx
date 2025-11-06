import React from 'react';
import { AttendanceLog } from '../../types';

interface RecentAttendanceProps {
  logs: AttendanceLog[];
}

// This component is a placeholder and not currently used by the School dashboard.
// The Student dashboard uses a different component with the same name.
const RecentAttendance: React.FC<RecentAttendanceProps> = ({ logs }) => {
  return null;
};

export default RecentAttendance;
