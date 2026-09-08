import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSseEventPayload, getSseStatusSummary } from './sseStatusUtils.js';

test('parseSseEventPayload parses JSON payloads', () => {
    assert.deepEqual(parseSseEventPayload('{"status":"completed","result":{"orderId":"A1"}}'), {
        status: 'completed',
        result: { orderId: 'A1' }
    });
});

test('getSseStatusSummary maps completed and failed states', () => {
    const completed = getSseStatusSummary({ status: 'completed', result: { orderId: 'A1' } });
    const failed = getSseStatusSummary({ status: 'failed', error: { message: 'Oracle rejected the order' } });

    assert.equal(completed.phase, 'completed');
    assert.equal(completed.title, 'Completed');
    assert.equal(failed.phase, 'failed');
    assert.equal(failed.title, 'Failed');
});
