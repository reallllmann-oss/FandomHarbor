import { NextResponse } from "next/server";

import { createWebIdentityAccess } from "../../../../lib/identity-access";
import { createHybridReaderContentGateway } from "../../../../lib/reader-content";
import { createSocialRelationshipGateway } from "../../../../lib/social-relationships";
import {
  buildPublishedWorkTxt,
  publishedWorkTxtFileName,
} from "../../../../lib/work-txt-export";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/auth/sign-in", _request.url));
  }
  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("archive:read")) {
    return NextResponse.redirect(new URL("/access", _request.url));
  }

  const { slug } = await params;
  const reader = createHybridReaderContentGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  );
  const readingData = await reader.getWork(slug);
  if (!readingData) return new NextResponse("Not found", { status: 404 });

  const [author] = await createSocialRelationshipGateway(
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getPublishedWorkAuthors([readingData.work.slug]);
  const text = buildPublishedWorkTxt({
    authorName: author?.displayName ?? "未知作者",
    chapters: readingData.chapters,
    work: readingData.work,
  });
  const fileName = publishedWorkTxtFileName(readingData.work.title);

  return new NextResponse(text, {
    headers: {
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
