import React from 'react';
import { type MedicationConfig } from '@/lib/taper-calculations';

interface MedicationFormConfigProps {
  config: MedicationConfig;
  onConfigChange: (config: MedicationConfig) => void;
}

const MedicationFormConfig: React.FC<MedicationFormConfigProps> = ({
  config,
  onConfigChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Basic medication info */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Unit:</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={config.unit}
            onChange={(e) => onConfigChange({ ...config, unit: e.target.value })}
            placeholder="mg, ml, etc"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Form:</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={config.form}
            onChange={(e) => onConfigChange({ ...config, form: e.target.value })}
            placeholder="pill, pump, etc"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Strength per Unit:</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={config.strengthPerUnit}
            onChange={(e) => onConfigChange({ ...config, strengthPerUnit: parseFloat(e.target.value) || 0 })}
            step="0.1"
            placeholder="2"
          />
        </div>
      </div>

      {/* Splitting configuration */}
      <div className="space-y-4">
        <div className="flex items-start gap-8">
          <div>
            <label className="block text-sm font-medium mb-2">Can Split Unit:</label>
            <input
              type="checkbox"
              className="border rounded p-2"
              checked={config.canSplit}
              onChange={(e) => onConfigChange({ 
                ...config, 
                canSplit: e.target.checked,
                // Reset to 2 divisions if turning splitting on
                splitDivisions: e.target.checked ? 2 : 1
              })}
            />
          </div>
          {config.canSplit && (
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Split into parts:</label>
              <select
                className="w-full border rounded p-2"
                value={config.splitDivisions}
                onChange={(e) => onConfigChange({ ...config, splitDivisions: parseInt(e.target.value) })}
              >
                <option value="2">Halves (2)</option>
                <option value="4">Quarters (4)</option>
              </select>
            </div>
          )}
        </div>

        {/* Visual representation of pill divisions */}
        {config.canSplit && (
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Available Dose Units:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-20">Whole {config.form}:</span>
                <span className="text-sm">{config.strengthPerUnit}{config.unit}</span>
              </div>
              {config.splitDivisions === 2 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-20">Half {config.form}:</span>
                  <span className="text-sm">{(config.strengthPerUnit/2).toFixed(1)}{config.unit}</span>
                </div>
              )}
              {config.splitDivisions === 4 && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-20">Half {config.form}:</span>
                    <span className="text-sm">{(config.strengthPerUnit/2).toFixed(1)}{config.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-20">Quarter {config.form}:</span>
                    <span className="text-sm">{(config.strengthPerUnit/4).toFixed(1)}{config.unit}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationFormConfig;