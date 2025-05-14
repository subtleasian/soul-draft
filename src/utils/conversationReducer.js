// utils/conversationReducer.js

export const initialConversationState = {
  selectedPrompt: null
};

export function conversationReducer(state, action) {
  switch (action.type) {
    case "SELECT_PROMPT":
      return {
        ...state,
        selectedPrompt: action.promptText
      };

    case "RESET_FLOW":
      return initialConversationState;

    default:
      return state;
  }
}
