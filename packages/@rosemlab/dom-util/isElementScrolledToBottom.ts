export default function isElementScrolledToBottom(element: Element): boolean {
  return element.scrollHeight - element.scrollTop === element.clientHeight
}
