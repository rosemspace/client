const resolveView = (path, importCallback) =>
  typeof path === "string" ? () => importCallback(path) : path;

export default function resolveViews(routes, importCallback) {
  for (const route of routes) {
    if (route.component) {
      const path = route.component;
      route.component = resolveView(path, importCallback);
    } else if (route.components) {
      for (const [name, path] of Object.entries(route.components)) {
        route.components[name] = resolveView(path, importCallback);
      }
    }

    if (route.children) {
      resolveViews(route.children, importCallback);
    }
  }
  return routes;
}
