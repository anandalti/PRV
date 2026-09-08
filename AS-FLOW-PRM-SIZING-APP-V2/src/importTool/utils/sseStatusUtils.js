export const parseSseEventPayload = (payload) => {
    if (!payload || payload === 'undefined') return null;

    if (typeof payload === 'object') {
        return payload;
    }

    if (typeof payload === 'string') {
        const trimmed = payload.trim();
        if (!trimmed) return null;

        try {
            return JSON.parse(trimmed);
        } catch (error) {
            return trimmed;
        }
    }

    return payload;
};

export const getSseStatusSummary = (payload) => {
    const parsedPayload = parseSseEventPayload(payload);
    const source = typeof parsedPayload === 'object' && parsedPayload !== null ? parsedPayload : { message: parsedPayload };
    const rawStatus = source.status || source.state || source.phase || source.type || '';
    const normalizedStatus = String(rawStatus || '').trim().toLowerCase();
    const message = source.message || source.detail || source.error || source.result || source.data || '';

    if (['completed', 'complete', 'success', 'succeeded'].includes(normalizedStatus)) {
        return {
            phase: 'completed',
            title: 'Completed',
            message: typeof message === 'string' && message ? message : 'The Oracle job completed successfully.',
            details: source.result || source.data || null,
            isFinal: true
        };
    }

    if (['failed', 'failure', 'error', 'rejected', 'cancelled', 'canceled'].includes(normalizedStatus)) {
        return {
            phase: 'failed',
            title: 'Failed',
            message: typeof message === 'string' && message ? message : 'The Oracle job failed.',
            details: source.error || source.details || source.message || null,
            isFinal: true
        };
    }

    if (normalizedStatus === 'connected') {
        return {
            phase: 'connected',
            title: 'Waiting for Oracle response…',
            message: typeof message === 'string' && message ? message : 'Waiting for Oracle response…',
            details: null,
            isFinal: false
        };
    }

    if (normalizedStatus === 'submitted') {
        return {
            phase: 'submitted',
            title: 'Submitted',
            message: typeof message === 'string' && message ? message : 'Submitted. Waiting for Oracle response…',
            details: null,
            isFinal: false
        };
    }

    return {
        phase: normalizedStatus || 'waiting',
        title: 'Waiting for Oracle response…',
        message: typeof message === 'string' && message ? message : 'Waiting for Oracle response…',
        details: null,
        isFinal: false
    };
};
