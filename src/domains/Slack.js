// @flow
import * as request from 'utils/request';

export type SlackIncoming = string;
type ChannelID = string;
type TimeStamp = string;
type EpochTime = number;
type Color = string;
type Uri = string;

export type Attachment = {
  fallback: string,
  color?: Color,
  pretext?: string,
  author_name?: string,
  author_link?: Uri,
  author_icon?: Uri,
  title?: string,
  title_link?: Uri,
  text?: string,
  fields?: Array<{
    title: string,
    value: string,
    short: boolean
  }>,
  image_url?: Uri,
  thumb_url?: Uri,
  footer?: string,
  footer_icon?: Uri,
  ts?: EpochTime,
};

export type Message = {
  text?: string,
  attachments?: Attachment[];
};

export type MessageResponce = {
  ok: boolean,
  channel: ChannelID,
  ts: TimeStamp,
  message: Message,
};

const post = request.post();

export const postMessage:
  SlackIncoming => Message => Promise<MessageResponce>
= post;
