// Debug utility for the plugin

export class DebugLogger {
    private static instance: DebugLogger;
    private debugEnabled = false;
    private logElement: HTMLElement | null = null;

    private constructor() {
        // Private constructor to enforce singleton
    }

    public static getInstance(): DebugLogger {
        if (!DebugLogger.instance) {
            DebugLogger.instance = new DebugLogger();
        }
        return DebugLogger.instance;
    }

    public enable(enabled: boolean): void {
        this.debugEnabled = enabled;
        console.log(`Debug logging ${enabled ? 'enabled' : 'disabled'}`);
    }

    public setLogElement(element: HTMLElement): void {
        this.logElement = element;
        this.logElement.empty();
        this.logElement.style.display = this.debugEnabled ? 'block' : 'none';
    }

    private getTimestamp(): string {
        return new Date().toISOString().split('T')[1].split('.')[0];
    }

    public log(message: string, data?: unknown): void {
        if (!this.debugEnabled) return;

        const timestamp = this.getTimestamp();

        // Log to console
        if (data) {
            console.log(`[Timesheet] ${timestamp} - ${message}`, data);
        } else {
            console.log(`[Timesheet] ${timestamp} - ${message}`);
        }

        // Log to UI if element exists
        if (this.logElement) {
            const logEntry = document.createElement('div');
            logEntry.className = 'timesheet-debug-log-entry';

            const timestampSpan = document.createElement('span');
            timestampSpan.className = 'timesheet-debug-timestamp';
            timestampSpan.textContent = timestamp;
            logEntry.appendChild(timestampSpan);

            const messageSpan = document.createElement('span');
            messageSpan.className = 'timesheet-debug-message';
            messageSpan.textContent = ` ${message}`;
            logEntry.appendChild(messageSpan);

            if (data) {
                const dataDetails = document.createElement('details');
                dataDetails.className = 'timesheet-debug-data';

                const dataSummary = document.createElement('summary');
                dataSummary.textContent = 'Data';
                dataDetails.appendChild(dataSummary);

                const dataContent = document.createElement('pre');
                dataContent.textContent = JSON.stringify(data, null, 2);
                dataDetails.appendChild(dataContent);

                logEntry.appendChild(dataDetails);
            }

            this.logElement.appendChild(logEntry);

            // Auto-scroll to bottom
            this.logElement.scrollTop = this.logElement.scrollHeight;
        }
    }

    public clear(): void {
        if (this.logElement) {
            this.logElement.empty();
        }
    }
}

