class SSEManager {
    constructor() {
        this.clients = new Map(); // jobId -> res
    }

    addClient(jobId, res) {
        this.clients.set(jobId, res);
        const cleanup = () => {
            this.clients.delete(jobId);
        };
        res.on('close', cleanup);
        res.on('error', cleanup);
    }

    send(jobId, data) {
        const res = this.clients.get(jobId);
        if (res && !res.writableEnded) {
            try {
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            } catch (err) {
                this.clients.delete(jobId);
            }
        }
    }

    end(jobId, data) {
        const res = this.clients.get(jobId);
        if (res && !res.writableEnded) {
            try {
                if (data) {
                    res.write(`data: ${JSON.stringify(data)}\n\n`);
                }
                res.end();
            } catch (err) {
                // Ignore
            }
            this.clients.delete(jobId);
        }
    }

    has(jobId) {
        return this.clients.has(jobId);
    }
}

module.exports = new SSEManager();
