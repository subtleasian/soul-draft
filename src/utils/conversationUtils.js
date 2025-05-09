export function inferIdentityTraitsFromInput(userText = "", selectedOption = "") {
    const lowerText = userText.toLowerCase();
    // same logic from earlier message
  }
  
  export function generateConversationFlowTemplate({
    selectedOption,
    inferredTrait = "resilience",
    inferredTheme = "belonging",
    dominantEmotion = "curiosity"
  }) {
    return {
      acknowledgment: `That’s a meaningful choice. Thanks for naming something like "${selectedOption}".`,
      reflectionPrompt: `Want to share what "${selectedOption}" looked like for you?`,
      followUpIfSkipped: `No pressure. Want help naming what "${selectedOption}" might have shaped in you?`,
      insightTemplate: `This may have shaped your ${inferredTrait} or your relationship with ${inferredTheme}.`,
      timeCheckPrompt: `Pause here or go one layer deeper into your ${dominantEmotion}?`
    };
  }