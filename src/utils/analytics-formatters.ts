/**
 * Utility functions for formatting analytics data for display
 */

/**
 * Format interaction type for display
 * For section_view interactions, returns the section name
 * For other interactions, returns formatted interaction type
 */
export function formatInteractionDisplay(
  interactionType: string,
  sectionName?: string | null
): string {
  // For section views, show the section name instead of "section_view"
  if (interactionType === 'section_view' && sectionName) {
    return formatSectionName(sectionName);
  }

  // For other interactions, format the interaction type
  return interactionType
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Clean up section names by removing "custom_" prefix
 * Example: "custom_ACHIEVEMENTS" -> "Achievements"
 */
export function formatSectionName(sectionName: string): string {
  // Remove "custom_" prefix if present
  const cleaned = sectionName.replace(/^custom_/i, '');
  
  // Format the section name with proper capitalization
  return cleaned
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get a descriptive label for an interaction
 * Combines interaction type and additional context
 */
export function getInteractionLabel(
  interactionType: string,
  sectionName?: string | null,
  targetValue?: string | null
): string {
  if (interactionType === 'section_view') {
    return `${formatSectionName(sectionName || 'Unknown')} (viewed)`;
  }

  const baseLabel = formatInteractionDisplay(interactionType, sectionName);
  
  if (targetValue) {
    return `${baseLabel}: ${targetValue}`;
  }

  return baseLabel;
}

/**
 * Group interactions by section for section_view type
 * For other types, group by interaction type
 */
export function groupInteractions(
  interactions: Array<{
    interaction_type: string;
    section_name?: string | null;
    target_value?: string | null;
  }>
): Array<{ name: string; count: number }> {
  const grouped = interactions.reduce((acc, interaction) => {
    let key: string;

    if (interaction.interaction_type === 'section_view' && interaction.section_name) {
      // For section views, group by section name
      key = formatSectionName(interaction.section_name);
    } else {
      // For other interactions, group by type
      key = formatInteractionDisplay(interaction.interaction_type, interaction.section_name);
    }

    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
