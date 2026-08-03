// Never actually rendered — the "Publicar" tab intercepts its own press
// (see the `listeners` on its Tabs.Screen in ./_layout.tsx) and pushes to
// /annonces/new instead of switching to this tab.
export default function PublishTabPlaceholder() {
  return null;
}
