/*
 * The app shell marks its single scrolling element with a data
 * attribute that the scroll helpers query for. These fixtures stand a
 * bare stand-in up in jsdom and tear every instance down, so one
 * test's viewport can't satisfy another test's query.
 */
export function createAppScrollViewport(): HTMLDivElement {
  const viewport = document.createElement("div");
  viewport.setAttribute("data-app-scroll-viewport", "");
  document.body.appendChild(viewport);
  return viewport;
}

export function removeAppScrollViewports(): void {
  document
    .querySelectorAll("[data-app-scroll-viewport]")
    .forEach((el) => el.remove());
}
