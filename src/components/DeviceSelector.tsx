
import React from 'react';
import { Device } from '../types';
import { DEVICES } from '../constants';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

interface DeviceSelectorProps {
    selectedDevice: Device;
    onSelect: (device: Device) => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ selectedDevice, onSelect }) => {
    const phones = DEVICES.filter(d => d.type === 'phone');
    const tablets = DEVICES.filter(d => d.type === 'tablet');

    return (
        <div className="w-64 bg-white dark:bg-slate-950 border-l dark:border-slate-800 flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white">Dispositivo</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visualize em diferentes telas</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                        <Smartphone size={14} />
                        Smartphones
                    </h4>
                    <div className="space-y-2">
                        {phones.map(device => (
                            <button
                                key={device.id}
                                onClick={() => onSelect(device)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${selectedDevice.id === device.id
                                        ? 'bg-brand-blue text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                                    }`}
                            >
                                <span>{device.name}</span>
                                <span className={`text-[10px] ${selectedDevice.id === device.id ? 'text-white/70' : 'text-slate-400'}`}>
                                    {device.width}x{device.height}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                        <Tablet size={14} />
                        Tablets
                    </h4>
                    <div className="space-y-2">
                        {tablets.map(device => (
                            <button
                                key={device.id}
                                onClick={() => onSelect(device)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${selectedDevice.id === device.id
                                        ? 'bg-brand-blue text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                                    }`}
                            >
                                <span>{device.name}</span>
                                <span className={`text-[10px] ${selectedDevice.id === device.id ? 'text-white/70' : 'text-slate-400'}`}>
                                    {device.width}x{device.height}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceSelector;
