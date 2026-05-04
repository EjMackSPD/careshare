type SluggedDoc = {
  slug?: string | null;
};

async function getRevalidatePath() {
  try {
    const cache = await import("next/cache.js");
    return cache.revalidatePath;
  } catch {
    return null;
  }
}

function tryRevalidatePath(revalidatePath: ((path: string) => void) | null, path: string) {
  if (!revalidatePath) {
    return;
  }

  try {
    revalidatePath(path);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("static generation store missing")
    ) {
      return;
    }

    throw error;
  }
}

export async function revalidatePagePath(doc: SluggedDoc) {
  if (!doc.slug) {
    return;
  }

  const revalidatePath = await getRevalidatePath();

  if (!revalidatePath) {
    return;
  }

  const path = doc.slug === "home" ? "/" : `/${doc.slug}`;
  tryRevalidatePath(revalidatePath, path);
  tryRevalidatePath(revalidatePath, "/sitemap.xml");
}

export async function revalidatePostPath(doc: SluggedDoc) {
  if (!doc.slug) {
    return;
  }

  const revalidatePath = await getRevalidatePath();

  if (!revalidatePath) {
    return;
  }

  tryRevalidatePath(revalidatePath, "/blog");
  tryRevalidatePath(revalidatePath, `/blog/${doc.slug}`);
  tryRevalidatePath(revalidatePath, "/sitemap.xml");
}
