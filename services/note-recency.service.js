function dateTimestamp(value) {
    if (!value) return 0;
    const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
}

function noteActivityTimestamp(note = {}) {
    return Math.max(
        dateTimestamp(note.updatedAt),
        dateTimestamp(note.createdAt),
    );
}

function compareNotesByRecentActivity(left = {}, right = {}) {
    const pinnedOrder = Number(Boolean(right.pinned)) - Number(Boolean(left.pinned));
    if (pinnedOrder !== 0) return pinnedOrder;

    const activityOrder = noteActivityTimestamp(right) - noteActivityTimestamp(left);
    if (activityOrder !== 0) return activityOrder;

    const createdOrder = dateTimestamp(right.createdAt) - dateTimestamp(left.createdAt);
    if (createdOrder !== 0) return createdOrder;

    const leftId = left._id?.toString?.() || String(left.id || '');
    const rightId = right._id?.toString?.() || String(right.id || '');
    return rightId.localeCompare(leftId);
}

function sortNotesByRecentActivity(notes = []) {
    return [...notes].sort(compareNotesByRecentActivity);
}

module.exports = {
    noteActivityTimestamp,
    compareNotesByRecentActivity,
    sortNotesByRecentActivity,
};
