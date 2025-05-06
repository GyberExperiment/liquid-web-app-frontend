"use client"
import React from 'react';
import { Status } from './styles';

interface WorkingStatusProps {
  isWorking: boolean;
}

const WorkingStatus = ({isWorking}: WorkingStatusProps) => {
  return (
    <Status isWorking={isWorking}>{isWorking ? "WORK" : "DISABLED"}</Status>
  );
};

export default WorkingStatus;