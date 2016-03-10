export const REQUEST_RESULT_UPDATE = 'REQUEST_RESULT_UPDATE';
export const REQUEST_RESULTS_UPDATE = 'REQUEST_RESULTS_UPDATE';

export function requestResultUpdate(id, value) {
    return {
        type:       REQUEST_RESULT_UPDATE,
        id:         id,
        value:      value,
        receivedAt: Date.now()
    };
}

export function requestResultsUpdate(obj) {
    return {
        type:       REQUEST_RESULTS_UPDATE,
        obj:        obj,
        receivedAt: Date.now()
    };
}