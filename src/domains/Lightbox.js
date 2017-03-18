// @flow
import type { Reducer } from 'redux';
import { pipe } from 'ramda';
import type { Action } from 'actions';

export type ImagePath = string;

export type Lightbox = {
  isOpen: boolean,
  images: ImagePath[],
  index: number,
};

export const create:
  void => Lightbox
= () => ({ isOpen: false, images: [], index: 0 });

export const open:
  Lightbox => Lightbox
= x => ({ ...x, isOpen: true });

export const set:
  (ImagePath[], number) => Lightbox => Lightbox
= (images, index) => x => ({ ...x, images, index });

export const next:
  Lightbox => Lightbox
= x => ({ ...x, index: (x.index + 1) % x.images.length });

export const prev:
  Lightbox => Lightbox
= x => ({ ...x, index: (x.index + x.images.length - 1) % x.images.length });

export const reducer:
  Reducer<Lightbox, Action>
= (state = create(), action) => {
  switch (action.type) {
    case 'Lightbox/OPEN':
      return pipe(
        open,
        set(action.images, action.index),
      )(state);
    case 'Lightbox/NEXT':
      return next(state);
    case 'Lightbox/PREV':
      return prev(state);
    case 'Lightbox/CLOSE':
      return create();
    default:
      return state;
  }
};
