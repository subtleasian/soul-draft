// conversationReducer.js (Updated to match complete guided conversation flow)

export const initialConversationState = {
  state: "CATEGORY_SELECTION", // initial state now starts at category selection
  selectedCategory: null,
  currentPromptId: null,
  currentOption: null,
  reflections: [],
  identityNodes: [],
  threadId: null,
  stepsCompleted: 0,
  tokensEarned: 0,
  completed: false,
  currentFollowUpPrompt: null // New state to hold the follow-up prompt
};

export function conversationReducer(state, action) {
  switch (action.type) {
    case "START_CONVERSATION":
      return {
        ...initialConversationState,
        threadId: action.threadId || crypto.randomUUID(),
      };

    case "SELECT_CATEGORY":
      return {
        ...state,
        state: "MULTIPLE_CHOICE_PROMPT",
        selectedCategory: action.category,
      };

    case "ANSWER_MULTIPLE_CHOICE":
      return {
        ...state,
        state: "REFLECTION_PROMPT",
        currentPromptId: action.promptId,
        currentOption: action.option,
        stepsCompleted: state.stepsCompleted + 1,
        tokensEarned: state.tokensEarned + 10 // Tokens for answering prompt
      };

    case "PAUSE_CONVERSATION":
      return {
        ...state,
        state: "SUMMARY_REWARD_SCREEN",
        completed: true
      };

    case "SUBMIT_REFLECTION":
      return {
        ...state,
        state: "AI_INSIGHT",
        reflections: [...state.reflections, action.reflection]
      };

    case "ADD_IDENTITY_NODE":
      return {
        ...state,
        identityNodes: [...state.identityNodes, action.node],
        currentFollowUpPrompt: action.node.followUpPrompt || null,
        stepsCompleted: state.stepsCompleted + 1,
        tokensEarned: state.tokensEarned + (action.node.tokenReward || 0),
        state: action.node.followUpPrompt ? "FOLLOW_UP_PROMPT" : "AI_INSIGHT"
      };


    case "RECEIVE_AI_INSIGHT": {
      const { identityNode } = action;
      const reward = identityNode.tokenReward || 0;
      return {
        ...state,
        identityNodes: [...state.identityNodes, identityNode],
        tokensEarned: state.tokensEarned + reward,
        state: "FOLLOW_UP_PROMPT",
        currentFollowUpPrompt: identityNode.followUpPrompt
      };
    }

    case "ANSWER_FOLLOW_UP_REFLECTION":
      return {
        ...state,
        state: "AI_INSIGHT",
        reflections: [...state.reflections, action.reflection],
        stepsCompleted: state.stepsCompleted + 1
      };

    default:
      return state;
  }
}