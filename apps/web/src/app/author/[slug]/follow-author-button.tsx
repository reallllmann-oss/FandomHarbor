"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { setAuthorFollowState, type FollowAuthorActionState } from "./actions";

function SubmitButton({ isFollowing }: { isFollowing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-label={isFollowing ? "取消关注作者" : "关注作者"}
      className="author-follow-action"
      disabled={pending}
      name="intent"
      type="submit"
      value={isFollowing ? "unfollow" : "follow"}
    >
      {pending ? "处理中…" : isFollowing ? "已关注 · 取消" : "关注作者"}
    </button>
  );
}

export function FollowAuthorButton({
  authorSlug,
  authorUserId,
  isFollowing,
}: {
  authorSlug: string;
  authorUserId: string;
  isFollowing: boolean;
}) {
  const action = setAuthorFollowState.bind(null, authorUserId, authorSlug);
  const [state, formAction] = useActionState<FollowAuthorActionState, FormData>(
    action,
    {},
  );
  return (
    <form action={formAction}>
      <SubmitButton isFollowing={isFollowing} />
      {state.error ? (
        <p className="mt-2 max-w-xs text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
