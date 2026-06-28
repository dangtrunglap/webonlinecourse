import { SITE_URL } from './constants/site';

const apiBaseUrl = `${SITE_URL}/api`;

export async function discoverDynamicRoutes() {
  const routes = new Set<string>();

  try {
    const [coursesResponse, postsResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/courses?page=1&pageSize=200`),
      fetch(`${apiBaseUrl}/blogposts`),
    ]);

    if (coursesResponse.ok) {
      const coursesPayload = await coursesResponse.json() as { items?: Array<{ id: string }> };
      for (const course of coursesPayload.items ?? []) {
        routes.add(`/courses/${course.id}`);
      }
    }

    if (postsResponse.ok) {
      const postsPayload = await postsResponse.json() as Array<{ id: string }>;
      for (const post of postsPayload ?? []) {
        routes.add(`/blog/${post.id}`);
      }
    }
  } catch (error) {
    console.warn('Skipping dynamic prerender routes because the API is unavailable.', error);
  }

  return routes;
}
