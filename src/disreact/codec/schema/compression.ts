import {$a, $at, $b, $blockquote, $br, $code, $details, $h1, $h2, $h3, $i, $li, $mask, $ol, $p, $pre, $s, $small, $timestamp, $u, $ul} from '#src/disreact/codec/abstract/dfmd.ts';
import {$actions, $author, $channels, $danger, $default, $dialog, $embed, $emoji, $field, $footer, $image, $link, $mentions, $message, $modal, $option, $premium, $primary, $roles, $secondary, $select, $success, $text, $textarea, $thumbnail, $users, $video} from '#src/disreact/codec/abstract/dtml.ts';
import * as Array from 'effect/Array';
import {decodeSync, encodeSync, transformLiterals} from 'effect/Schema';



export const TagCompression = transformLiterals(
  ...Array.map([
      $a,
      $at,
      $mask,
      $timestamp,
      $p,
      $br,
      $b,
      $i,
      $u,
      $s,
      $details,
      $code,
      $pre,
      $blockquote,
      $h1,
      $h2,
      $h3,
      $small,
      $ol,
      $ul,
      $li,
      $emoji,
      $message,
      $actions,
      $primary,
      $secondary,
      $success,
      $danger,
      $link,
      $premium,
      $select,
      $option,
      $users,
      $roles,
      $channels,
      $mentions,
      $default,
      $embed,
      $image,
      $footer,
      $field,
      $author,
      $video,
      $thumbnail,
      $modal,
      $dialog,
      $text,
      $textarea,
    ] as const,
    (tag, idx) => [`${idx}`, tag] as const,
  ),
);

export const encodeTagCompression = encodeSync(TagCompression);
export const decodeTagCompression = decodeSync(TagCompression);
