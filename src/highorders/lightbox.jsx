// @flow
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Lightbox from 'react-image-lightbox';
import type { Lightbox as LightboxState } from 'domains/Lightbox';
import type { Dispatch } from 'actions';
import style from 'styles/highorders/lightbox.css';

type AddedProps = {
  lightbox: LightboxState,
  dispatch: Dispatch,
};

type Props = AddedProps & {
  children: any,
};

const lightboxHOC:
  <T:any>(T => React$Element<*>) => (T & AddedProps) => React$Element<*>
= Component => compose(
  connect(({ lightbox }) => ({ lightbox })),
)(({ lightbox: { isOpen, images, index }, dispatch, ...props }: Props) => (
  <div className={style.my}>
    <Component {...(props: any)} />
    {isOpen &&
      <Lightbox
        mainSrc={images[index]}
        nextSrc={images[(index + 1) % images.length]}
        prevSrc={images[(index + images.length - 1) % images.length]}
        onCloseRequest={() => dispatch({ type: 'Lightbox/CLOSE' })}
        onMovePrevRequest={() => dispatch({ type: 'Lightbox/PREV' })}
        onMoveNextRequest={() => dispatch({ type: 'Lightbox/NEXT' })}
        animationDisabled
      />
    }
  </div>
));

export default lightboxHOC;
