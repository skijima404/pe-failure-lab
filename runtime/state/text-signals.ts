export function hasExplicitQuestion(text: string): boolean {
  return text.includes("?");
}

export function hasImplicitClarificationNeed(text: string): boolean {
  return /i still need|need a clearer|need a practical sense|need to understand|still unclear|not yet clear/i.test(text);
}

export function isSupportiveAcknowledgment(text: string): boolean {
  return /that helps|good[\.,!]|i can support|directionally helpful|i can react to that/i.test(text);
}

export function isBoundedNextStepSignal(text: string): boolean {
  return (
    /support shaping the next step|shape the next step|next step after this meeting|support the next step from here/i.test(text) &&
    isSupportiveAcknowledgment(text)
  );
}
