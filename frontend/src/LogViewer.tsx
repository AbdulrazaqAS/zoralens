import { useEffect, useState } from 'react';
import { handleError, handleSuccess } from './scripts/actions';

type LogType = 'LOG' | 'WARN' | 'ERROR' | 'ALL';

interface LogEntry {
  type: 'LOG' | 'WARN' | 'ERROR';
  message: string;
  source: string;
  timestamp: string;
}

const LOG_KEY = 'devLogs';

const getSavedLogs = (): LogEntry[] => {
  try {
    const saved = localStorage.getItem(LOG_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveLogs = (logs: LogEntry[]) => {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
};

const formatArgs = (args: unknown[]): string => {
  return args.map(arg => {
    try {
      return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
    } catch {
      return '[Unserializable Object]';
    }
  }).join(' ');
};

const getStackTraceSource = (): string => {
  const err = new Error();
  const stackLine = err.stack?.split('\n')[3] || '';
  const match = stackLine.match(/(https?:\/\/.*?)(:\d+:\d+)/);
  return match ? `${match[1]}${match[2]}` : 'unknown source';
};

const interceptConsole = (
  method: 'log' | 'warn' | 'error',
  logStoreRef: React.MutableRefObject<LogEntry[]>,
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  const original = console[method];

  console[method] = function (...args: unknown[]) {
    const formatted = formatArgs(args);
    const source = getStackTraceSource();
    const timestamp = new Date().toISOString();

    const entry: LogEntry = {
      type: method.toUpperCase() as LogEntry['type'],
      message: formatted,
      source,
      timestamp,
    };

    const updatedLogs = [...logStoreRef.current, entry];
    logStoreRef.current = updatedLogs;
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
    
    if (method === 'log') handleSuccess(formatted);
    else handleError(new Error(formatted));
    original.apply(console, args);
  };
};

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>(getSavedLogs());
  const [filter, setFilter] = useState<LogType>('ALL');
  const logStoreRef = { current: logs };

  useEffect(() => {
    (['log', 'warn', 'error'] as const).forEach(method =>
      interceptConsole(method, logStoreRef, setLogs)
    );
  }, []);

  const clearLogs = () => {
    logStoreRef.current = [];
    setLogs([]);
    localStorage.removeItem(LOG_KEY);
    console.log('Logs cleared.');
  };

  const filteredLogs = logs.filter(log =>
    filter === 'ALL' ? true : log.type === filter
  );

  const getColor = (type: LogType): string => {
    switch (type) {
      case 'ERROR':
        return 'text-red-400 border-red-400';
      case 'WARN':
        return 'text-yellow-300 border-yellow-300';
      case 'LOG':
        return 'text-gray-200 border-gray-500';
      default:
        return 'text-white';
    }
  };

  const filterButton = (label: LogType) => (
    <button
      key={label}
      onClick={() => setFilter(label)}
      className={`px-3 py-1 rounded border text-sm ${
        filter === label
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-gray-800 text-gray-200 border-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-4 bg-black min-h-screen text-sm text-white font-mono">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex gap-2">
          {(['ALL', 'LOG', 'WARN', 'ERROR'] as LogType[]).map(filterButton)}
        </div>
        <button
          onClick={clearLogs}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          Clear Logs
        </button>
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-gray-400">No logs to display.</p>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, i) => (
            <div
              key={i}
              className={`border-l-4 pl-2 ${getColor(log.type)}`}
            >
              <div className="font-semibold">
                [{log.timestamp}] [{log.type}]
              </div>
              <pre className="whitespace-pre-wrap break-words">
                {log.message}
              </pre>
              <div className="text-xs text-gray-500">Source: {log.source}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
