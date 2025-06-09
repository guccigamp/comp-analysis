/**
 * Normalize a tag by converting to lowercase and trimming whitespace
 * @param {string} tag - The tag to normalize
 * @returns {string} Normalized tag
 */
export const normalizeTag = (tag) => {
    return tag.toLowerCase().trim();
};

/**
 * Normalize an array of tags
 * @param {string[]} tags - Array of tags to normalize
 * @returns {string[]} Array of normalized tags
 */
export const normalizeTags = (tags) => {
    return tags.map(normalizeTag);
};

/**
 * Remove duplicate tags from an array
 * @param {string[]} tags - Array of tags
 * @returns {string[]} Array of unique tags
 */
export const removeDuplicateTags = (tags) => {
    return [...new Set(normalizeTags(tags))];
};

/**
 * Check if two arrays of tags have any common tags
 * @param {string[]} tags1 - First array of tags
 * @param {string[]} tags2 - Second array of tags
 * @returns {boolean} True if there are any common tags
 */
export const hasCommonTags = (tags1, tags2) => {
    const normalizedTags1 = new Set(normalizeTags(tags1));
    return normalizeTags(tags2).some((tag) => normalizedTags1.has(tag));
};

/**
 * Filter facilities by tags
 * @param {Object[]} facilities - Array of facility objects
 * @param {string[]} tags - Array of tags to filter by
 * @param {boolean} matchAll - If true, facility must have all tags; if false, facility must have any of the tags
 * @returns {Object[]} Filtered array of facilities
 */
export const filterFacilitiesByTags = (facilities, tags, matchAll = false) => {
    if (!tags || tags.length === 0) return facilities;

    const normalizedFilterTags = normalizeTags(tags);

    return facilities.filter((facility) => {
        const facilityTags = normalizeTags(facility.tags || []);
        return matchAll
            ? normalizedFilterTags.every((tag) => facilityTags.includes(tag))
            : normalizedFilterTags.some((tag) => facilityTags.includes(tag));
    });
};

/**
 * Get tag statistics from an array of facilities
 * @param {Object[]} facilities - Array of facility objects
 * @returns {Object} Object containing tag counts and related statistics
 */
export const getTagStatistics = (facilities) => {
    const tagCounts = {};
    const tagFacilityMap = {};
    let totalTags = 0;
    let facilitiesWithTags = 0;

    facilities.forEach((facility) => {
        const tags = facility.tags || [];
        if (tags.length > 0) {
            facilitiesWithTags++;
        }

        tags.forEach((tag) => {
            const normalizedTag = normalizeTag(tag);
            tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
            totalTags++;

            if (!tagFacilityMap[normalizedTag]) {
                tagFacilityMap[normalizedTag] = new Set();
            }
            tagFacilityMap[normalizedTag].add(facility._id.toString());
        });
    });

    // Convert tagFacilityMap to counts
    const tagFacilityCounts = Object.fromEntries(
        Object.entries(tagFacilityMap).map(([tag, facilities]) => [
            tag,
            facilities.size,
        ])
    );

    return {
        tagCounts,
        tagFacilityCounts,
        totalTags,
        totalUniqueTags: Object.keys(tagCounts).length,
        facilitiesWithTags,
        totalFacilities: facilities.length,
        averageTagsPerFacility:
            facilitiesWithTags > 0 ? totalTags / facilitiesWithTags : 0,
    };
};
